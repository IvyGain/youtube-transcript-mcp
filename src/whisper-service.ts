import { spawn } from 'child_process';
import { promises as fs } from 'fs';
import { createReadStream } from 'fs';
import path from 'path';
import os from 'os';
import youtubedl from 'youtube-dl-exec';
import OpenAI from 'openai';
// @ts-ignore
import ffmpeg from 'ffmpeg-static';

interface WhisperResult {
  text: string;
  segments?: Array<{
    start: number;
    end: number;
    text: string;
  }>;
}

export class WhisperService {
  private openai: OpenAI | null = null;
  private tempDir: string;

  constructor() {
    this.tempDir = path.join(os.tmpdir(), 'youtube-transcript-mcp');
    this.ensureTempDir();
    
    // OpenAI APIキーが設定されている場合のみ初期化
    if (process.env.OPENAI_API_KEY) {
      this.openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });
    }
  }

  private async ensureTempDir(): Promise<void> {
    try {
      await fs.access(this.tempDir);
    } catch {
      await fs.mkdir(this.tempDir, { recursive: true });
    }
  }

  async downloadAudio(videoId: string): Promise<string> {
    const audioPath = path.join(this.tempDir, `${videoId}.mp3`);
    
    try {
      // 既存のファイルがあれば削除
      try {
        await fs.unlink(audioPath);
      } catch {}

      console.error(`Downloading audio for video: ${videoId}`);
      
      const options: any = {
        extractAudio: true,
        audioFormat: 'mp3',
        audioQuality: 9, // 最低品質で高速化
        output: audioPath,
        format: 'bestaudio/best',
        noCheckCertificates: true, // SSL証明書チェックを無効化
      };
      
      // ffmpeg-staticのパスが利用可能な場合は設定
      if (ffmpeg) {
        options.ffmpegLocation = ffmpeg;
      }
      
      await youtubedl.exec(`https://www.youtube.com/watch?v=${videoId}`, options);

      // ファイルが存在するか確認
      await fs.access(audioPath);
      console.error(`Audio downloaded successfully: ${audioPath}`);
      
      return audioPath;
    } catch (error) {
      console.error('Error downloading audio:', error);
      throw new Error(`Failed to download audio: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async transcribeWithOpenAI(audioPath: string): Promise<WhisperResult> {
    if (!this.openai) {
      throw new Error('OpenAI API key not configured. Please set OPENAI_API_KEY environment variable.');
    }

    try {
      console.error(`Transcribing with OpenAI Whisper: ${audioPath}`);
      
      const transcription = await this.openai.audio.transcriptions.create({
        file: createReadStream(audioPath),
        model: 'whisper-1',
        response_format: 'verbose_json',
        timestamp_granularities: ['segment'],
      });

      return {
        text: transcription.text,
        segments: transcription.segments?.map(segment => ({
          start: segment.start,
          end: segment.end,
          text: segment.text,
        })),
      };
    } catch (error) {
      console.error('Error transcribing with OpenAI:', error);
      throw new Error(`Failed to transcribe with OpenAI: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async transcribeWithLocalWhisper(audioPath: string): Promise<WhisperResult> {
    return new Promise((resolve, reject) => {
      console.error(`Transcribing with local Whisper: ${audioPath}`);
      
      // ローカルのwhisperコマンドを実行
      const whisper = spawn('whisper', [
        audioPath,
        '--model', 'base',
        '--output_format', 'json',
        '--output_dir', this.tempDir,
      ]);

      let stdout = '';
      let stderr = '';

      whisper.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      whisper.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      whisper.on('close', async (code) => {
        if (code !== 0) {
          reject(new Error(`Whisper process failed with code ${code}: ${stderr}`));
          return;
        }

        try {
          // JSONファイルを読み取り
          const basename = path.basename(audioPath, path.extname(audioPath));
          const jsonPath = path.join(this.tempDir, `${basename}.json`);
          const jsonData = await fs.readFile(jsonPath, 'utf-8');
          const result = JSON.parse(jsonData);

          resolve({
            text: result.text,
            segments: result.segments?.map((segment: any) => ({
              start: segment.start,
              end: segment.end,
              text: segment.text,
            })),
          });
        } catch (error) {
          reject(new Error(`Failed to parse Whisper output: ${error instanceof Error ? error.message : 'Unknown error'}`));
        }
      });

      whisper.on('error', (error) => {
        reject(new Error(`Failed to start Whisper process: ${error.message}`));
      });
    });
  }

  async getTranscriptWithWhisper(videoId: string, useLocal = false): Promise<WhisperResult> {
    let audioPath: string | null = null;
    
    try {
      // 1. 音声をダウンロード
      audioPath = await this.downloadAudio(videoId);
      
      // 2. Whisperで転写
      let result: WhisperResult;
      if (useLocal) {
        result = await this.transcribeWithLocalWhisper(audioPath);
      } else {
        result = await this.transcribeWithOpenAI(audioPath);
      }
      
      return result;
    } finally {
      // 3. 一時ファイルをクリーンアップ
      if (audioPath) {
        try {
          await fs.unlink(audioPath);
        } catch (error) {
          console.error('Failed to clean up audio file:', error);
        }
      }
    }
  }

  async cleanup(): Promise<void> {
    try {
      const files = await fs.readdir(this.tempDir);
      await Promise.all(
        files.map(file => 
          fs.unlink(path.join(this.tempDir, file)).catch(() => {})
        )
      );
    } catch (error) {
      console.error('Error during cleanup:', error);
    }
  }
}
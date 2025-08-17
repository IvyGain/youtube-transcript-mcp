import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { YoutubeTranscript } from 'youtube-transcript';
import { WhisperService } from './whisper-service.js';

const whisperService = new WhisperService();

const server = new Server(
  {
    name: "youtube-transcript",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// ツールリストの定義
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "get_transcript",
        description: "Get the transcript of a YouTube video using YouTube's built-in captions",
        inputSchema: {
          type: "object",
          properties: {
            videoId: {
              type: "string",
              description: "YouTube video ID or URL",
            },
            lang: {
              type: "string",
              description: "Language code for the transcript (optional, defaults to 'en')",
              default: "en"
            },
          },
          required: ["videoId"],
        },
      },
      {
        name: "get_transcript_with_whisper",
        description: "Get the transcript of a YouTube video using Whisper AI (downloads audio and transcribes)",
        inputSchema: {
          type: "object",
          properties: {
            videoId: {
              type: "string",
              description: "YouTube video ID or URL",
            },
            useLocal: {
              type: "boolean",
              description: "Use local Whisper installation instead of OpenAI API (optional, defaults to false)",
              default: false
            },
          },
          required: ["videoId"],
        },
      },
    ],
  };
});

// ツールの実行ハンドラ
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  if (request.params.name === "get_transcript") {
    // URLからvideoIdを抽出 (スコープをtry-catchの外に移動)
    let extractedId = '';
    let isLiveContent = false;
    
    try {
      if (!request.params.arguments) {
        throw new Error("Missing arguments");
      }
      const args = request.params.arguments as { videoId: string; lang?: string };
      const { videoId, lang = 'en' } = args;
      
      extractedId = videoId;
      
      if (videoId.includes('youtube.com') || videoId.includes('youtu.be')) {
        const patterns = [
          // Standard YouTube URLs
          /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/)([^&\n?#]+)/,
          // YouTube LIVE URLs
          /(?:youtube\.com\/live\/)([^&\n?#]+)/,
          // Direct video ID
          /^([a-zA-Z0-9_-]{11})$/
        ];
        
        // Check if it's a live URL
        if (videoId.includes('/live/')) {
          isLiveContent = true;
        }
        
        for (const pattern of patterns) {
          const match = videoId.match(pattern);
          if (match) {
            extractedId = match[1];
            break;
          }
        }
      }
      
      console.error(`Fetching transcript for video: ${extractedId}, language: ${lang}, isLive: ${isLiveContent}, originalURL: ${videoId}`);
      
      // 字幕を取得
      const transcript = await YoutubeTranscript.fetchTranscript(extractedId, {
        lang: lang
      });
      
      // テキストを結合
      const fullText = transcript
        .map(item => item.text)
        .join(' ');
      
      // 構造化された結果と全文の両方を返す
      const result = {
        videoId: extractedId,
        language: lang,
        transcriptCount: transcript.length,
        fullText: fullText,
        segments: transcript.slice(0, 10) // 最初の10セグメントをサンプルとして
      };
      
      console.error('Successfully fetched transcript');
      
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(result, null, 2)
          }
        ]
      };
      
    } catch (error) {
      console.error('Error fetching transcript:', error);
      
      let errorMessage = error instanceof Error ? error.message : "Unknown error";
      
      // LIVE配信特有のエラーメッセージを追加
      if (isLiveContent) {
        errorMessage += "\n\nNote: This appears to be a LIVE stream URL. Live streams may have limited transcript availability:\n" +
                      "- Live captions may not be available during streaming\n" +
                      "- Try again after the stream has ended\n" +
                      "- Consider using the Whisper transcription tool for live content";
      }
      
      // エラーの詳細を返す
      return {
        content: [
          {
            type: "text",
            text: `Error fetching transcript: ${errorMessage}`
          }
        ],
        isError: true
      };
    }
  }

  if (request.params.name === "get_transcript_with_whisper") {
    try {
      if (!request.params.arguments) {
        throw new Error("Missing arguments");
      }
      const args = request.params.arguments as { videoId: string; useLocal?: boolean };
      const { videoId, useLocal = false } = args;
      
      // URLからvideoIdを抽出
      let extractedId = videoId;
      if (videoId.includes('youtube.com') || videoId.includes('youtu.be')) {
        const patterns = [
          // Standard YouTube URLs
          /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/)([^&\n?#]+)/,
          // YouTube LIVE URLs
          /(?:youtube\.com\/live\/)([^&\n?#]+)/,
          // Direct video ID
          /^([a-zA-Z0-9_-]{11})$/
        ];
        
        for (const pattern of patterns) {
          const match = videoId.match(pattern);
          if (match) {
            extractedId = match[1];
            break;
          }
        }
      }
      
      console.error(`Fetching transcript with Whisper for video: ${extractedId}, useLocal: ${useLocal}`);
      
      // Whisperでトランスクリプトを取得
      const whisperResult = await whisperService.getTranscriptWithWhisper(extractedId, useLocal);
      
      // 結果を構造化
      const result = {
        videoId: extractedId,
        method: useLocal ? 'local-whisper' : 'openai-whisper',
        transcriptText: whisperResult.text,
        segmentCount: whisperResult.segments?.length || 0,
        segments: whisperResult.segments?.slice(0, 10) // 最初の10セグメントをサンプルとして
      };
      
      console.error('Successfully fetched transcript with Whisper');
      
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(result, null, 2)
          }
        ]
      };
      
    } catch (error) {
      console.error('Error fetching transcript with Whisper:', error);
      
      return {
        content: [
          {
            type: "text",
            text: `Error fetching transcript with Whisper: ${error instanceof Error ? error.message : "Unknown error"}`
          }
        ],
        isError: true
      };
    }
  }
  
  throw new Error("Unknown tool");
});

// サーバーの起動
const transport = new StdioServerTransport();
server.connect(transport);
console.error("YouTube Transcript MCP server running");
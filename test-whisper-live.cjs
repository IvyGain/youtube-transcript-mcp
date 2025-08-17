const { spawn } = require('child_process');
const path = require('path');

console.log('🎤 Testing Whisper transcription for LIVE URL: https://youtube.com/live/w3PpSk--25c?feature=share');

// MCPサーバーの出力パスを取得
const serverPath = path.join(__dirname, 'dist', 'index.js');

function testWhisperLive() {
  return new Promise((resolve, reject) => {
    const server = spawn('node', [serverPath], {
      stdio: ['pipe', 'pipe', 'pipe']
    });

    let responseData = '';
    let errorData = '';
    
    // 初期化メッセージ
    const initMessage = JSON.stringify({
      jsonrpc: '2.0',
      id: 1,
      method: 'initialize',
      params: {
        protocolVersion: '2025-06-18',
        capabilities: {},
        clientInfo: { name: 'test-client', version: '1.0.0' }
      }
    }) + '\n';

    // Whisperトランスクリプト取得メッセージ
    const getWhisperMessage = JSON.stringify({
      jsonrpc: '2.0',
      id: 2,
      method: 'tools/call',
      params: {
        name: 'get_transcript_with_whisper',
        arguments: {
          videoId: 'https://youtube.com/live/w3PpSk--25c?feature=share',
          useLocal: false
        }
      }
    }) + '\n';

    let messageCount = 0;
    let startTime = Date.now();
    
    server.stdout.on('data', (data) => {
      responseData += data.toString();
      console.log('📄 Server Response:', data.toString());
      
      if (messageCount === 0) {
        // 初期化後、Whisperトランスクリプト取得を要求
        console.log('📤 Sending Whisper transcript request...');
        console.log('⚠️ This may take a while to download and transcribe audio...');
        server.stdin.write(getWhisperMessage);
        messageCount++;
      } else if (messageCount === 1) {
        // 結果を受信後、少し待ってから終了
        setTimeout(() => {
          console.log('⏹️ Stopping server...');
          server.kill();
        }, 2000);
      }
    });

    server.stderr.on('data', (data) => {
      errorData += data.toString();
      const now = Date.now();
      const elapsed = Math.round((now - startTime) / 1000);
      console.log(`🔍 [${elapsed}s] Debug:`, data.toString());
    });

    server.on('close', (code) => {
      const totalTime = Math.round((Date.now() - startTime) / 1000);
      console.log(`\n📊 Test Results (${totalTime}s):`);
      console.log('================');
      
      try {
        // JSONレスポンスをパース
        const responses = responseData.split('\n').filter(line => line.trim());
        const whisperResponse = responses.find(line => line.includes('"id":2'));
        
        if (whisperResponse) {
          const parsed = JSON.parse(whisperResponse);
          console.log('🎯 Whisper Response:', JSON.stringify(parsed, null, 2));
          
          if (parsed.result && parsed.result.content) {
            const content = parsed.result.content[0].text;
            
            if (content.includes('Error fetching transcript with Whisper')) {
              console.log('❌ Whisper Error:', content);
              
              if (content.includes('SSL') || content.includes('certificate')) {
                console.log('🔒 SSL/Certificate issue detected');
              }
              if (content.includes('Failed to download')) {
                console.log('📥 Audio download failed');
              }
            } else {
              console.log('✅ Whisper transcript retrieved successfully');
              try {
                const whisperData = JSON.parse(content);
                console.log(`📝 Method: ${whisperData.method || 'N/A'}`);
                console.log(`🆔 Video ID: ${whisperData.videoId || 'N/A'}`);
                console.log(`📊 Segment count: ${whisperData.segmentCount || 'N/A'}`);
                
                if (whisperData.transcriptText && whisperData.transcriptText.length > 0) {
                  console.log(`📄 Text preview: ${whisperData.transcriptText.substring(0, 300)}...`);
                } else {
                  console.log('📄 No transcript text available');
                }
              } catch (e) {
                console.log('📄 Raw content:', content.substring(0, 500));
              }
            }
          }
        }
        
        // デバッグ情報の分析
        const isDownloading = errorData.includes('Downloading audio');
        const isTranscribing = errorData.includes('Transcribing with');
        const hasError = errorData.includes('Error downloading') || errorData.includes('Error fetching');
        
        console.log(`\n🔍 Process Analysis:`);
        console.log(`📥 Audio download attempted: ${isDownloading ? 'Yes' : 'No'}`);
        console.log(`🎤 Transcription attempted: ${isTranscribing ? 'Yes' : 'No'}`);
        console.log(`❌ Errors encountered: ${hasError ? 'Yes' : 'No'}`);
        
        resolve({
          success: !hasError,
          downloadAttempted: isDownloading,
          transcriptionAttempted: isTranscribing,
          hasError: hasError,
          totalTime: totalTime
        });
        
      } catch (error) {
        console.log('❌ Error parsing response:', error.message);
        console.log('Raw response:', responseData);
        resolve({ success: false, error: error.message, totalTime: totalTime });
      }
    });

    server.on('error', (error) => {
      console.log('❌ Server startup error:', error.message);
      reject(error);
    });

    // 初期化メッセージを送信
    console.log('🚀 Starting MCP server for Whisper test...');
    server.stdin.write(initMessage);
  });
}

// テスト実行
testWhisperLive()
  .then(result => {
    console.log('\n🎯 Final Result:', result);
    
    if (result.success) {
      console.log('\n✅ Whisper test completed successfully!');
      console.log(`⏱️ Total time: ${result.totalTime} seconds`);
    } else {
      console.log('❌ Whisper test encountered issues');
      if (result.error) {
        console.log('Error:', result.error);
      }
    }
    
    console.log('\n💡 Alternative options:');
    console.log('- Try with useLocal: true for local Whisper');
    console.log('- Check if OPENAI_API_KEY is set for OpenAI Whisper');
    console.log('- Ensure yt-dlp is installed: pip install yt-dlp');
  })
  .catch(error => {
    console.error('❌ Test error:', error);
  });
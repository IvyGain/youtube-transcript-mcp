const { spawn } = require('child_process');
const path = require('path');

console.log('🔴 Testing specific LIVE URL: https://youtube.com/live/w3PpSk--25c?feature=share');

// MCPサーバーの出力パスを取得
const serverPath = path.join(__dirname, 'dist', 'index.js');

function testLiveUrl() {
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

    // トランスクリプト取得メッセージ
    const getTranscriptMessage = JSON.stringify({
      jsonrpc: '2.0',
      id: 2,
      method: 'tools/call',
      params: {
        name: 'get_transcript',
        arguments: {
          videoId: 'https://youtube.com/live/w3PpSk--25c?feature=share',
          lang: 'ja'
        }
      }
    }) + '\n';

    let messageCount = 0;
    
    server.stdout.on('data', (data) => {
      responseData += data.toString();
      console.log('📄 Server Response:', data.toString());
      
      if (messageCount === 0) {
        // 初期化後、トランスクリプト取得を要求
        console.log('📤 Sending transcript request...');
        server.stdin.write(getTranscriptMessage);
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
      console.log('🔍 Debug Info:', data.toString());
    });

    server.on('close', (code) => {
      console.log(`\n📊 Test Results:`);
      console.log('================');
      
      try {
        // JSONレスポンスをパース
        const responses = responseData.split('\n').filter(line => line.trim());
        const transcriptResponse = responses.find(line => line.includes('"method":"tools/call"') || line.includes('"id":2'));
        
        if (transcriptResponse) {
          const parsed = JSON.parse(transcriptResponse);
          console.log('🎯 Transcript Response:', JSON.stringify(parsed, null, 2));
          
          if (parsed.result && parsed.result.content) {
            const content = parsed.result.content[0].text;
            
            if (content.includes('Error fetching transcript')) {
              console.log('❌ Transcript Error:', content);
              
              if (content.includes('LIVE stream URL')) {
                console.log('✅ LIVE detection working correctly');
              }
            } else {
              console.log('✅ Transcript retrieved successfully');
              try {
                const transcriptData = JSON.parse(content);
                console.log(`📝 Transcript count: ${transcriptData.transcriptCount || 'N/A'}`);
                console.log(`🆔 Video ID: ${transcriptData.videoId || 'N/A'}`);
                console.log(`🌐 Language: ${transcriptData.language || 'N/A'}`);
                
                if (transcriptData.fullText && transcriptData.fullText.length > 0) {
                  console.log(`📄 Text preview: ${transcriptData.fullText.substring(0, 200)}...`);
                } else {
                  console.log('📄 No transcript text available');
                }
              } catch (e) {
                console.log('📄 Raw content:', content.substring(0, 300));
              }
            }
          }
        }
        
        // デバッグ情報の分析
        const isLiveDetected = errorData.includes('isLive: true');
        const hasUrlExtraction = errorData.includes('originalURL:');
        const extractedId = errorData.match(/Fetching transcript for video: ([^,]+)/);
        
        console.log(`\n🔍 Debug Analysis:`);
        console.log(`📺 LIVE detected: ${isLiveDetected ? 'Yes' : 'No'}`);
        console.log(`🔗 URL extraction: ${hasUrlExtraction ? 'Yes' : 'No'}`);
        console.log(`🆔 Extracted ID: ${extractedId ? extractedId[1] : 'Not found'}`);
        
        resolve({
          success: true,
          isLiveDetected,
          hasTranscript: !responseData.includes('Error fetching transcript'),
          extractedId: extractedId ? extractedId[1] : null
        });
        
      } catch (error) {
        console.log('❌ Error parsing response:', error.message);
        console.log('Raw response:', responseData);
        resolve({ success: false, error: error.message });
      }
    });

    server.on('error', (error) => {
      console.log('❌ Server startup error:', error.message);
      reject(error);
    });

    // 初期化メッセージを送信
    console.log('🚀 Starting MCP server...');
    server.stdin.write(initMessage);
  });
}

// テスト実行
testLiveUrl()
  .then(result => {
    console.log('\n🎯 Final Result:', result);
    
    if (result.success) {
      console.log('\n✅ Test completed successfully!');
      if (result.isLiveDetected) {
        console.log('✅ LIVE URL detection working');
      }
      if (result.hasTranscript) {
        console.log('✅ Transcript available');
      } else {
        console.log('ℹ️ Transcript not available (this is expected for some LIVE content)');
      }
    } else {
      console.log('❌ Test failed:', result.error);
    }
  })
  .catch(error => {
    console.error('❌ Test error:', error);
  });
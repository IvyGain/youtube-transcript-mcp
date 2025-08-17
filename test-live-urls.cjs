const { spawn } = require('child_process');
const path = require('path');

console.log('🔴 Testing YouTube LIVE URL support...');

// テスト用のLIVE URL
const testUrls = [
  'https://youtube.com/live/w3PpSk--25c?feature=share', // Failed example from user
  'https://youtube.com/live/rEI3OGkZTAE',                 // Working example from user
  'w3PpSk--25c',                                          // Direct ID
  'rEI3OGkZTAE',                                          // Direct ID
];

console.log(`Testing ${testUrls.length} different URL formats...`);

// MCPサーバーの出力パスを取得
const serverPath = path.join(__dirname, 'dist', 'index.js');

function testUrl(url, index) {
  return new Promise((resolve, reject) => {
    console.log(`\n--- Test ${index + 1}: ${url} ---`);
    
    const server = spawn('node', [serverPath], {
      stdio: ['pipe', 'pipe', 'pipe']
    });

    let response = '';
    let errorOutput = '';
    
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
          videoId: url,
          lang: 'ja'
        }
      }
    }) + '\n';

    let messageCount = 0;
    
    server.stdout.on('data', (data) => {
      response += data.toString();
      
      if (messageCount === 0) {
        // 初期化後、トランスクリプト取得を要求
        server.stdin.write(getTranscriptMessage);
        messageCount++;
      } else if (messageCount === 1) {
        // 結果を受信
        setTimeout(() => server.kill(), 1000);
      }
    });

    server.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });

    server.on('close', (code) => {
      console.log(`Response: ${response.substring(0, 200)}...`);
      if (errorOutput) {
        console.log(`Debug info: ${errorOutput.substring(0, 300)}...`);
      }
      
      // URL抽出の成功/失敗を判定
      const isSuccess = errorOutput.includes('Successfully fetched transcript') || 
                       response.includes('"transcriptCount"') ||
                       response.includes('"fullText"');
      
      const isLiveDetected = errorOutput.includes('isLive: true');
      const hasError = response.includes('"isError":true') || 
                      response.includes('Error fetching transcript');
      
      console.log(`✅ URL parsed correctly: ${isLiveDetected || errorOutput.includes('originalURL')}`);
      console.log(`📺 LIVE content detected: ${isLiveDetected}`);
      console.log(`📝 Transcript available: ${isSuccess}`);
      console.log(`❌ Error occurred: ${hasError}`);
      
      resolve({
        url,
        success: isSuccess,
        isLiveDetected,
        hasError,
        response: response.substring(0, 500)
      });
    });

    server.on('error', (error) => {
      reject(error);
    });

    // 初期化メッセージを送信
    server.stdin.write(initMessage);
  });
}

async function runTests() {
  console.log('\n🚀 Starting URL pattern tests...\n');
  
  const results = [];
  
  for (let i = 0; i < testUrls.length; i++) {
    try {
      const result = await testUrl(testUrls[i], i);
      results.push(result);
      
      // テスト間の間隔
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error(`❌ Test ${i + 1} failed:`, error.message);
      results.push({
        url: testUrls[i],
        success: false,
        isLiveDetected: false,
        hasError: true,
        error: error.message
      });
    }
  }
  
  // 結果のサマリー
  console.log('\n📊 Test Results Summary:');
  console.log('========================');
  
  results.forEach((result, index) => {
    console.log(`${index + 1}. ${result.url}`);
    console.log(`   📺 LIVE detected: ${result.isLiveDetected ? 'Yes' : 'No'}`);
    console.log(`   📝 Transcript: ${result.success ? 'Available' : 'Not available'}`);
    console.log(`   ❌ Error: ${result.hasError ? 'Yes' : 'No'}`);
    console.log('');
  });
  
  const liveUrlsDetected = results.filter(r => r.isLiveDetected).length;
  const successfulTranscripts = results.filter(r => r.success).length;
  
  console.log(`\n✅ LIVE URLs properly detected: ${liveUrlsDetected}/${testUrls.filter(u => u.includes('/live/')).length}`);
  console.log(`📝 Successful transcript retrievals: ${successfulTranscripts}/${testUrls.length}`);
  
  console.log('\n💡 Tips:');
  console.log('- LIVE streams may not have captions during broadcast');
  console.log('- Try Whisper transcription for live content');
  console.log('- Check again after the stream has ended');
}

runTests().catch(console.error);
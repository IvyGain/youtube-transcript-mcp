const { spawn } = require('child_process');
const path = require('path');

console.log('🎤 Testing Whisper functionality...');

// テスト用の短い動画ID（10秒程度）
const testVideoId = 'jNQXAC9IVRw'; // "Me at the zoo" - 最初のYouTube動画（19秒）

console.log(`Testing with video ID: ${testVideoId}`);

// MCPサーバーの出力パスを取得
const serverPath = path.join(__dirname, 'dist', 'index.js');

console.log(`\n--- Testing MCP Server Directly ---`);

// MCPサーバーを起動してテスト
const server = spawn('node', [serverPath], {
  stdio: ['pipe', 'pipe', 'pipe']
});

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

// ツールリスト取得
const listToolsMessage = JSON.stringify({
  jsonrpc: '2.0',
  id: 2,
  method: 'tools/list',
  params: {}
}) + '\n';

// Whisperツール呼び出し（OpenAI）
const whisperCallMessage = JSON.stringify({
  jsonrpc: '2.0',
  id: 3,
  method: 'tools/call',
  params: {
    name: 'get_transcript_with_whisper',
    arguments: {
      videoId: testVideoId,
      useLocal: false
    }
  }
}) + '\n';

let messageCount = 0;

server.stdout.on('data', (data) => {
  const response = data.toString();
  console.log('Server response:', response);
  
  if (messageCount === 0) {
    // 初期化後、ツールリストを要求
    server.stdin.write(listToolsMessage);
    messageCount++;
  } else if (messageCount === 1) {
    // ツールリスト受信後、Whisperツールを呼び出し
    console.log('\n--- Calling Whisper Tool ---');
    console.log('Note: This requires OPENAI_API_KEY environment variable');
    server.stdin.write(whisperCallMessage);
    messageCount++;
  } else if (messageCount === 2) {
    // Whisperツールの結果
    console.log('\n--- Whisper Tool Result ---');
    server.kill();
  }
});

server.stderr.on('data', (data) => {
  console.error('Server error/debug:', data.toString());
});

server.on('close', (code) => {
  console.log(`\n--- Server closed with code: ${code} ---`);
  
  console.log('\n🔧 Setup Instructions:');
  console.log('1. For OpenAI Whisper: Set OPENAI_API_KEY environment variable');
  console.log('2. For Local Whisper: Install whisper with: pip install openai-whisper');
  console.log('3. For youtube-dl: Install with: pip install yt-dlp');
  console.log('\n📝 Usage in Claude Desktop:');
  console.log('- get_transcript_with_whisper({ "videoId": "jNQXAC9IVRw", "useLocal": false })');
  console.log('- get_transcript_with_whisper({ "videoId": "jNQXAC9IVRw", "useLocal": true })');
});

// 初期化メッセージを送信
server.stdin.write(initMessage);
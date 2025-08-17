#!/usr/bin/env node
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// MCPサーバーのパスを取得
const serverPath = join(__dirname, 'index.js');

// 引数処理
const args = process.argv.slice(2);

if (args.includes('--help') || args.includes('-h')) {
  console.log(`
YouTube Transcript MCP Server

Usage:
  youtube-transcript-mcp          Start the MCP server
  youtube-transcript-mcp --help   Show this help message
  youtube-transcript-mcp --version Show version

This is an MCP server that should be used with Claude Desktop or other MCP clients.

Configuration for Claude Desktop:
{
  "mcpServers": {
    "youtube-transcript": {
      "command": "youtube-transcript-mcp"
    }
  }
}

For more information, visit: https://github.com/IvyGain/youtube-transcript-mcp
`);
  process.exit(0);
}

if (args.includes('--version') || args.includes('-v')) {
  const { readFileSync } = await import('fs');
  const packageJsonPath = join(__dirname, '..', 'package.json');
  const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
  console.log(packageJson.version);
  process.exit(0);
}

// MCPサーバーを起動
const serverProcess = spawn('node', [serverPath], {
  stdio: 'inherit',
  env: process.env
});

serverProcess.on('error', (err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});

serverProcess.on('exit', (code) => {
  process.exit(code || 0);
});
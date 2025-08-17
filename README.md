# YouTube Transcript MCP Server

A Model Context Protocol (MCP) server that fetches transcripts from YouTube videos using multiple methods.

## Features

- **Built-in Captions**: Fetch transcripts using YouTube's built-in captions
- **Whisper AI**: Download audio and transcribe using OpenAI Whisper or local Whisper
- **Multiple Languages**: Support for various language codes
- **Formatted Output**: Timestamps and structured results

## Installation

```bash
npm install
npm run build
```

## Prerequisites

### For Whisper functionality:

**Option 1: OpenAI API (Recommended)**
```bash
export OPENAI_API_KEY="your-openai-api-key"
```

**Option 2: Local Whisper**
```bash
pip install openai-whisper
```

**Required: yt-dlp for audio download**
```bash
pip install yt-dlp
```

## Usage

### With Claude Desktop

Add this configuration to your Claude Desktop settings:

```json
{
  "mcpServers": {
    "youtube-transcript": {
      "command": "node",
      "args": ["/path/to/youtube-transcript-mcp/dist/index.js"],
      "env": {
        "OPENAI_API_KEY": "your-openai-api-key"
      }
    }
  }
}
```

### Available Tools

#### get_transcript

Fetches the transcript using YouTube's built-in captions.

**Parameters:**
- `videoId` (required): YouTube video ID or URL
- `lang` (optional): Language code (defaults to 'en')

**Example:**
```json
{
  "videoId": "dQw4w9WgXcQ",
  "lang": "en"
}
```

#### get_transcript_with_whisper

Downloads audio and transcribes using Whisper AI.

**Parameters:**
- `videoId` (required): YouTube video ID or URL  
- `useLocal` (optional): Use local Whisper instead of OpenAI API (defaults to false)

**Examples:**
```json
{
  "videoId": "dQw4w9WgXcQ",
  "useLocal": false
}
```

```json
{
  "videoId": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  "useLocal": true
}
```

## Methods Comparison

| Method | Pros | Cons | Best For |
|--------|------|------|----------|
| **Built-in Captions** | Fast, free, multiple languages | Only works if captions exist | Videos with existing captions |
| **OpenAI Whisper** | Works on any video, high accuracy | Requires API key, costs money | Any video, high quality needed |
| **Local Whisper** | Free, works offline | Slower, requires local setup | Privacy-sensitive content |

## Development

```bash
# Install dependencies
npm install

# Run in development mode
npm run dev

# Build for production
npm run build

# Test functionality
node test-whisper.cjs
```

## Environment Variables

- `OPENAI_API_KEY`: Required for OpenAI Whisper functionality
- `NODE_ENV`: Set to 'production' for production deployment

## Troubleshooting

### SSL Certificate Issues
If you encounter SSL certificate errors with yt-dlp, the server automatically uses `--no-check-certificates` flag.

### Audio Download Fails
- Ensure yt-dlp is installed: `pip install yt-dlp`
- Check if the video is available in your region
- Some videos may have download restrictions

### OpenAI API Errors
- Verify your OPENAI_API_KEY is set correctly
- Check your OpenAI account has sufficient credits
- Ensure the audio file is under 25MB (Whisper API limit)

### Local Whisper Issues
- Install with: `pip install openai-whisper`
- Ensure `whisper` command is in your PATH
- First run will download model files (requires internet)

## License

MIT
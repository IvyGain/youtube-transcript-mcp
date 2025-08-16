# YouTube Transcript MCP Server

A Model Context Protocol (MCP) server that fetches transcripts from YouTube videos.

## Features

- Fetch transcripts from YouTube videos using video ID or URL
- Support for multiple languages
- Formatted output with timestamps

## Installation

```bash
npm install
npm run build
```

## Usage

### With Claude Desktop

Add this configuration to your Claude Desktop settings:

```json
{
  "mcpServers": {
    "youtube-transcript": {
      "command": "node",
      "args": ["/path/to/youtube-transcript-mcp/dist/index.js"]
    }
  }
}
```

### Available Tools

#### get_transcript

Fetches the transcript of a YouTube video.

**Parameters:**
- `videoId` (required): YouTube video ID or URL
- `lang` (optional): Language code for the transcript (defaults to 'en')

**Example:**
```
get_transcript({
  "videoId": "dQw4w9WgXcQ",
  "lang": "en"
})
```

## Development

```bash
# Install dependencies
npm install

# Run in development mode
npm run dev

# Build for production
npm run build
```

## License

MIT
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { YoutubeTranscript } from 'youtube-transcript';

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
        description: "Get the transcript of a YouTube video",
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
    ],
  };
});

// ツールの実行ハンドラ
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  if (request.params.name === "get_transcript") {
    try {
      const { videoId, lang = 'en' } = request.params.arguments;
      
      // URLからvideoIdを抽出
      let extractedId = videoId;
      if (videoId.includes('youtube.com') || videoId.includes('youtu.be')) {
        const patterns = [
          /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/)([^&\n?#]+)/,
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
      
      console.error(`Fetching transcript for video: ${extractedId}, language: ${lang}`);
      
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
      
      // エラーの詳細を返す
      return {
        content: [
          {
            type: "text",
            text: `Error fetching transcript: ${error.message}`
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
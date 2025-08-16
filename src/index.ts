#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from "@modelcontextprotocol/sdk/types.js";
import { YoutubeTranscript } from "youtube-transcript";

const server = new Server(
  {
    name: "youtube-transcript-mcp",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

const tools: Tool[] = [
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
          default: "en",
        },
      },
      required: ["videoId"],
    },
  },
];

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools,
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  if (name === "get_transcript") {
    try {
      const videoId = extractVideoId(args.videoId as string);
      const lang = (args.lang as string) || "en";

      const transcript = await YoutubeTranscript.fetchTranscript(videoId, {
        lang,
      });

      const formattedTranscript = transcript
        .map((item) => {
          const timestamp = formatTimestamp(item.offset);
          return `[${timestamp}] ${item.text}`;
        })
        .join("\n");

      return {
        content: [
          {
            type: "text",
            text: formattedTranscript,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Error fetching transcript: ${error instanceof Error ? error.message : "Unknown error"}`,
          },
        ],
        isError: true,
      };
    }
  }

  throw new Error(`Unknown tool: ${name}`);
});

function extractVideoId(input: string): string {
  // Handle direct video ID
  if (!input.includes("/") && !input.includes("=")) {
    return input;
  }

  // Handle various YouTube URL formats
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/)([^&\n?#]+)/,
  ];

  for (const pattern of patterns) {
    const match = input.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }

  // If no pattern matches, assume it's a video ID
  return input;
}

function formatTimestamp(milliseconds: number): string {
  const totalSeconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((error) => {
  console.error("Server error:", error);
  process.exit(1);
});
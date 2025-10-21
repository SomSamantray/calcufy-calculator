import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import * as fs from "fs";
import * as path from "path";

// Base URL for widget assets
const BASE_URL = process.env.BASE_URL || "https://calcufy-calculator.vercel.app";

// Calculator operation types
type Operation = "add" | "subtract" | "multiply" | "divide";

// Widget configuration
interface WidgetConfig {
  name: string;
  templateUri: string;
  title: string;
  html: string;
}

// Helper function to read widget HTML from deployed assets
function getWidgetHtml(componentName: string): string {
  // For Vercel deployment, we'll inline the HTML directly
  // The HTML will reference the BASE_URL for assets
  const normalizedBaseUrl = BASE_URL.replace(/\/$/, "");
  return `<!doctype html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <script type="module" crossorigin src="${normalizedBaseUrl}/assets/${componentName}.js"></script>
  <link rel="stylesheet" crossorigin href="${normalizedBaseUrl}/assets/${componentName}.css">
</head>
<body>
  <div id="${componentName}-root"></div>
</body>
</html>
`;
}

// Load all widgets
const widgets: WidgetConfig[] = [
  {
    name: "operation-selector",
    templateUri: "ui://widget/operation-selector.html",
    title: "Operation Selector",
    html: getWidgetHtml("operation-selector"),
  },
  {
    name: "number-input",
    templateUri: "ui://widget/number-input.html",
    title: "Number Input",
    html: getWidgetHtml("number-input"),
  },
  {
    name: "result-display",
    templateUri: "ui://widget/result-display.html",
    title: "Result Display",
    html: getWidgetHtml("result-display"),
  },
];

// Create widget lookup map
const widgetsByUri = new Map(widgets.map((w) => [w.templateUri, w]));

// Widget metadata helper
function widgetMeta(widget: WidgetConfig) {
  return {
    "openai/widgetAccessible": true,
    "openai/resultCanProduceWidget": true,
  };
}

// Helper function to perform calculation
function calculate(operation: Operation, num1: number, num2: number): number {
  switch (operation) {
    case "add":
      return num1 + num2;
    case "subtract":
      return num1 - num2;
    case "multiply":
      return num1 * num2;
    case "divide":
      if (num2 === 0) {
        throw new Error("Cannot divide by zero");
      }
      return num1 / num2;
    default:
      throw new Error(`Unknown operation: ${operation}`);
  }
}

// Helper function to get operation symbol
function getOperationSymbol(operation: Operation): string {
  const symbols = {
    add: "+",
    subtract: "-",
    multiply: "×",
    divide: "÷",
  };
  return symbols[operation];
}

// Create MCP server instance
const server = new Server(
  {
    name: "calcufy-calculator",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
      resources: {},
    },
  }
);

// Register resources (widgets)
server.setRequestHandler(ListResourcesRequestSchema, async () => {
  return {
    resources: widgets.map((widget) => ({
      uri: widget.templateUri,
      name: widget.title,
      description: `${widget.title} widget markup`,
      mimeType: "text/html+skybridge",
      _meta: widgetMeta(widget),
    })),
  };
});

server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  const widget = widgetsByUri.get(request.params.uri);
  if (!widget) {
    throw new Error(`Unknown resource: ${request.params.uri}`);
  }
  return {
    contents: [
      {
        uri: widget.templateUri,
        mimeType: "text/html+skybridge",
        text: widget.html,
        _meta: widgetMeta(widget),
      },
    ],
  };
});

// Register tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "calcufy_calculator",
        description:
          "An interactive calculator that performs basic arithmetic operations (addition, subtraction, multiplication, division). The user can select an operation and provide two numbers to calculate.",
        inputSchema: {
          type: "object" as const,
          properties: {
            operation: {
              type: "string" as const,
              enum: ["add", "subtract", "multiply", "divide"],
              description: "The operation to perform",
            },
            number1: {
              type: "number" as const,
              description: "The first number",
            },
            number2: {
              type: "number" as const,
              description: "The second number",
            },
          },
        },
      },
    ],
  };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  if (request.params.name === "calcufy_calculator") {
    const { operation, number1, number2 } = request.params.arguments as {
      operation?: Operation;
      number1?: number;
      number2?: number;
    };

    // Step 1: If no operation, show operation selector
    if (!operation) {
      const widget = widgets[0]; // operation-selector
      return {
        content: [
          {
            type: "text",
            text: "Please select a calculation operation from the options below.",
          },
        ],
        _meta: {
          "openai/outputTemplate": widget.templateUri,
          "openai/toolInvocation/invoking": "Loading calculator...",
          "openai/toolInvocation/invoked": "Calculator ready!",
          ...widgetMeta(widget),
        },
      };
    }

    // Step 2: If operation but no numbers, show number input
    if (number1 === undefined || number2 === undefined) {
      const widget = widgets[1]; // number-input
      return {
        content: [
          {
            type: "text",
            text: `Please enter two numbers to ${operation}.`,
          },
        ],
        structuredContent: {
          operation: operation,
          operationSymbol: getOperationSymbol(operation as Operation),
        },
        _meta: {
          "openai/outputTemplate": widget.templateUri,
          "openai/toolInvocation/invoking": "Preparing input form...",
          "openai/toolInvocation/invoked": "Ready for input!",
          ...widgetMeta(widget),
        },
      };
    }

    // Step 3: Perform calculation and show result
    try {
      const result = calculate(operation as Operation, number1, number2);
      const operationSymbol = getOperationSymbol(operation as Operation);
      const widget = widgets[2]; // result-display

      return {
        content: [
          {
            type: "text",
            text: `${number1} ${operationSymbol} ${number2} = ${result}`,
          },
        ],
        structuredContent: {
          step: "show-result",
          operation: operation,
          operationSymbol: operationSymbol,
          number1: number1,
          number2: number2,
          result: result,
        },
        _meta: {
          "openai/outputTemplate": widget.templateUri,
          "openai/toolInvocation/invoking": "Calculating...",
          "openai/toolInvocation/invoked": "Calculation complete!",
          ...widgetMeta(widget),
        },
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Error: ${error instanceof Error ? error.message : "Unknown error"}`,
          },
        ],
        isError: true,
      };
    }
  }

  throw new Error(`Unknown tool: ${request.params.name}`);
});

// Vercel serverless function handler
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    // Handle JSON-RPC MCP request
    const request = req.body;

    // Route to appropriate handler
    if (request.method === 'initialize') {
      res.status(200).json({
        jsonrpc: "2.0",
        result: {
          protocolVersion: "2024-11-05",
          capabilities: {
            tools: {},
            resources: {}
          },
          serverInfo: {
            name: "calcufy-calculator",
            version: "1.0.0"
          }
        },
        id: request.id
      });
      return;
    }

    // Delegate to SDK handlers
    const response = await (server as any).handleRequest(request);
    res.status(200).json(response);
  } catch (error) {
    console.error('MCP request error:', error);
    res.status(500).json({
      jsonrpc: "2.0",
      error: {
        code: -32603,
        message: 'Internal error',
        data: error instanceof Error ? error.message : 'Unknown error'
      },
      id: null
    });
  }
}

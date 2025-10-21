import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Base URL for widget assets
const BASE_URL = process.env.BASE_URL || "https://calcufy-calculator.vercel.app";
const ASSETS_DIR = path.join(__dirname, "../assets");

// Calculator operation types
type Operation = "add" | "subtract" | "multiply" | "divide";

// Widget configuration
interface WidgetConfig {
  name: string;
  templateUri: string;
  title: string;
  html: string;
}

// Helper function to read widget HTML
function readWidgetHtml(componentName: string): string {
  const htmlPath = path.join(ASSETS_DIR, `${componentName}.html`);
  if (fs.existsSync(htmlPath)) {
    return fs.readFileSync(htmlPath, "utf8");
  }
  throw new Error(`Widget HTML not found: ${componentName}`);
}

// Load all widgets
const widgets: WidgetConfig[] = [
  {
    name: "operation-selector",
    templateUri: "ui://widget/operation-selector.html",
    title: "Operation Selector",
    html: readWidgetHtml("operation-selector"),
  },
  {
    name: "number-input",
    templateUri: "ui://widget/number-input.html",
    title: "Number Input",
    html: readWidgetHtml("number-input"),
  },
  {
    name: "result-display",
    templateUri: "ui://widget/result-display.html",
    title: "Result Display",
    html: readWidgetHtml("result-display"),
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

// Create MCP server
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

// Start the server with stdio transport
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Calcufy MCP Server running on stdio");
  console.error(`Base URL: ${BASE_URL}`);
}

main().catch(console.error);

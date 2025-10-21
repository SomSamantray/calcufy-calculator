import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";

const server = new Server(
  {
    name: "calcufy-calculator",
    version: "1.0.0"
  },
  {
    capabilities: {
      tools: {}
    }
  }
);

// Base URL for widget assets (will be replaced with actual deployment URL)
const WIDGET_HOST = process.env.OPENAI_WIDGET_HOST || "http://localhost:4444";

// Handle resource requests
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "calcufy_calculator",
        description: "An interactive calculator that performs basic arithmetic operations (addition, subtraction, multiplication, division). The user can select an operation and provide two numbers to calculate.",
        inputSchema: {
          type: "object" as const,
          properties: {
            operation: {
              type: "string" as const,
              enum: ["add", "subtract", "multiply", "divide"],
              description: "The operation to perform"
            },
            number1: {
              type: "number" as const,
              description: "The first number"
            },
            number2: {
              type: "number" as const,
              description: "The second number"
            }
          }
        }
      }
    ]
  };
});

// Calculator operation types
type Operation = "add" | "subtract" | "multiply" | "divide";

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
    divide: "÷"
  };
  return symbols[operation];
}

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  if (request.params.name === "calcufy_calculator") {
    const { operation, number1, number2 } = request.params.arguments as {
      operation?: Operation;
      number1?: number;
      number2?: number;
    };

    // If no operation selected, show operation selector
    if (!operation) {
      return {
        content: [
          {
            type: "text",
            text: "Please select a calculation operation from the options below."
          }
        ]
      };
    }

    // If operation selected but numbers not provided, show number input
    if (number1 === undefined || number2 === undefined) {
      return {
        content: [
          {
            type: "text",
            text: `Please enter two numbers to ${operation}.`
          }
        ]
      };
    }

    // Perform calculation
    try {
      const result = calculate(operation as Operation, number1, number2);
      const operationSymbol = getOperationSymbol(operation as Operation);

      return {
        content: [
          {
            type: "text",
            text: `${number1} ${operationSymbol} ${number2} = ${result}`
          }
        ]
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Error: ${error instanceof Error ? error.message : "Unknown error"}`
          }
        ],
        isError: true
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
  console.error(`Widget host: ${WIDGET_HOST}`);
}

main().catch(console.error);

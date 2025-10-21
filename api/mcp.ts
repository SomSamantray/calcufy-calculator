import type { VercelRequest, VercelResponse } from '@vercel/node';

const WIDGET_HOST = process.env.OPENAI_WIDGET_HOST || "https://calcufy-calculator.vercel.app";

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

// MCP JSON-RPC handler
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Only accept POST and GET
  if (req.method !== 'POST' && req.method !== 'GET') {
    res.status(405).json({
      jsonrpc: "2.0",
      error: { code: -32601, message: 'Method not allowed' },
      id: null
    });
    return;
  }

  // Handle GET requests - return server info
  if (req.method === 'GET') {
    res.status(200).json({
      name: "calcufy-calculator",
      version: "1.0.0",
      description: "Interactive Calculator MCP Server",
      protocol: "MCP/JSON-RPC 2.0",
      endpoints: {
        mcp: "/api/mcp",
        health: "/api/health"
      }
    });
    return;
  }

  try {
    const request = req.body;

    // Validate JSON-RPC request
    if (!request || !request.method) {
      res.status(400).json({
        jsonrpc: "2.0",
        error: { code: -32600, message: 'Invalid Request' },
        id: request?.id || null
      });
      return;
    }

    const { method, params, id } = request;

    // Handle initialize
    if (method === 'initialize') {
      res.status(200).json({
        jsonrpc: "2.0",
        result: {
          protocolVersion: "2024-11-05",
          capabilities: {
            tools: {}
          },
          serverInfo: {
            name: "calcufy-calculator",
            version: "1.0.0"
          }
        },
        id
      });
      return;
    }

    // Handle tools/list
    if (method === 'tools/list') {
      res.status(200).json({
        jsonrpc: "2.0",
        result: {
          tools: [
            {
              name: "calcufy_calculator",
              description: "An interactive calculator that performs basic arithmetic operations (addition, subtraction, multiplication, division). The user can select an operation and provide two numbers to calculate.",
              inputSchema: {
                type: "object",
                properties: {
                  operation: {
                    type: "string",
                    enum: ["add", "subtract", "multiply", "divide"],
                    description: "The operation to perform"
                  },
                  number1: {
                    type: "number",
                    description: "The first number"
                  },
                  number2: {
                    type: "number",
                    description: "The second number"
                  }
                }
              }
            }
          ]
        },
        id
      });
      return;
    }

    // Handle tools/call
    if (method === 'tools/call') {
      const { name, arguments: args } = params;

      if (name === 'calcufy_calculator') {
        const { operation, number1, number2 } = args || {};

        // If no operation selected
        if (!operation) {
          res.status(200).json({
            jsonrpc: "2.0",
            result: {
              content: [
                {
                  type: "text",
                  text: "Please select a calculation operation from the options below."
                }
              ],
              _meta: {
                "openai/outputTemplate": {
                  type: "text/html",
                  url: `${WIDGET_HOST}/widgets/operation-selector.html`
                }
              }
            },
            id
          });
          return;
        }

        // If operation selected but numbers not provided
        if (number1 === undefined || number2 === undefined) {
          res.status(200).json({
            jsonrpc: "2.0",
            result: {
              content: [
                {
                  type: "text",
                  text: `Please enter two numbers to ${operation}.`
                }
              ],
              _meta: {
                "openai/outputTemplate": {
                  type: "text/html",
                  url: `${WIDGET_HOST}/widgets/number-input.html`
                }
              }
            },
            id
          });
          return;
        }

        // Perform calculation
        try {
          const result = calculate(operation as Operation, number1, number2);
          const operationSymbol = getOperationSymbol(operation as Operation);

          res.status(200).json({
            jsonrpc: "2.0",
            result: {
              content: [
                {
                  type: "text",
                  text: `${number1} ${operationSymbol} ${number2} = ${result}`
                }
              ],
              structuredContent: {
                step: "show-result",
                operation: operation,
                operationSymbol: operationSymbol,
                number1: number1,
                number2: number2,
                result: result
              },
              _meta: {
                "openai/outputTemplate": {
                  type: "text/html",
                  url: `${WIDGET_HOST}/widgets/result-display.html`
                }
              }
            },
            id
          });
          return;
        } catch (error) {
          res.status(200).json({
            jsonrpc: "2.0",
            result: {
              content: [
                {
                  type: "text",
                  text: `Error: ${error instanceof Error ? error.message : "Unknown error"}`
                }
              ],
              isError: true
            },
            id
          });
          return;
        }
      } else {
        res.status(200).json({
          jsonrpc: "2.0",
          error: { code: -32601, message: `Unknown tool: ${name}` },
          id
        });
        return;
      }
    }

    // Unknown method
    res.status(200).json({
      jsonrpc: "2.0",
      error: { code: -32601, message: `Method not found: ${method}` },
      id
    });

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

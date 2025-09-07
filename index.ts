import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import express from "express";
import type { Request, Response } from "express";

import { registerEndpoints } from "./registerEndpoints.js";
import { logger } from "./logger.js";
import { settings } from "./settings";

const mcpStdinServer = getServerInstance();
const stdioTransport = new StdioServerTransport();

mcpStdinServer.connect(stdioTransport);

if (settings.mode !== "stdio") {
  const app = express();
  app.use(express.json());

  app.post("/mcp", async (req: Request, res: Response) => {
    // In stateless mode, create a new instance of transport and server for each request
    // to ensure complete isolation. A single instance would cause request ID collisions
    // when multiple clients connect concurrently.

    try {
      const mcpServer = getServerInstance();
      const transport: StreamableHTTPServerTransport =
        new StreamableHTTPServerTransport({
          sessionIdGenerator: undefined,
        });
      res.on("close", () => {
        logger.log("Request closed");
        transport.close();
        mcpServer.close();
      });
      await mcpServer.connect(transport);
      await transport.handleRequest(req, res, req.body);
    } catch (error) {
      logger.error("Error handling MCP request:", error);
      if (!res.headersSent) {
        res.status(500).json({
          jsonrpc: "2.0",
          error: {
            code: -32603,
            message: "Internal server error",
          },
          id: null,
        });
      }
    }
  });

  // SSE notifications not supported in stateless mode
  app.get("/mcp", async (req: Request, res: Response) => {
    logger.log("Received GET MCP request");
    res.writeHead(405).end(
      JSON.stringify({
        jsonrpc: "2.0",
        error: {
          code: -32000,
          message: "Method not allowed.",
        },
        id: null,
      })
    );
  });

  // Session termination not needed in stateless mode
  app.delete("/mcp", async (req: Request, res: Response) => {
    logger.log("Received DELETE MCP request");
    res.writeHead(405).end(
      JSON.stringify({
        jsonrpc: "2.0",
        error: {
          code: -32000,
          message: "Method not allowed.",
        },
        id: null,
      })
    );
  });

  // Start the HTTP server
  const PORT = 3000;
  try {
    app.listen(PORT, (error) => {
      if (error) {
        logger.error("Failed to start server:", error);
        process.exit(1);
      }
      logger.log(
        `MCP Stateless Streamable HTTP Server listening on port ${PORT}`
      );
    });
  } catch (error) {
    logger.error("Failed to set up the server:", error);
    process.exit(1);
  }
}

function getServerInstance() {
  const mcpServer = new McpServer({
    name: "tandoor-server",
    version: "1.0.0",
  });
  registerEndpoints(mcpServer);
  return mcpServer;
}

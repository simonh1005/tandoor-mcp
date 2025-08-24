// Central logger utility for MCP server
// Prevents stdout interference in stdio mode while preserving logging in other modes

export interface Logger {
  log: (message: string, ...args: any[]) => void;
  error: (message: string, ...args: any[]) => void;
}

export function createLogger(): Logger {
  // Detect if we're in stdio mode by checking if stdout is being used for MCP communication
  const isStdioMode =
    process.argv.includes("--stdio") || process.env.MCP_TRANSPORT === "stdio";

  return {
    log: (message: string, ...args: any[]) => {
      if (!isStdioMode) {
        console.log(message, ...args);
      }
    },
    error: (message: string, ...args: any[]) => {
      if (!isStdioMode) {
        console.error(message, ...args);
      }
      // In stdio mode, we suppress all output to avoid interfering with MCP protocol
    },
  };
}

// Export a default logger instance for convenience
export const logger = createLogger();

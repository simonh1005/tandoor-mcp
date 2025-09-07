// Central logger utility for MCP server
// Prevents stdout interference in stdio mode while preserving logging in other modes
import { settings } from "./settings";

export interface Logger {
  log: (message: string, ...args: any[]) => void;
  error: (message: string, ...args: any[]) => void;
}

export function createLogger(): Logger {
  // Detect if we're in stdio mode by checking if stdout is being used for MCP communication
  const isStdioMode = settings.mode === "stdio";

  return {
    log: (message: string, ...args: any[]) => {
      if (!isStdioMode) {
        console.log(message, ...args);
      }
    },
    error: (message: string, ...args: any[]) => {
      console.error(message, ...args);
    },
  };
}

// Export a default logger instance for convenience
export const logger = createLogger();

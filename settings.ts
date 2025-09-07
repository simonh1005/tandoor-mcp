export interface Settings {
  mode: "stdio" | "http" | "all";
}

export const settings: Settings = {
  mode:
    process.argv.includes("--stdio") || process.env.MCP_TRANSPORT === "stdio"
      ? "stdio"
      : "all",
};

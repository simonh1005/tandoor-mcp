# Tandoor MCP Server

A Model Context Protocol (MCP) server that provides tools for interacting with a Tandoor recipe management system. This server enables AI assistants like Claude to query recipes, browse keywords, and manage shopping lists in your Tandoor instance.

## Features

This MCP server provides three main tools:

- **list-recipes**: Search and list recipes from your Tandoor library

  - Filter by recipe name
  - Filter by keyword/tag ID
  - Returns recipe details including ingredients, instructions, and metadata

- **list-keywords**: Browse all keywords/tags in your Tandoor system

  - Filter keywords by name
  - Useful for discovering available tags for recipe filtering

- **add-shopping-list-item**: Add items to your Tandoor shopping list
  - Add food items with quantity
  - Integrates with Tandoor's shopping list functionality

## Installation

### Prerequisites

- [Bun](https://bun.com) runtime (v1.2.19 or later)
- A running Tandoor instance with API access
- Tandoor API token

### Setup

1. **Clone and install dependencies:**

   ```bash
   git clone <repository-url>
   cd tandoor-mcp
   bun install
   ```

2. **Build the project:**

   ```bash
   bun run build
   ```

3. **Configure environment variables:**
   Create a `.env` file or set environment variables:
   ```bash
   export TANDOOR_API_URL="https://your-tandoor-instance.com/api"
   export TANDOOR_API_TOKEN="your-api-token-here"
   ```

## Usage

The server supports two transport modes: **HTTP** and **Stdio**.

### HTTP Mode

Run the server as an HTTP service on port 3000:

```bash
# Development mode (with hot reload)
bun run watch

# Production mode (built version)
bun run start
```

The HTTP server provides:

- **POST /mcp**: Main MCP endpoint for handling requests

### Stdio Mode

Run the server in stdio mode for integration with Claude Desktop:

```bash
bun run start
```

#### Claude Desktop Configuration

Add the following to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "tandoor-mcp": {
      "command": "bun",
      "args": ["run", "--cwd=/path/to/tandoor-mcp", "start"],
      "disabled": false,
      "autoApprove": []
    }
  }
}
```

Replace `/path/to/tandoor-mcp` with the actual path to your tandoor-mcp directory.

## Troubleshooting

### Environment Variables

Ensure both `TANDOOR_API_URL` and `TANDOOR_API_TOKEN` are set:

```bash
echo "TANDOOR_API_URL: $TANDOOR_API_URL"
echo "TANDOOR_API_TOKEN: $TANDOOR_API_TOKEN"
```

### Common Issues

1. **"InvalidTarget" error**: Make sure you're using the correct build target (`--target=node`)
2. **Connection errors**: Verify your Tandoor instance is running and accessible
3. **Authentication errors**: Check that your API token is valid and has the necessary permissions

### Debugging

Use the MCP inspector for debugging:

```bash
bun run inspector
```

This will start both the development server and the MCP inspector for testing tool integrations.

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { addShoppingListItem, listKeywords, listRecipes } from "./tandoor";

export function registerEndpoints(server: McpServer): McpServer {
  server.registerTool(
    "list-recipes",
    {
      title: "List Recipes",
      description: "List Recipes in the Users Tandoor Library",
      inputSchema: {
        name: z
          .string({
            description:
              "Allows to filter for recipes having this string in their name.",
          })
          .optional(),
        keywordId: z
          .number({
            description:
              "ID of keyword a recipe should have. For multiple repeat parameter. ",
          })
          .optional(),
      },
    },
    async ({ name, keywordId: tagId }) => ({
      content: [
        {
          type: "text",
          text: await listRecipes(name, tagId).then((recipes) =>
            JSON.stringify(recipes)
          ),
        },
      ],
    })
  );

  server.registerTool(
    "list-keywords",
    {
      title: "List Keywords",
      description: "List all Keywords of Recipes in the Users Tandoor Library",
      inputSchema: {
        name: z
          .string({
            description:
              "Allows to filter for keywords having this string name.",
          })
          .optional(),
      },
    },
    async ({ name }) => ({
      content: [
        {
          type: "text",
          text: await listKeywords(name).then((keyword) =>
            JSON.stringify(keyword)
          ),
        },
      ],
    })
  );

  server.registerTool(
    "add-shopping-list-item",
    {
      title: "Add Shopping List Item",
      description: "Add an item to the Tandoor Shopping List",
      inputSchema: {
        name: z.string({
          description: "Name of the item to add to the shopping list.",
        }),
        quantity: z
          .number({
            description: "Quantity of the item to add to the shopping list.",
          })
          .default(1),
      },
    },
    async ({ name, quantity }) => ({
      content: [
        {
          type: "text",
          text: await addShoppingListItem(name, quantity).then((result) =>
            JSON.stringify(result)
          ),
        },
      ],
    })
  );

  return server;
}

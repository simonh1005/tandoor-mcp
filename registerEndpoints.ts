import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import {
  addShoppingListItem,
  addRecipeToMealPlan,
  listKeywords,
  listRecipes,
} from "./tandoor";

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

  server.registerTool(
    "add-recipe-to-meal-plan",
    {
      title: "Add Recipe to Meal Plan",
      description:
        "Add a recipe to your Tandoor meal plan. Note: Adding a recipe to the meal plan will also automatically add all of its ingredients to your shopping list.",
      inputSchema: {
        recipeId: z.number({
          description: "ID of the recipe to add to the meal plan.",
        }),
        servings: z.number({
          description: "Number of servings for the recipe.",
        }),
        fromDate: z.string({
          description: "Date for the meal plan entry in YYYY-MM-DD format.",
        }),
        mealTypeId: z.number({
          description: "ID of the meal type (e.g., Breakfast, Lunch, Dinner).",
        }),
        title: z
          .string({
            description: "Optional title for the meal plan entry.",
          })
          .optional(),
      },
    },
    async ({ recipeId, servings, fromDate, mealTypeId, title }) => ({
      content: [
        {
          type: "text",
          text: await addRecipeToMealPlan(
            recipeId,
            servings,
            fromDate,
            mealTypeId,
            title,
            "Added via MCP"
          ).then((result) => JSON.stringify(result)),
        },
      ],
    })
  );

  return server;
}

import axios from "axios";
import { logger } from "./logger.js";

const TANDOOR_API_URL = process.env.TANDOOR_API_URL;
const TANDOOR_API_TOKEN = process.env.TANDOOR_API_TOKEN;

if (!TANDOOR_API_URL || !TANDOOR_API_TOKEN) {
  throw new Error(
    "TANDOOR_API_URL and TANDOOR_API_TOKEN environment variables must be set"
  );
}

type TandoorKeywordId = {
  id: number;
  label: string;
};

type TandoorKeyword = TandoorKeywordId & {
  name: string;
  description: string;
  parent: string;
  numchild: number;
  created_at: Date;
  updated_at: Date;
  full_name: string;
};

type TandoorRecipe = {
  id: number;
  name: string;
  description: string | null;
  image: string | null;
  keywords: TandoorKeywordId[];
  working_time: number;
  waiting_time: number;
  created_by: number;
  created_at: string; // ISO date string
  updated_at: string; // ISO date string
  internal: boolean;
  servings: number;
  servings_text: string;
  rating: number | null;
  last_cooked: string | null; // ISO date string or null
  new: boolean;
};

// Initialize HTTP client with credentials
const tandoorClient = axios.create({
  baseURL: TANDOOR_API_URL,
  headers: {
    Authorization: `Bearer ${TANDOOR_API_TOKEN}`,
    "Content-Type": "application/json",
  },
});

export async function listRecipes(
  name?: string,
  keywords?: number
): Promise<TandoorRecipe[]> {
  const params: Record<string, string | number | undefined> = {};
  params.query = name;
  params.keywords = keywords;

  logger.log("Fetching recipes with params:", params);

  return tandoorClient
    .get("/recipe", { params })
    .then((response) => {
      return response.data.results;
    })
    .catch((error) => {
      logger.error("Error fetching recipes:", error);
      return { error: "Failed to fetch recipes", details: error.message };
    });
}

export async function listKeywords(name?: string): Promise<TandoorKeyword[]> {
  const params: Record<string, string | number | undefined> = {};
  params.query = name;
  logger.log("Fetching keywords with params:", params);

  return tandoorClient
    .get("/keyword", { params })
    .then((response) => {
      return response.data.results;
    })
    .catch((error) => {
      logger.error("Error fetching keywords:", error);
      return { error: "Failed to fetch keywords", details: error.message };
    });
}

export async function addShoppingListItem(
  name: string,
  quantity: number = 1
): Promise<object> {
  return tandoorClient
    .post("shopping-list-entry/", {
      food: {
        name: name,
      },
      amount: quantity,
    })
    .then((res) => {
      logger.log("Added shopping list item:", res.data);
      return { success: true };
    })
    .catch((error) => {
      logger.error("Error adding shopping list item:", error);
      return {
        error: "Failed to add shopping list item",
        details: error.message,
      };
    });
}

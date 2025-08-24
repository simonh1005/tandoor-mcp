import axios, { AxiosError } from "axios";
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

type TandoorError = {
  error: string;
  details: string;
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
    .catch(handleTandoorError("Error fetching recipes:"));
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
    .catch(handleTandoorError("Error fetching keywords:"));
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
    .catch(handleTandoorError("Error adding shopping list item:"));
}

export async function addRecipeToMealPlan(
  recipeId: number,
  servings: number,
  fromDate: string,
  mealTypeId: number,
  title?: string,
  note?: string
): Promise<object> {
  return tandoorClient
    .post("meal-plan/", {
      recipe: recipeId,
      servings: servings,
      from_date: fromDate,
      meal_type: mealTypeId,
      title: title,
      note: note,
    })
    .then((res) => {
      logger.log("Added recipe to meal plan:", res.data);
      return {
        success: true,
        meal_plan: res.data,
        message: `Recipe added to meal plan. Note: This will also add all recipe ingredients to your shopping list automatically.`,
      };
    })
    .catch(handleTandoorError("Error adding recipe to meal plan:"));
}

export async function listMealTypes(): Promise<object> {
  return tandoorClient
    .get("meal-type/")
    .then((res) => {
      logger.log("Fetched meal types:", res.data);
      return {
        success: true,
        meal_types: res.data,
      };
    })
    .catch(handleTandoorError("Error fetching meal types:"));
}

function handleTandoorError(message: string) {
  return function (error: AxiosError): TandoorError {
    const readableError = `{code: ${error.code} , "message": ${JSON.stringify(
      error.response?.data
    )}`;
    logger.error(message, readableError);
    return {
      error: message,
      details: readableError,
    };
  };
}

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.1.142:3000';

console.log('🔧 Recipe API URL:', API_URL); // Debug log

export interface Recipe {
  id: number;
  title: string;
  image?: string;
  ingredients?: string[];
  instructions?: string;
  readyInMinutes?: number;
  servings?: number;
  sourceUrl?: string;
}

interface RecipeSuggestionsResponse {
  recipes: Recipe[];
}

interface RecipeSearchResponse {
  recipes: Recipe[];
}

interface RecipeDetailsResponse {
  recipe: Recipe;
}

export const recipeApi = {
  /**
   * Get recipe suggestions based on list name and products
   */
  async getSuggestions(listName: string, products?: string[]): Promise<Recipe[]> {
    try {
      console.log('🍳 Fetching recipe suggestions for:', listName);
      console.log('📡 Connecting to:', `${API_URL}/api/recipes/suggest`);
      
      const response = await fetch(`${API_URL}/api/recipes/suggest`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ listName, products }),
      });

      if (!response.ok) {
        console.error('❌ HTTP Error:', response.status, response.statusText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json() as RecipeSuggestionsResponse;
      console.log('✅ Received recipes:', data.recipes?.length || 0);
      
      return data.recipes || [];
    } catch (error) {
      console.error('❌ Recipe API error:', error);
      console.error('❌ Error details:', {
        name: error instanceof Error ? error.name : 'Unknown',
        message: error instanceof Error ? error.message : 'Unknown error',
        apiUrl: API_URL,
      });
      return [];
    }
  },

  /**
   * Search recipes by query string
   */
  async searchRecipes(query: string): Promise<Recipe[]> {
    try {
      console.log('🔍 Searching recipes for:', query);
      console.log('📡 Connecting to:', `${API_URL}/api/recipes/search/${query}`);
      
      const response = await fetch(
        `${API_URL}/api/recipes/search/${encodeURIComponent(query)}`
      );

      if (!response.ok) {
        console.error('❌ HTTP Error:', response.status, response.statusText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json() as RecipeSearchResponse;
      console.log('✅ Found recipes:', data.recipes?.length || 0);
      
      return data.recipes || [];
    } catch (error) {
      console.error('❌ Recipe search error:', error);
      console.error('❌ Error details:', {
        name: error instanceof Error ? error.name : 'Unknown',
        message: error instanceof Error ? error.message : 'Unknown error',
        apiUrl: API_URL,
      });
      return [];
    }
  },

  /**
   * Get detailed recipe information by ID
   */
  async getRecipeDetails(id: number): Promise<Recipe | null> {
    try {
      console.log('📖 Fetching recipe details for ID:', id);
      console.log('📡 Connecting to:', `${API_URL}/api/recipes/details/${id}`);
      
      const response = await fetch(`${API_URL}/api/recipes/details/${id}`);

      if (!response.ok) {
        console.error('❌ HTTP Error:', response.status, response.statusText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json() as RecipeDetailsResponse;
      console.log('✅ Received recipe details:', data.recipe?.title || 'Unknown');
      
      return data.recipe || null;
    } catch (error) {
      console.error('❌ Recipe details error:', error);
      console.error('❌ Error details:', {
        name: error instanceof Error ? error.name : 'Unknown',
        message: error instanceof Error ? error.message : 'Unknown error',
        apiUrl: API_URL,
      });
      return null;
    }
  },
};
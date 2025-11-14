import { useState, useCallback } from 'react';
import { recipeApi, Recipe } from '@/services/recipeApi';

export function useRecipeSuggestions() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSuggestions = useCallback(async (listName: string, products?: string[]) => {
    setLoading(true);
    setError(null);
    
    try {
      const results = await recipeApi.getSuggestions(listName, products);
      setRecipes(results);
      return results;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch recipes';
      setError(errorMessage);
      console.error('Error fetching suggestions:', errorMessage);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const searchRecipes = useCallback(async (query: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const results = await recipeApi.searchRecipes(query);
      setRecipes(results);
      return results;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to search recipes';
      setError(errorMessage);
      console.error('Error searching recipes:', errorMessage);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const clearRecipes = useCallback(() => {
    setRecipes([]);
    setError(null);
  }, []);

  return {
    recipes,
    loading,
    error,
    fetchSuggestions,
    searchRecipes,
    clearRecipes,
  };
}
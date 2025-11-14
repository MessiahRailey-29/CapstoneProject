import express, { Request, Response } from 'express';

const router = express.Router();

interface RecipeSuggestionRequest {
  listName: string;
  products?: string[];
}

interface Recipe {
  id: number;
  title: string;
  image?: string;
  ingredients?: string[];
  instructions?: string;
  readyInMinutes?: number;
  servings?: number;
  sourceUrl?: string;
}

// ⭐ Spoonacular API response types
interface SpoonacularRecipe {
  id: number;
  title: string;
  image?: string;
  readyInMinutes?: number;
  servings?: number;
  sourceUrl?: string;
  extendedIngredients?: Array<{ original: string }>;
  instructions?: string;
}

interface SpoonacularSearchResponse {
  results: SpoonacularRecipe[];
  offset: number;
  number: number;
  totalResults: number;
}

interface SpoonacularRecipeDetailsResponse extends SpoonacularRecipe {
  // Additional fields from the details endpoint
}

// ✅ FIX: Use globalThis.fetch to avoid type conflicts with Express Response
// This explicitly uses the global Fetch API Response type, not Express's Response
async function fetchRecipeData(url: string): Promise<any> {
  try {
    // For Node 18+
    if (typeof globalThis.fetch !== 'undefined') {
      const response = await globalThis.fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    }
    
    // For Node < 18, use dynamic import of node-fetch
    const nodeFetch = await import('node-fetch');
    const response = await nodeFetch.default(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('❌ Fetch error:', error);
    throw error;
  }
}

// Simple recipe suggestion based on keywords
router.post('/suggest', async (req: Request, res: Response) => {
  try {
    const { listName, products } = req.body as RecipeSuggestionRequest;

    if (!listName) {
      return res.status(400).json({ error: 'List name is required' });
    }

    console.log('🍳 Fetching recipe suggestions for:', listName);
    console.log('📦 With products:', products);

    // Option 1: Use Spoonacular API (you'll need an API key)
    const SPOONACULAR_API_KEY = process.env.SPOONACULAR_API_KEY || '';
    
    if (SPOONACULAR_API_KEY) {
      try {
        const query = encodeURIComponent(listName);
        const url = `https://api.spoonacular.com/recipes/complexSearch?query=${query}&number=5&addRecipeInformation=true&apiKey=${SPOONACULAR_API_KEY}`;
        
        console.log('🌐 Calling Spoonacular API...');
        const data = await fetchRecipeData(url) as SpoonacularSearchResponse;
        
        const recipes: Recipe[] = data.results.map((recipe: SpoonacularRecipe) => ({
          id: recipe.id,
          title: recipe.title,
          image: recipe.image,
          readyInMinutes: recipe.readyInMinutes,
          servings: recipe.servings,
          sourceUrl: recipe.sourceUrl,
        }));

        console.log('✅ Found', recipes.length, 'recipes from Spoonacular');
        return res.json({ recipes });
      } catch (apiError) {
        console.error('❌ Spoonacular API failed, falling back to mock data:', apiError);
        // Fall through to mock data
      }
    }

    // Option 2: Fallback to mock data (for testing without API key)
    console.log('📋 Using mock recipe data');
    const mockRecipes: Recipe[] = getMockRecipes(listName);
    
    res.json({ recipes: mockRecipes });
  } catch (error) {
    console.error('❌ Error fetching recipe suggestions:', error);
    console.error('❌ Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    res.status(500).json({ 
      error: 'Failed to fetch recipe suggestions',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Search recipes by query
router.get('/search/:query', async (req: Request, res: Response) => {
  try {
    const { query } = req.params;

    console.log('🔍 Searching recipes for:', query);

    const SPOONACULAR_API_KEY = process.env.SPOONACULAR_API_KEY || '';
    
    if (SPOONACULAR_API_KEY) {
      try {
        const searchQuery = encodeURIComponent(query);
        const url = `https://api.spoonacular.com/recipes/complexSearch?query=${searchQuery}&number=10&addRecipeInformation=true&apiKey=${SPOONACULAR_API_KEY}`;
        
        console.log('🌐 Calling Spoonacular API...');
        const data = await fetchRecipeData(url) as SpoonacularSearchResponse;
        
        const recipes: Recipe[] = data.results.map((recipe: SpoonacularRecipe) => ({
          id: recipe.id,
          title: recipe.title,
          image: recipe.image,
          readyInMinutes: recipe.readyInMinutes,
          servings: recipe.servings,
          sourceUrl: recipe.sourceUrl,
        }));

        console.log('✅ Found', recipes.length, 'recipes from Spoonacular');
        return res.json({ recipes });
      } catch (apiError) {
        console.error('❌ Spoonacular API failed, falling back to mock data:', apiError);
        // Fall through to mock data
      }
    }

    // Fallback to mock data
    console.log('📋 Using mock recipe data');
    const mockRecipes: Recipe[] = getMockRecipes(query);
    
    res.json({ recipes: mockRecipes });
  } catch (error) {
    console.error('❌ Error searching recipes:', error);
    console.error('❌ Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    res.status(500).json({ 
      error: 'Failed to search recipes',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get recipe details by ID
router.get('/details/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    console.log('📖 Fetching recipe details for ID:', id);

    const SPOONACULAR_API_KEY = process.env.SPOONACULAR_API_KEY || '';
    
    if (SPOONACULAR_API_KEY) {
      try {
        const url = `https://api.spoonacular.com/recipes/${id}/information?apiKey=${SPOONACULAR_API_KEY}`;
        
        console.log('🌐 Calling Spoonacular API...');
        const data = await fetchRecipeData(url) as SpoonacularRecipeDetailsResponse;
        
        const recipe: Recipe = {
          id: data.id,
          title: data.title,
          image: data.image,
          readyInMinutes: data.readyInMinutes,
          servings: data.servings,
          sourceUrl: data.sourceUrl,
          ingredients: data.extendedIngredients?.map((ing) => ing.original),
          instructions: data.instructions,
        };

        console.log('✅ Found recipe:', recipe.title);
        return res.json({ recipe });
      } catch (apiError) {
        console.error('❌ Spoonacular API failed, falling back to mock data:', apiError);
        // Fall through to mock data
      }
    }

    // Fallback to mock data
    console.log('📋 Using mock recipe data');
    const mockRecipe = getMockRecipeDetails(parseInt(id));
    
    res.json({ recipe: mockRecipe });
  } catch (error) {
    console.error('❌ Error fetching recipe details:', error);
    console.error('❌ Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    res.status(500).json({ 
      error: 'Failed to fetch recipe details',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Mock recipe data for testing without API key
function getMockRecipes(query: string): Recipe[] {
  const lowerQuery = query.toLowerCase();
  
  const allRecipes: Recipe[] = [
    {
      id: 1,
      title: 'Spaghetti Carbonara',
      image: 'https://spoonacular.com/recipeImages/715538-312x231.jpg',
      readyInMinutes: 30,
      servings: 4,
      sourceUrl: 'https://www.example.com',
    },
    {
      id: 2,
      title: 'Chicken Adobo',
      image: 'https://spoonacular.com/recipeImages/715497-312x231.jpg',
      readyInMinutes: 45,
      servings: 6,
      sourceUrl: 'https://www.example.com',
    },
    {
      id: 3,
      title: 'Vegetable Stir Fry',
      image: 'https://spoonacular.com/recipeImages/716429-312x231.jpg',
      readyInMinutes: 20,
      servings: 4,
      sourceUrl: 'https://www.example.com',
    },
    {
      id: 4,
      title: 'Beef Tacos',
      image: 'https://spoonacular.com/recipeImages/663050-312x231.jpg',
      readyInMinutes: 25,
      servings: 4,
      sourceUrl: 'https://www.example.com',
    },
    {
      id: 5,
      title: 'Caesar Salad',
      image: 'https://spoonacular.com/recipeImages/546423-312x231.jpg',
      readyInMinutes: 15,
      servings: 2,
      sourceUrl: 'https://www.example.com',
    },
  ];

  // Filter based on query keywords
  if (lowerQuery.includes('dinner') || lowerQuery.includes('lunch')) {
    return allRecipes.slice(0, 4);
  } else if (lowerQuery.includes('breakfast')) {
    return [
      {
        id: 6,
        title: 'Pancakes with Maple Syrup',
        image: 'https://spoonacular.com/recipeImages/654812-312x231.jpg',
        readyInMinutes: 20,
        servings: 4,
      },
      {
        id: 7,
        title: 'Scrambled Eggs and Toast',
        image: 'https://spoonacular.com/recipeImages/648320-312x231.jpg',
        readyInMinutes: 10,
        servings: 2,
      },
    ];
  } else if (lowerQuery.includes('party') || lowerQuery.includes('snack')) {
    return [
      {
        id: 8,
        title: 'Chicken Wings',
        image: 'https://spoonacular.com/recipeImages/638247-312x231.jpg',
        readyInMinutes: 40,
        servings: 8,
      },
      {
        id: 9,
        title: 'Nachos Supreme',
        image: 'https://spoonacular.com/recipeImages/547775-312x231.jpg',
        readyInMinutes: 15,
        servings: 6,
      },
    ];
  }

  // Default: return all recipes
  return allRecipes;
}

function getMockRecipeDetails(id: number): Recipe {
  return {
    id,
    title: 'Sample Recipe',
    image: 'https://spoonacular.com/recipeImages/715538-312x231.jpg',
    readyInMinutes: 30,
    servings: 4,
    ingredients: [
      '2 cups all-purpose flour',
      '1 cup milk',
      '2 eggs',
      '1 tsp salt',
    ],
    instructions: '1. Mix ingredients. 2. Cook. 3. Serve hot.',
    sourceUrl: 'https://www.example.com',
  };
}

export default router;
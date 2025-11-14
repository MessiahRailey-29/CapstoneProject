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

// 🍽️ TheMealDB API response types
interface MealDBRecipe {
  idMeal: string;
  strMeal: string;
  strMealThumb: string;
  strInstructions: string;
  strYoutube?: string;
  strSource?: string;
  // Ingredients (up to 20)
  strIngredient1?: string;
  strIngredient2?: string;
  strIngredient3?: string;
  strIngredient4?: string;
  strIngredient5?: string;
  strIngredient6?: string;
  strIngredient7?: string;
  strIngredient8?: string;
  strIngredient9?: string;
  strIngredient10?: string;
  strIngredient11?: string;
  strIngredient12?: string;
  strIngredient13?: string;
  strIngredient14?: string;
  strIngredient15?: string;
  strIngredient16?: string;
  strIngredient17?: string;
  strIngredient18?: string;
  strIngredient19?: string;
  strIngredient20?: string;
  // Measures
  strMeasure1?: string;
  strMeasure2?: string;
  strMeasure3?: string;
  strMeasure4?: string;
  strMeasure5?: string;
  strMeasure6?: string;
  strMeasure7?: string;
  strMeasure8?: string;
  strMeasure9?: string;
  strMeasure10?: string;
  strMeasure11?: string;
  strMeasure12?: string;
  strMeasure13?: string;
  strMeasure14?: string;
  strMeasure15?: string;
  strMeasure16?: string;
  strMeasure17?: string;
  strMeasure18?: string;
  strMeasure19?: string;
  strMeasure20?: string;
}

interface MealDBSearchResponse {
  meals: MealDBRecipe[] | null;
}

// ✅ Fetch helper function
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

// Helper function to extract ingredients from MealDB recipe
function extractIngredients(meal: MealDBRecipe): string[] {
  const ingredients: string[] = [];
  
  for (let i = 1; i <= 20; i++) {
    const ingredient = meal[`strIngredient${i}` as keyof MealDBRecipe];
    const measure = meal[`strMeasure${i}` as keyof MealDBRecipe];
    
    if (ingredient && ingredient.trim()) {
      const ingredientText = measure && measure.trim() 
        ? `${measure.trim()} ${ingredient.trim()}`
        : ingredient.trim();
      ingredients.push(ingredientText);
    }
  }
  
  return ingredients;
}

// Helper function to convert MealDB recipe to our Recipe format
function convertMealDBToRecipe(meal: MealDBRecipe): Recipe {
  return {
    id: parseInt(meal.idMeal),
    title: meal.strMeal,
    image: meal.strMealThumb,
    ingredients: extractIngredients(meal),
    instructions: meal.strInstructions,
    sourceUrl: meal.strSource || meal.strYoutube || undefined,
    // TheMealDB doesn't provide these, so we'll estimate
    readyInMinutes: 30, // Default estimate
    servings: 4, // Default estimate
  };
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

    try {
      // TheMealDB API - Search by name
      // Extract key ingredient/meal type from listName
      const searchTerm = extractSearchTerm(listName);
      const url = `https://www.themealdb.com/api/json/v1/1/search.php?s=${encodeURIComponent(searchTerm)}`;
      
      console.log('🌐 Calling TheMealDB API with search term:', searchTerm);
      const data = await fetchRecipeData(url) as MealDBSearchResponse;
      
      if (data.meals && data.meals.length > 0) {
        // Convert to our Recipe format and limit to 5 results
        const recipes: Recipe[] = data.meals
          .slice(0, 5)
          .map(meal => convertMealDBToRecipe(meal));

        console.log('✅ Found', recipes.length, 'recipes from TheMealDB');
        return res.json({ recipes });
      } else {
        // Try searching by main ingredient if name search fails
        console.log('🔄 No results for name search, trying ingredient search...');
        const ingredientUrl = `https://www.themealdb.com/api/json/v1/1/filter.php?i=${encodeURIComponent(searchTerm)}`;
        const ingredientData = await fetchRecipeData(ingredientUrl) as MealDBSearchResponse;
        
        if (ingredientData.meals && ingredientData.meals.length > 0) {
          // Get detailed info for each meal (filter endpoint returns limited data)
          const detailedRecipes = await Promise.all(
            ingredientData.meals.slice(0, 5).map(async (meal) => {
              const detailUrl = `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${meal.idMeal}`;
              const detailData = await fetchRecipeData(detailUrl) as MealDBSearchResponse;
              return detailData.meals ? convertMealDBToRecipe(detailData.meals[0]) : null;
            })
          );
          
          const recipes = detailedRecipes.filter((r): r is Recipe => r !== null);
          console.log('✅ Found', recipes.length, 'recipes from TheMealDB (by ingredient)');
          return res.json({ recipes });
        }
        
        console.log('📋 No results from TheMealDB, using mock data');
        throw new Error('No results found');
      }
    } catch (apiError) {
      console.error('❌ TheMealDB API failed, falling back to mock data:', apiError);
      // Fall through to mock data
    }

    // Fallback to mock data (for testing or when API fails)
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

    try {
      // TheMealDB API - Search by name
      const url = `https://www.themealdb.com/api/json/v1/1/search.php?s=${encodeURIComponent(query)}`;
      
      console.log('🌐 Calling TheMealDB API...');
      const data = await fetchRecipeData(url) as MealDBSearchResponse;
      
      if (data.meals && data.meals.length > 0) {
        // Convert to our Recipe format
        const recipes: Recipe[] = data.meals.map(meal => convertMealDBToRecipe(meal));

        console.log('✅ Found', recipes.length, 'recipes from TheMealDB');
        return res.json({ recipes });
      } else {
        console.log('📋 No results from TheMealDB, using mock data');
        throw new Error('No results found');
      }
    } catch (apiError) {
      console.error('❌ TheMealDB API failed, falling back to mock data:', apiError);
      // Fall through to mock data
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

    try {
      // TheMealDB API - Lookup by ID
      const url = `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${id}`;
      
      console.log('🌐 Calling TheMealDB API...');
      const data = await fetchRecipeData(url) as MealDBSearchResponse;
      
      if (data.meals && data.meals.length > 0) {
        const recipe = convertMealDBToRecipe(data.meals[0]);
        console.log('✅ Found recipe:', recipe.title);
        return res.json({ recipe });
      } else {
        console.log('📋 No recipe found, using mock data');
        throw new Error('Recipe not found');
      }
    } catch (apiError) {
      console.error('❌ TheMealDB API failed, falling back to mock data:', apiError);
      // Fall through to mock data
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

// Helper function to extract meaningful search term from list name
function extractSearchTerm(listName: string): string {
  const lowerName = listName.toLowerCase();
  
  // Common list name patterns
  const patterns: { [key: string]: string } = {
    'breakfast': 'breakfast',
    'lunch': 'chicken',
    'dinner': 'beef',
    'party': 'chicken',
    'snack': 'dessert',
    'dessert': 'dessert',
    'adobo': 'chicken',
    'pasta': 'pasta',
    'chicken': 'chicken',
    'beef': 'beef',
    'pork': 'pork',
    'fish': 'fish',
    'seafood': 'seafood',
    'vegetarian': 'vegetarian',
    'salad': 'salad',
    'soup': 'soup',
    'rice': 'rice',
  };
  
  // Check for pattern matches
  for (const [key, value] of Object.entries(patterns)) {
    if (lowerName.includes(key)) {
      return value;
    }
  }
  
  // Default: use first meaningful word or just use the list name
  const words = listName.split(/\s+/).filter(w => w.length > 3);
  return words[0] || listName;
}

// Mock recipe data for testing without API
function getMockRecipes(query: string): Recipe[] {
  const lowerQuery = query.toLowerCase();
  
  const allRecipes: Recipe[] = [
    {
      id: 1,
      title: 'Spaghetti Carbonara',
      image: 'https://www.themealdb.com/images/media/meals/llcbn01574260722.jpg',
      readyInMinutes: 30,
      servings: 4,
      ingredients: [
        '200g Spaghetti',
        '100g Pancetta',
        '2 Eggs',
        '50g Parmesan',
        'Black Pepper',
      ],
      instructions: 'Cook pasta. Fry pancetta. Mix eggs and cheese. Combine all.',
      sourceUrl: 'https://www.themealdb.com',
    },
    {
      id: 2,
      title: 'Chicken Adobo',
      image: 'https://www.themealdb.com/images/media/meals/uwxqwy1483389553.jpg',
      readyInMinutes: 45,
      servings: 6,
      ingredients: [
        '1kg Chicken',
        '1/2 cup Soy Sauce',
        '1/2 cup Vinegar',
        '6 cloves Garlic',
        'Bay Leaves',
      ],
      instructions: 'Marinate chicken. Simmer in sauce until tender.',
      sourceUrl: 'https://www.themealdb.com',
    },
    {
      id: 3,
      title: 'Vegetable Stir Fry',
      image: 'https://www.themealdb.com/images/media/meals/wvpsxx1468256321.jpg',
      readyInMinutes: 20,
      servings: 4,
      ingredients: [
        '2 cups Mixed Vegetables',
        '2 tbsp Soy Sauce',
        '1 tbsp Oil',
        '2 cloves Garlic',
        '1 tsp Ginger',
      ],
      instructions: 'Heat oil. Stir fry vegetables. Add sauce.',
      sourceUrl: 'https://www.themealdb.com',
    },
    {
      id: 4,
      title: 'Beef Tacos',
      image: 'https://www.themealdb.com/images/media/meals/uvuyxu1503067369.jpg',
      readyInMinutes: 25,
      servings: 4,
      ingredients: [
        '500g Ground Beef',
        '8 Taco Shells',
        '1 cup Lettuce',
        '1 cup Cheese',
        'Salsa',
      ],
      instructions: 'Cook beef. Fill taco shells. Add toppings.',
      sourceUrl: 'https://www.themealdb.com',
    },
    {
      id: 5,
      title: 'Caesar Salad',
      image: 'https://www.themealdb.com/images/media/meals/wyxwsp1486979827.jpg',
      readyInMinutes: 15,
      servings: 2,
      ingredients: [
        '1 Romaine Lettuce',
        '1/2 cup Caesar Dressing',
        '1/2 cup Croutons',
        '1/4 cup Parmesan',
      ],
      instructions: 'Chop lettuce. Add dressing and toppings.',
      sourceUrl: 'https://www.themealdb.com',
    },
  ];

  // Filter based on query keywords
  if (lowerQuery.includes('dinner') || lowerQuery.includes('lunch')) {
    return allRecipes.slice(0, 4);
  } else if (lowerQuery.includes('breakfast')) {
    return [
      {
        id: 6,
        title: 'Pancakes',
        image: 'https://www.themealdb.com/images/media/meals/rwuyqx1511383174.jpg',
        readyInMinutes: 20,
        servings: 4,
        ingredients: ['2 cups Flour', '2 Eggs', '1 cup Milk', 'Butter'],
        instructions: 'Mix ingredients. Cook on griddle.',
        sourceUrl: 'https://www.themealdb.com',
      },
    ];
  }

  return allRecipes;
}

function getMockRecipeDetails(id: number): Recipe {
  return {
    id,
    title: 'Sample Recipe',
    image: 'https://www.themealdb.com/images/media/meals/llcbn01574260722.jpg',
    readyInMinutes: 30,
    servings: 4,
    ingredients: [
      '2 cups all-purpose flour',
      '1 cup milk',
      '2 eggs',
      '1 tsp salt',
    ],
    instructions: '1. Mix ingredients. 2. Cook. 3. Serve hot.',
    sourceUrl: 'https://www.themealdb.com',
  };
}

export default router;
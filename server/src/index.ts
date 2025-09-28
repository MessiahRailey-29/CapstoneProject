// ===== index.ts =====
import { durableObjectFetch, GroceriesDurableObject } from './GroceriesDurableObject';

export interface Env {
  groceries_db: D1Database;
  GroceriesDurableObjects: DurableObjectNamespace;
}

// Export the Durable Object class
export { GroceriesDurableObject };

// CORS helper function
function corsHeaders(origin?: string) {
  return {
    'Access-Control-Allow-Origin': origin || '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400',
  };
}

// =======================
// Worker Entrypoint
// =======================
export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);

    // Handle CORS preflight requests
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: corsHeaders(),
      });
    }

    // ----- WebSocket Sync Routes (TinyBase sync) -----
    const upgradeHeader = request.headers.get('Upgrade');
    if (upgradeHeader === 'websocket') {
      // Extract store ID from the URL path
      const pathParts = url.pathname.split('/').filter(Boolean);
      const storeId = pathParts[pathParts.length - 1] || 'default';
      
      // Route WebSocket connections to Durable Object for sync
      const id = env.GroceriesDurableObjects.idFromName(storeId);
      const stub = env.GroceriesDurableObjects.get(id);
      return stub.fetch(request);
    }

    // ----- API Routes for Database Products -----
    if (url.pathname.startsWith('/api/products')) {
      const id = url.searchParams.get('id');
      if (id) {
        return await getProduct(env, parseInt(id));
      } else {
        return await getProducts(env);
      }
    }

    if (url.pathname.startsWith('/api/prices')) {
      const productId = url.searchParams.get('product_id');
      if (productId) {
        return await getPrices(env, parseInt(productId));
      }
      return new Response('Missing product_id parameter', { 
        status: 400,
        headers: corsHeaders(),
      });
    }

    // ----- Health check / Root -----
    if (url.pathname === '/' || url.pathname === '/health') {
      return new Response(JSON.stringify({
        status: 'ok',
        services: ['websocket-sync', 'products-api'],
        timestamp: new Date().toISOString()
      }), {
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders(),
        },
      });
    }

    return new Response('Not Found', { 
      status: 404,
      headers: corsHeaders(),
    });
  },
};

// =======================
// Database API Handlers
// =======================

// Get all products
async function getProducts(env: Env): Promise<Response> {
  try {
    const { results } = await env.groceries_db
      .prepare("SELECT * FROM products ORDER BY name")
      .all();
    
    return new Response(JSON.stringify(results || []), {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=300',
        ...corsHeaders(),
      },
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    return new Response(JSON.stringify({
      error: 'Failed to fetch products',
      details: error instanceof Error ? error.message : String(error)
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders(),
      },
    });
  }
}

// Get single product
async function getProduct(env: Env, id: number): Promise<Response> {
  try {
    const { results } = await env.groceries_db
      .prepare("SELECT * FROM products WHERE id = ?")
      .bind(id)
      .all();
    
    const product = results?.[0];
    
    return new Response(JSON.stringify(product || null), {
      status: product ? 200 : 404,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=600',
        ...corsHeaders(),
      },
    });
  } catch (error) {
    console.error('Error fetching product:', error);
    return new Response(JSON.stringify({
      error: 'Failed to fetch product',
      details: error instanceof Error ? error.message : String(error)
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders(),
      },
    });
  }
}

// Get prices for a product
async function getPrices(env: Env, productId: number): Promise<Response> {
  try {
    const { results } = await env.groceries_db
      .prepare("SELECT * FROM prices WHERE product_id = ? ORDER BY price ASC")
      .bind(productId)
      .all();
    
    return new Response(JSON.stringify(results || []), {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=300',
        ...corsHeaders(),
      },
    });
  } catch (error) {
    console.error('Error fetching prices:', error);
    return new Response(JSON.stringify({
      error: 'Failed to fetch prices',
      details: error instanceof Error ? error.message : String(error)
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders(),
      },
    });
  }
}
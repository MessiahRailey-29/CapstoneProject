// server/src/index.ts - Updated to handle both WebSocket sync AND API calls

export interface Env {
  groceries_db: D1Database;
  GroceriesDurableObjects: DurableObjectNamespace;
}

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
// Durable Object for WebSocket sync (keep your existing sync functionality)
// =======================
export class GroceriesDurableObject {
  state: DurableObjectState;
  env: Env;

  constructor(state: DurableObjectState, env: Env) {
    this.state = state;
    this.env = env;
  }

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);

    // Handle WebSocket upgrade for sync (existing functionality)
    const upgradeHeader = request.headers.get('Upgrade');
    if (upgradeHeader === 'websocket') {
      // Your existing WebSocket sync logic goes here
      // This keeps your TinyBase sync working
      return new Response('WebSocket endpoint', { status: 426 });
    }

    // Handle other Durable Object requests
    if (url.pathname.endsWith("/ping")) {
      return new Response("pong from Durable Object", {
        headers: corsHeaders(),
      });
    }

    return new Response("Not Found in Durable Object", { 
      status: 404,
      headers: corsHeaders(),
    });
  }
}

// =======================
// Worker Entrypoint - Now handles BOTH sync and API
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

    // ----- WebSocket Sync Routes (existing functionality) -----
    const upgradeHeader = request.headers.get('Upgrade');
    if (upgradeHeader === 'websocket') {
      // Route WebSocket connections to Durable Object for sync
      let id = env.GroceriesDurableObjects.idFromName("sync");
      let stub = env.GroceriesDurableObjects.get(id);
      return stub.fetch(request);
    }

    // ----- API Routes for Database Products -----
    if (url.pathname.startsWith('/api/products')) {
      let id = url.searchParams.get('id');
      if (id) {
        return await getProduct(env, parseInt(id));
      } else {
        return await getProducts(env);
      }
    }

    if (url.pathname.startsWith('/api/prices')) {
      let productId = url.searchParams.get('product_id');
      if (productId) {
        return await getPrices(env, parseInt(productId));
      }
      return new Response('Missing product_id parameter', { 
        status: 400,
        headers: corsHeaders(),
      });
    }

    // ----- Durable Object routes (if needed for other purposes) -----
    if (url.pathname.startsWith('/do/')) {
      let id = env.GroceriesDurableObjects.idFromName("shared");
      let stub = env.GroceriesDurableObjects.get(id);
      return stub.fetch(request);
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

// 📌 Get all products
async function getProducts(env: Env): Promise<Response> {
  try {
    const { results } = await env.groceries_db
      .prepare("SELECT * FROM products ORDER BY name")
      .all();
    
    return new Response(JSON.stringify(results || []), {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=300', // Cache for 5 minutes
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

// 📌 Get single product
async function getProduct(env: Env, id: number): Promise<Response> {
  try {
    const { results } = await env.groceries_db
      .prepare("SELECT * FROM products WHERE id = ?")
      .bind(id)
      .all();
    
    const product = results?.[0];
    
    return new Response(JSON.stringify(product || {}), {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=600', // Cache for 10 minutes
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

// 📌 Get prices for a product
async function getPrices(env: Env, productId: number): Promise<Response> {
  try {
    const { results } = await env.groceries_db
      .prepare("SELECT * FROM prices WHERE product_id = ? ORDER BY price ASC")
      .bind(productId)
      .all();
    
    return new Response(JSON.stringify(results || []), {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=300', // Cache for 5 minutes
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
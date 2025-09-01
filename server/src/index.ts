export interface Env {
  groceries_db: D1Database;
  GroceriesDurableObjects: DurableObjectNamespace;
}

// =======================
// Durable Object
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

    // Example endpoint inside Durable Object
    if (url.pathname.endsWith("/ping")) {
      return new Response("pong from Durable Object");
    }

    return new Response("Not Found in Durable Object", { status: 404 });
  }
}

// =======================
// Worker Entrypoint
// =======================
export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);

    // ----- Durable Object route -----
    if (url.pathname.startsWith("/do/")) {
      // Use "shared" or product-specific key
      let id = env.GroceriesDurableObjects.idFromName("shared");
      let stub = env.GroceriesDurableObjects.get(id);
      return stub.fetch(request);
    }

    // ----- API: Products -----
    if (url.pathname.startsWith("/api/products")) {
      let id = url.searchParams.get("id");
      if (id) {
        return await getProduct(env, parseInt(id));
      } else {
        return await getProducts(env);
      }
    }

    // ----- API: Prices -----
    if (url.pathname.startsWith("/api/prices")) {
      let productId = url.searchParams.get("product_id");
      if (productId) {
        return await getPrices(env, parseInt(productId));
      }
    }

    return new Response("Not Found", { status: 404 });
  },
};

// =======================
// Database Handlers
// =======================

// 📌 Get all products
async function getProducts(env: Env): Promise<Response> {
  const { results } = await env.groceries_db.prepare("SELECT * FROM products").all();
  return Response.json(results);
}

// 📌 Get single product
async function getProduct(env: Env, id: number): Promise<Response> {
  const { results } = await env.groceries_db
    .prepare("SELECT * FROM products WHERE id = ?")
    .bind(id)
    .all();
  return Response.json(results[0] || {});
}

// 📌 Get prices for a product
async function getPrices(env: Env, productId: number): Promise<Response> {
  const { results } = await env.groceries_db
    .prepare("SELECT * FROM prices WHERE product_id = ?")
    .bind(productId)
    .all();
  return Response.json(results);
}

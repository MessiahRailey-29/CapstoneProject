// server/src/index.ts

import { createMergeableStore } from "tinybase";
import { createDurableObjectStoragePersister } from "tinybase/persisters/persister-durable-object-storage";
import {
  getWsServerDurableObjectFetch,
  WsServerDurableObject,
} from "tinybase/synchronizers/synchronizer-ws-server-durable-object";

// =======================
// Environment bindings
// =======================
export interface Env {
  groceries_db: D1Database;
  GroceriesDurableObjects: DurableObjectNamespace;
}

// =======================
// CORS helper
// =======================
function corsHeaders(origin?: string) {
  return {
    "Access-Control-Allow-Origin": origin || "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Max-Age": "86400",
  };
}

// =======================
// Durable Object for TinyBase sync
// =======================
export class GroceriesDurableObject extends WsServerDurableObject {
  createPersister() {
    return createDurableObjectStoragePersister(
      createMergeableStore(),
      this.ctx.storage
    );
  }
}

// =======================
// Worker Entrypoint
// =======================
export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);

    // Handle CORS preflight
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders() });
    }

    // ----- WebSocket Sync -----
    const upgradeHeader = request.headers.get("Upgrade");
    if (upgradeHeader === "websocket") {
      let id = env.GroceriesDurableObjects.idFromName("sync");
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
      return new Response("Missing product_id parameter", {
        status: 400,
        headers: corsHeaders(),
      });
    }

    // ----- Health Check -----
    if (url.pathname === "/" || url.pathname === "/health") {
      return new Response(
        JSON.stringify({
          status: "ok",
          services: ["websocket-sync", "products-api"],
          timestamp: new Date().toISOString(),
        }),
        {
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders(),
          },
        }
      );
    }

    return new Response("Not Found", { status: 404, headers: corsHeaders() });
  },
};

// =======================
// Database API Handlers
// =======================
async function getProducts(env: Env): Promise<Response> {
  try {
    const { results } = await env.groceries_db
      .prepare("SELECT * FROM products ORDER BY name")
      .all();

    return new Response(JSON.stringify(results || []), {
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "public, max-age=300",
        ...corsHeaders(),
      },
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    return new Response(
      JSON.stringify({
        error: "Failed to fetch products",
        details: error instanceof Error ? error.message : String(error),
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders(),
        },
      }
    );
  }
}

async function getProduct(env: Env, id: number): Promise<Response> {
  try {
    const { results } = await env.groceries_db
      .prepare("SELECT * FROM products WHERE id = ?")
      .bind(id)
      .all();

    const product = results?.[0];

    return new Response(JSON.stringify(product || {}), {
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "public, max-age=600",
        ...corsHeaders(),
      },
    });
  } catch (error) {
    console.error("Error fetching product:", error);
    return new Response(
      JSON.stringify({
        error: "Failed to fetch product",
        details: error instanceof Error ? error.message : String(error),
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders(),
        },
      }
    );
  }
}

async function getPrices(env: Env, productId: number): Promise<Response> {
  try {
    const { results } = await env.groceries_db
      .prepare("SELECT * FROM prices WHERE product_id = ? ORDER BY price ASC")
      .bind(productId)
      .all();

    return new Response(JSON.stringify(results || []), {
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "public, max-age=300",
        ...corsHeaders(),
      },
    });
  } catch (error) {
    console.error("Error fetching prices:", error);
    return new Response(
      JSON.stringify({
        error: "Failed to fetch prices",
        details: error instanceof Error ? error.message : String(error),
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders(),
        },
      }
    );
  }
}

// server/src/GroceriesDurableObject.ts - Updated to properly handle TinyBase sync

import { createMergeableStore } from "tinybase"; 
import { createDurableObjectStoragePersister } from "tinybase/persisters/persister-durable-object-storage"; 
import { getWsServerDurableObjectFetch, WsServerDurableObject } from "tinybase/synchronizers/synchronizer-ws-server-durable-object"; 

// TinyBase Durable Object for syncing shopping lists (keep your existing sync working)
export class GroceriesDurableObject extends WsServerDurableObject { 
  createPersister() { 
    // This handles the shopping lists and products sync (your existing functionality)
    const store = createMergeableStore(); // Use default schema, let TinyBase handle it dynamically
    return createDurableObjectStoragePersister(store, this.ctx.storage); 
  } 
} 

// Export fetch handler for TinyBase sync
export default { 
  fetch: getWsServerDurableObjectFetch("GroceriesDurableObjects"), 
};

// Alternative approach - if you need a separate Durable Object for the products database:
export class ProductsDurableObject {
  state: DurableObjectState;
  env: any;

  constructor(state: DurableObjectState, env: any) {
    this.state = state;
    this.env = env;
  }

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);

    // Handle central products database operations if needed
    if (url.pathname.endsWith("/products")) {
      // This could handle centralized product management
      return new Response("Products endpoint");
    }

    return new Response("Not Found", { status: 404 });
  }
}
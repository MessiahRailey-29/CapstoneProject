import { createMergeableStore } from "tinybase"; 
import { createDurableObjectStoragePersister } from "tinybase/persisters/persister-durable-object-storage"; 
import { getWsServerDurableObjectFetch, WsServerDurableObject } from "tinybase/synchronizers/synchronizer-ws-server-durable-object"; 

// TinyBase Durable Object for syncing shopping lists
export class GroceriesDurableObject extends WsServerDurableObject { 
  createPersister() { 
    const store = createMergeableStore();
    return createDurableObjectStoragePersister(store, this.ctx.storage); 
  } 
} 

// Export fetch handler for TinyBase sync
export const durableObjectFetch = getWsServerDurableObjectFetch("GroceriesDurableObjects");
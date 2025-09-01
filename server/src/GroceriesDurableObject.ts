import { createMergeableStore } from "tinybase"; 
import { createDurableObjectStoragePersister } from "tinybase/persisters/persister-durable-object-storage"; 
import { getWsServerDurableObjectFetch, WsServerDurableObject } from "tinybase/synchronizers/synchronizer-ws-server-durable-object"; 
// Central Durable Object for syncing all shopping lists and products 
export class GroceriesDurableObject extends WsServerDurableObject { 
  createPersister() 
  { // Store schema for central products database
   const store = createMergeableStore() 
   .setTablesSchema({ 
    products: { id: { type: "string" }, 
    name: { type: "string" }, 
    store: { type: "string" }, 
    price: { type: "number" }, 
    units: { type: "string" }, 
    category: { type: "string" }, 
    lastUpdated: { type: "string" }, 
  },
 }) 
 .setValuesSchema({}); 
 return createDurableObjectStoragePersister(store, this.ctx.storage); 
} 
} // Export fetch handler 
export default { 
  fetch: getWsServerDurableObjectFetch("GroceriesDurableObjects"), 
};
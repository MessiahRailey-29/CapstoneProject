// stores/getStoreForList.ts
import { createContext, useContext } from 'react';
import type { Store, OptionalSchemas } from 'tinybase/with-schemas';

/**
 * Global store registry for client-side access
 * Stores are registered when shopping list screens mount
 */
const storeRegistry = new Map<string, Store<any>>();

/**
 * Register a store for a specific list ID
 * Call this when a shopping list screen mounts
 */
export function registerStoreForList<Schemas extends OptionalSchemas>(
  listId: string, 
  store: Store<Schemas>
) {
  storeRegistry.set(listId, store as Store<any>);
  console.log(`📝 Registered store for list: ${listId}`);
}

/**
 * Unregister a store when component unmounts
 */
export function unregisterStoreForList(listId: string) {
  storeRegistry.delete(listId);
  console.log(`🗑️ Unregistered store for list: ${listId}`);
}

/**
 * Get the store for a specific list ID
 * Returns null if store is not currently registered
 */
export function getStoreForList(listId: string): Store<any> | null {
  const store = storeRegistry.get(listId);
  if (!store) {
    console.warn(`⚠️ No store registered for list: ${listId}`);
    console.log(`Available stores: ${Array.from(storeRegistry.keys()).join(', ')}`);
  }
  return store || null;
}

/**
 * Get all registered store IDs
 */
export function getRegisteredStoreIds(): string[] {
  return Array.from(storeRegistry.keys());
}

/**
 * Context for current store (alternative approach)
 * Can be used in components that are within a list context
 */
export const StoreContext = createContext<Store<any> | null>(null);

export function useStoreContext() {
  return useContext(StoreContext);
}
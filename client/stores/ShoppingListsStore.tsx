import React, { useCallback } from "react";
import { randomUUID } from "expo-crypto";
import * as UiReact from "tinybase/ui-react/with-schemas";
import { createMergeableStore, NoValuesSchema } from "tinybase/with-schemas";
import { useCreateClientPersisterAndStart } from "@/stores/persistence/useCreateClientPersisterAndStart";
import { useUser } from "@clerk/clerk-expo";
import ShoppingListStore from "./ShoppingListStore";
import { useCreateServerSynchronizerAndStart } from "./synchronization/useCreateServerSynchronizerAndStart";

const STORE_ID_PREFIX = "shoppingListsStore-";

const TABLES_SCHEMA = {
  lists: {
    id: { type: "string" },
    valuesCopy: { type: "string" },
  },
} as const;

const {
  useCell,
  useCreateMergeableStore,
  useDelRowCallback,
  useProvideStore,
  useRowIds,
  useSetCellCallback,
  useSortedRowIds,
  useStore,
  useTable,
} = UiReact as UiReact.WithSchemas<[typeof TABLES_SCHEMA, NoValuesSchema]>;

const useStoreId = () => STORE_ID_PREFIX + useUser().user.id;

// Returns a callback that adds a new shopping list to the store.
export const useAddShoppingListCallback = () => {
  const store = useStore(useStoreId());
  const { user } = useUser();
  
  return useCallback(
    (name: string, description: string, emoji: string, color: string, shoppingDate?: Date | null, budget?: number) => {
      const id = randomUUID();
      
      // ✅ Add creator as first collaborator
      const creatorCollaborator = {
        [user.id]: {
          userId: user.id,
          nickname: user.firstName || user.username || 'You',
          joinedAt: new Date().toISOString(),
        }
      };
      
      // Create the complete initial data structure that matches what ShoppingListStore expects
      const completeData = {
        tables: {
          products: {},
          collaborators: creatorCollaborator, // ✅ Initialize with creator
        },
        values: {
          listId: id,
          name,
          description,
          emoji,
          color,
          budget: budget || 0,
          shoppingDate: shoppingDate?.toISOString() || null,
          status: 'regular',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      };

      console.log('💾 Creating list with complete data structure:', completeData);
      console.log('💰 Budget in values:', completeData.values.budget);
      console.log('👥 Collaborators:', Object.keys(completeData.tables.collaborators).length);

      store.setRow("lists", id, {
        id,
        valuesCopy: JSON.stringify(completeData),
      });
      
      return id;
    },
    [store, user]
  );
};

// ✅ COMPLETELY FIXED: No placeholder data that creates CRDT conflicts!
export const useJoinShoppingListCallback = () => {
  const store = useStore(useStoreId());
  
  return useCallback(
    (listId: string) => {
      console.log('🔗 Joining list:', listId);
      
      // ✅ CRITICAL FIX: Create EMPTY placeholder with NO values
      // This registers the list for sync but doesn't create ANY CRDT timestamps
      // that could overwrite the creator's data
      const emptyPlaceholder = {
        tables: { 
          products: {},
          collaborators: {},
        },
        values: {
          listId: listId,
          // ❌ DON'T set name, emoji, color, budget, etc.
          // Setting ANY value creates a CRDT timestamp that can win!
        }
      };
      
      console.log('💾 Registering list with EMPTY placeholder (prevents CRDT conflicts)');
      
      store.setRow("lists", listId, {
        id: listId,
        valuesCopy: JSON.stringify(emptyPlaceholder),
      });
      
      console.log('✅ Registered list for joining:', listId);
      console.log('⏳ WebSocket sync will populate: name, emoji, color, budget, products, collaborators');
      console.log('💡 No CRDT timestamps created - sync data will be the ONLY source of truth');
    },
    [store]
  );
};

export const useValuesCopy = (
  id: string
): [string, (valuesCopy: string) => void] => [
  useCell("lists", id, "valuesCopy", useStoreId()),
  useSetCellCallback(
    "lists",
    id,
    "valuesCopy",
    (valuesCopy: string) => valuesCopy,
    [],
    useStoreId()
  ),
];

// FIXED: Update shopping list status WITHOUT destroying products
export const useUpdateShoppingListStatus = () => {
  const storeId = useStoreId();
  const store = useStore(storeId);
  
  return useCallback(
    (listId: string, newStatus: 'regular' | 'ongoing' | 'completed') => {
      try {
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('🔄 UPDATING STATUS in ShoppingListsStore');
        console.log('📋 List ID:', listId);
        console.log('📊 New Status:', newStatus);
        console.log('⏰ Waiting for sync before updating...');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        
        // CRITICAL FIX: Wait a bit longer for the ShoppingListStore sync to complete
        setTimeout(() => {
          const currentValuesCopy = store.getCell("lists", listId, "valuesCopy") as string;
          
          if (!currentValuesCopy || currentValuesCopy === '{}') {
            console.warn('⚠️ No valuesCopy found for list:', listId);
            return;
          }
          
          const data = JSON.parse(currentValuesCopy);
          
          console.log('📦 Current data structure:', {
            hasValues: !!data.values,
            hasTables: !!data.tables,
            hasProducts: !!data.tables?.products,
            hasCollaborators: !!data.tables?.collaborators,
            productsCount: Object.keys(data.tables?.products || {}).length,
            collaboratorsCount: Object.keys(data.tables?.collaborators || {}).length,
          });
          
          // CRITICAL: Ensure we preserve the tables structure
          if (!data.tables) {
            console.warn('⚠️ No tables in data, initializing empty tables');
            data.tables = { products: {}, collaborators: {} };
          }
          
          if (!data.tables.products) {
            console.warn('⚠️ No products table, initializing empty');
            data.tables.products = {};
          }
          
          if (!data.tables.collaborators) {
            console.warn('⚠️ No collaborators table, initializing empty');
            data.tables.collaborators = {};
          }
          
          // Log products and collaborators BEFORE update
          const productIds = Object.keys(data.tables.products);
          const collaboratorIds = Object.keys(data.tables.collaborators);
          console.log('🔍 BEFORE status update:');
          console.log('  Products:', productIds.length, 'items');
          console.log('  Collaborators:', collaboratorIds.length, 'users');
          
          // Update the status in the values
          if (!data.values) {
            console.warn('⚠️ No values object, creating one');
            data.values = {};
          }
          
          data.values.status = newStatus;
          data.values.updatedAt = new Date().toISOString();
          
          // If completing, also set completedAt timestamp
          if (newStatus === 'completed' && !data.values.completedAt) {
            data.values.completedAt = new Date().toISOString();
          }
          
          // Clear completedAt if restoring to regular
          if (newStatus === 'regular') {
            data.values.completedAt = null;
          }
          
          // Log AFTER update (should be same!)
          const finalProductCount = Object.keys(data.tables.products).length;
          const finalCollaboratorCount = Object.keys(data.tables.collaborators).length;
          console.log('🔍 AFTER status update:');
          console.log('  Products:', finalProductCount, 'items');
          console.log('  Collaborators:', finalCollaboratorCount, 'users');
          
          // IMPORTANT: Verify data is still there before saving
          if (finalProductCount === 0 && productIds.length > 0) {
            console.error('🚨 CRITICAL: Products disappeared during status update!');
            return;
          }
          
          if (finalCollaboratorCount === 0 && collaboratorIds.length > 0) {
            console.error('🚨 CRITICAL: Collaborators disappeared during status update!');
            return;
          }
          
          const updatedValuesCopy = JSON.stringify(data);
          console.log('💾 Saving updated valuesCopy');
          
          // Save back to store - this should trigger sync
          store.setCell("lists", listId, "valuesCopy", updatedValuesCopy);
          
          console.log(`✅ Updated list ${listId} status to: ${newStatus}`);
          console.log(`✅ Products preserved: ${finalProductCount} items`);
          console.log(`✅ Collaborators preserved: ${finalCollaboratorCount} users`);
          console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        }, 600); // Wait 600ms for the sync to complete
      } catch (error) {
        console.error('❌ Error updating list status:', error);
        console.error('❌ Stack trace:', error?.stack);
      }
    },
    [store]
  );
};

// Returns a callback that deletes a shopping list from the store.
export const useDelShoppingListCallback = (id: string) =>
  useDelRowCallback("lists", id, useStoreId());

// Returns a callback that deletes multiple shopping lists from the store (batch delete)
export const useDelAllShoppingListsCallback = () => {
  const store = useStore(useStoreId());
  
  return useCallback(
    (listIds: string[]) => {
      if (listIds.length === 0) {
        console.warn('⚠️ No lists to delete');
        return;
      }

      console.log(`🗑️ Deleting ${listIds.length} shopping lists...`);
      
      // Delete each list from the store
      listIds.forEach(listId => {
        store.delRow("lists", listId);
      });
      
      console.log(`✅ Successfully deleted ${listIds.length} shopping lists`);
    },
    [store]
  );
};

// Returns the IDs of all shopping lists in the store.
export const useShoppingListIds = () => useRowIds("lists", useStoreId());

// Returns the (copy of) values of up to 10 shopping lists in the store.
export const useShoppingListsValues = () =>
  Object.values(useTable("lists", useStoreId()))
    .slice(0, 10)
    .map(({ valuesCopy }) => {
      try {
        return JSON.parse(valuesCopy);
      } catch {
        return {};
      }
    });

// ✅ FIXED: Get shopping list data with proper collaborators support
export const useShoppingListData = (listId: string) => {
  const storeId = useStoreId();
  const store = useStore(storeId);
  
  // Get the cell value which will reactively update
  const valuesCopy = useCell("lists", listId, "valuesCopy", storeId) as string;
  
  try {
    if (!valuesCopy || valuesCopy === '{}') {
      return {
        name: '',
        description: '',
        emoji: '🛒',
        color: '#007AFF',
        shoppingDate: null,
        budget: 0,
        status: 'regular' as const,
        completedAt: null,
        createdAt: '',
        updatedAt: '',
        collaborators: [], // ✅ Return empty array instead of undefined
      };
    }
    
    const data = JSON.parse(valuesCopy);
    
    // Handle both old format (direct properties) and new format (nested in values)
    let values;
    if (data.values) {
      values = data.values;
    } else {
      values = data;
    }
    
    // ✅ Extract collaborators from tables
    let collaborators: Array<{userId: string; nickname: string}> = [];
    if (data.tables?.collaborators) {
      collaborators = Object.values(data.tables.collaborators);
    }
    
    console.log('📊 useShoppingListData:', {
      listId,
      name: values.name,
      budget: values.budget,
      collaboratorsCount: collaborators.length,
      hasSync: valuesCopy !== '{}',
    });
    
    return {
      name: values.name || '',
      description: values.description || '',
      emoji: values.emoji || '🛒',
      color: values.color || '#007AFF',
      shoppingDate: values.shoppingDate || null,
      budget: values.budget || 0,
      status: (values.status || 'regular') as 'regular' | 'ongoing' | 'completed',
      completedAt: values.completedAt || null,
      createdAt: values.createdAt || '',
      updatedAt: values.updatedAt || '',
      collaborators: collaborators, // ✅ Include collaborators
    };
  } catch (error) {
    console.log('❌ Error parsing list data:', error);
    return {
      name: '',
      description: '',
      emoji: '🛒',
      color: '#007AFF',
      shoppingDate: null,
      budget: 0,
      status: 'regular' as const,
      completedAt: null,
      createdAt: '',
      updatedAt: '',
      collaborators: [], // ✅ Return empty array on error
    };
  }
};

// Create, persist, and sync a store containing the IDs of the shopping lists.
export default function ShoppingListsStore() {
  const storeId = useStoreId();
  const store = useCreateMergeableStore(() =>
    createMergeableStore().setTablesSchema(TABLES_SCHEMA)
  );
  useCreateClientPersisterAndStart(storeId, store);
  useCreateServerSynchronizerAndStart(storeId, store);
  useProvideStore(storeId, store);

  // In turn 'render' (i.e. create) all of the shopping lists themselves.
  return Object.entries(useTable("lists", storeId)).map(([listId]) => (
    <ShoppingListStore
      listId={listId}
      key={listId}
      useValuesCopy={useValuesCopy}
    />
  ));
}
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
  return useCallback(
    (name: string, description: string, emoji: string, color: string, shoppingDate?: Date | null, budget?: number) => {
      const id = randomUUID();
      
      // Create the complete initial data structure that matches what ShoppingListStore expects
      const completeData = {
        tables: {
          products: {},
          collaborators: {},
        },
        values: {
          listId: id,
          name,
          description,
          emoji,
          color,
          budget: budget || 0,
          shoppingDate: shoppingDate?.toISOString() || null,
          status: 'regular', // New field: 'regular', 'ongoing', 'completed'
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      };

      console.log('💾 Creating list with complete data structure:', completeData);
      console.log('💰 Budget in values:', completeData.values.budget);

      store.setRow("lists", id, {
        id,
        valuesCopy: JSON.stringify(completeData),
      });
      
      return id;
    },
    [store]
  );
};

// Returns a callback that adds an existing shopping list to the store.
export const useJoinShoppingListCallback = () => {
  const store = useStore(useStoreId());
  return useCallback(
    (listId: string) => {
      store.setRow("lists", listId, {
        id: listId,
        valuesCopy: "{}",
      });
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

// NEW: Update shopping list status
export const useUpdateShoppingListStatus = () => {
  const storeId = useStoreId();
  const store = useStore(storeId);
  
  return useCallback(
    (listId: string, newStatus: 'regular' | 'ongoing' | 'completed') => {
      try {
        // Get current valuesCopy
        const currentValuesCopy = store.getCell("lists", listId, "valuesCopy") as string;
        
        console.log('📝 Current valuesCopy before update:', currentValuesCopy);
        
        if (!currentValuesCopy || currentValuesCopy === '{}') {
          console.warn('⚠️ No valuesCopy found for list:', listId);
          return;
        }
        
        const data = JSON.parse(currentValuesCopy);
        
        // Update the status in the values
        if (data.values) {
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
        } else {
          // Handle old format - create values object if it doesn't exist
          if (!data.values) {
            data.values = {};
          }
          data.values.status = newStatus;
          data.values.updatedAt = new Date().toISOString();
          
          if (newStatus === 'completed' && !data.values.completedAt) {
            data.values.completedAt = new Date().toISOString();
          }
          
          if (newStatus === 'regular') {
            data.values.completedAt = null;
          }
        }
        
        const updatedValuesCopy = JSON.stringify(data);
        console.log('💾 Saving updated valuesCopy:', updatedValuesCopy);
        
        // Save back to store - this should trigger sync
        store.setCell("lists", listId, "valuesCopy", updatedValuesCopy);
        
        console.log(`✅ Updated list ${listId} status to: ${newStatus}`);
        console.log('✅ Data saved to store, sync should happen automatically');
      } catch (error) {
        console.error('❌ Error updating list status:', error);
      }
    },
    [store]
  );
};

// Returns a callback that deletes a shopping list from the store.
export const useDelShoppingListCallback = (id: string) =>
  useDelRowCallback("lists", id, useStoreId());

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

export const useShoppingListData = (listId: string) => {
  const storeId = useStoreId();
  const store = useStore(storeId);
  
  // Get the cell value which will reactively update
  const valuesCopy = useCell("lists", listId, "valuesCopy", storeId) as string;
  
  try {
    console.log('📖 Reading valuesCopy for', listId, ':', valuesCopy);
    
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
      };
    }
    
    const data = JSON.parse(valuesCopy);
    console.log('📊 Parsed list data:', data);
    
    // Handle both old format (direct properties) and new format (nested in values)
    let values;
    if (data.values) {
      // New format with nested structure
      values = data.values;
      console.log('📋 Using nested values structure:', values);
    } else {
      // Old format or direct properties
      values = data;
      console.log('📋 Using direct properties structure:', values);
    }
    
    const result = {
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
    };
    
    console.log('🎯 Final list data result:', result);
    console.log('💰 Budget from useShoppingListData:', result.budget, typeof result.budget);
    console.log('📍 Status from useShoppingListData:', result.status);
    
    return result;
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
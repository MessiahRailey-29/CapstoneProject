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
// In your useAddShoppingListCallback
export const useAddShoppingListCallback = () => {
  const store = useStore(useStoreId());
  return useCallback(
    (name: string, description: string, emoji: string, color: string, shoppingDate?: Date | null, budget?: number) => {
      const id = randomUUID();
      
      const listData = {
        id,
        name,
        description,
        emoji,
        color,
        shoppingDate: shoppingDate?.toISOString() || null,
        budget: typeof budget === "number" && !isNaN(budget) ? budget : 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      console.log('💾 Saving list data:', listData);

      store.setRow("lists", id, {
        id,
        valuesCopy: JSON.stringify(listData),
      });
      
      return id;
    },
    [store]
  );
};

//new
export const useShoppingListData = (listId: string) => {
  const [valuesCopy] = useValuesCopy(listId);

  console.log('📖 Reading valuesCopy for', listId, ':', valuesCopy);

  try {
    const data = JSON.parse(valuesCopy || '{}');
    console.log('📊 Parsed list data:', data);

    return {
      name: data.name || '',
      description: data.description || '',
      emoji: data.emoji || '🛒',
      color: data.color || '#007AFF',
      shoppingDate: data.shoppingDate || null,
      budget: typeof data.budget === 'number' ? data.budget : 0,
      createdAt: data.createdAt || '',
      updatedAt: data.updatedAt || '',
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
      createdAt: '',
      updatedAt: '',
    };
  }
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
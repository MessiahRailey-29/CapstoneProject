// stores/InventoryStore.tsx
import React, { useCallback } from "react";
import { randomUUID } from "expo-crypto";
import * as UiReact from "tinybase/ui-react/with-schemas";
import { createMergeableStore, NoValuesSchema } from "tinybase/with-schemas";
import { useCreateClientPersisterAndStart } from "@/stores/persistence/useCreateClientPersisterAndStart";
import { useUser } from "@clerk/clerk-expo";
import { useCreateServerSynchronizerAndStart } from "./synchronization/useCreateServerSynchronizerAndStart";
import { getStorageForCategory, StorageLocation } from "@/utils/storageMapping";

const STORE_ID_PREFIX = "inventoryStore-";

const TABLES_SCHEMA = {
  items: {
    id: { type: "string" },
    name: { type: "string" },
    quantity: { type: "number" },
    units: { type: "string" },
    category: { type: "string", default: "" },
    selectedStore: { type: "string", default: "" },
    selectedPrice: { type: "number", default: 0 },
    databaseProductId: { type: "number", default: 0 },
    purchasedFrom: { type: "string" },
    purchasedAt: { type: "string" },
    addedBy: { type: "string" },
    notes: { type: "string", default: "" },
    storageLocation: { type: "string", default: "Pantry" },
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

const useStoreId = () => STORE_ID_PREFIX + useUser().user?.id;

// Add items to inventory
export const useAddInventoryItemsCallback = () => {
  const store = useStore(useStoreId());
  
  return useCallback(
    (items: Array<{
      name: string;
      quantity: number;
      units: string;
      category?: string;
      selectedStore?: string;
      selectedPrice?: number;
      databaseProductId?: number;
      notes?: string;
      storageLocation?: StorageLocation;
    }>, listId: string, userId: string) => {
      const now = new Date().toISOString();
      const addedIds: string[] = [];
      
      items.forEach(item => {
        const id = randomUUID();
        const category = item.category || "";
        
        // Use the comprehensive storage mapping
        const suggestedStorage = item.storageLocation || getStorageForCategory(category);
        
        store.setRow("items", id, {
          id,
          name: item.name,
          quantity: item.quantity,
          units: item.units,
          category,
          selectedStore: item.selectedStore || "",
          selectedPrice: item.selectedPrice || 0,
          databaseProductId: item.databaseProductId || 0,
          purchasedFrom: listId,
          purchasedAt: now,
          addedBy: userId,
          notes: item.notes || "",
          storageLocation: suggestedStorage,
        });
        
        addedIds.push(id);
        console.log(`✅ Added "${item.name}" to ${suggestedStorage}`);
      });
      
      console.log(`✅ Added ${addedIds.length} items to inventory`);
      return addedIds;
    },
    [store]
  );
};

// Delete item from inventory
export const useDelInventoryItemCallback = (id: string) =>
  useDelRowCallback("items", id, useStoreId());

// Get all inventory item IDs
export const useInventoryItemIds = (
  cellId: keyof (typeof TABLES_SCHEMA)["items"] = "purchasedAt",
  descending: boolean = true
) => useSortedRowIds("items", cellId, descending, undefined, undefined, useStoreId());

// Get inventory item IDs by storage location
export const useInventoryItemIdsByStorage = (storage: StorageLocation) => {
  const allItems = useTable("items", useStoreId());
  return Object.keys(allItems).filter(
    (itemId) => allItems[itemId].storageLocation === storage
  );
};

// Get inventory item cell
export const useInventoryItemCell = <CellId extends keyof (typeof TABLES_SCHEMA)["items"]>(
  itemId: string,
  cellId: CellId
) => [
  useCell("items", itemId, cellId, useStoreId()),
  useSetCellCallback(
    "items",
    itemId,
    cellId,
    (cell: any) => cell,
    [],
    useStoreId()
  ),
] as const;

// Get all inventory items
export const useInventoryItems = () => 
  Object.values(useTable("items", useStoreId()));

// Get inventory items by storage location
export const useInventoryItemsByStorage = (storage: StorageLocation) => {
  const allItems = useTable("items", useStoreId());
  return Object.entries(allItems)
    .filter(([_, item]) => item.storageLocation === storage)
    .map(([id, item]) => ({ id, ...item }));
};

// Get counts by storage location
export const useInventoryStorageCounts = () => {
  const allItems = useTable("items", useStoreId());
  const items = Object.values(allItems);
  
  return {
    Refrigerator: items.filter(item => item.storageLocation === 'Refrigerator').length,
    Freezer: items.filter(item => item.storageLocation === 'Freezer').length,
    Pantry: items.filter(item => item.storageLocation === 'Pantry').length,
    Other: items.filter(item => item.storageLocation === 'Other').length,
  };
};

// Get inventory items by list
export const useInventoryItemsByList = (listId: string) => {
  const allItems = useTable("items", useStoreId());
  return Object.entries(allItems)
    .filter(([_, item]) => item.purchasedFrom === listId)
    .map(([id, item]) => ({ id, ...item }));
};

// Export type for use in other files
export type { StorageLocation };

// Create and provide the inventory store
export default function InventoryStore() {
  const storeId = useStoreId();
  const store = useCreateMergeableStore(() =>
    createMergeableStore().setTablesSchema(TABLES_SCHEMA)
  );
  
  useCreateClientPersisterAndStart(storeId, store);
  useCreateServerSynchronizerAndStart(storeId, store);
  useProvideStore(storeId, store);

  return null;
}
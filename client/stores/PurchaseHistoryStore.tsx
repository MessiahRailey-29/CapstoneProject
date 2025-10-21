// stores/PurchaseHistoryStore.tsx
import React, { useCallback } from "react";
import { randomUUID } from "expo-crypto";
import * as UiReact from "tinybase/ui-react/with-schemas";
import { createMergeableStore, NoValuesSchema } from "tinybase/with-schemas";
import { useCreateClientPersisterAndStart } from "@/stores/persistence/useCreateClientPersisterAndStart";
import { useUser } from "@clerk/clerk-expo";
import { useCreateServerSynchronizerAndStart } from "./synchronization/useCreateServerSynchronizerAndStart";

const STORE_ID_PREFIX = "purchaseHistoryStore-";

const TABLES_SCHEMA = {
  purchases: {
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
    purchasedBy: { type: "string" },
    notes: { type: "string", default: "" },
  },
} as const;

const {
  useProvideStore,
  useCreateMergeableStore,
  useStore,
  useTable,
  useSortedRowIds,
} = UiReact as UiReact.WithSchemas<[typeof TABLES_SCHEMA, NoValuesSchema]>;

const useStoreId = () => STORE_ID_PREFIX + useUser().user?.id;

// Add purchase to permanent history
export const useAddPurchaseHistoryCallback = () => {
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
    }>, listId: string, userId: string) => {
      const now = new Date().toISOString();
      const addedIds: string[] = [];
      
      items.forEach(item => {
        const id = randomUUID();
        
        store.setRow("purchases", id, {
          id,
          name: item.name,
          quantity: item.quantity,
          units: item.units,
          category: item.category || "",
          selectedStore: item.selectedStore || "",
          selectedPrice: item.selectedPrice || 0,
          databaseProductId: item.databaseProductId || 0,
          purchasedFrom: listId,
          purchasedAt: now,
          purchasedBy: userId,
          notes: item.notes || "",
        });
        
        addedIds.push(id);
      });
      
      console.log(`✅ Added ${addedIds.length} purchases to permanent history`);
      return addedIds;
    },
    [store]
  );
};

// Get all purchase history items
export const usePurchaseHistoryItems = () => 
  Object.values(useTable("purchases", useStoreId()));

// Get sorted purchase IDs
export const usePurchaseHistoryIds = (
  cellId: keyof (typeof TABLES_SCHEMA)["purchases"] = "purchasedAt",
  descending: boolean = true
) => useSortedRowIds("purchases", cellId, descending, undefined, undefined, useStoreId());

// Create and provide the purchase history store
export default function PurchaseHistoryStore() {
  const storeId = useStoreId();
  const store = useCreateMergeableStore(() =>
    createMergeableStore().setTablesSchema(TABLES_SCHEMA)
  );
  
  useCreateClientPersisterAndStart(storeId, store);
  useCreateServerSynchronizerAndStart(storeId, store);
  useProvideStore(storeId, store);

  return null;
}
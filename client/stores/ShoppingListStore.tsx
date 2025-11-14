import { useCallback, useEffect, useRef } from "react";
import { randomUUID } from "expo-crypto";
import { debounce } from 'lodash'
import { useRemoteRowId } from "tinybase/ui-react";
import * as UiReact from "tinybase/ui-react/with-schemas";
import { Cell, createMergeableStore, createRelationships, Value } from "tinybase/with-schemas";
import { useUserIdAndNickname } from "@/hooks/useNickname";
import { useCreateClientPersisterAndStart } from "@/stores/persistence/useCreateClientPersisterAndStart";
import { useCreateServerSynchronizerAndStart } from "./synchronization/useCreateServerSynchronizerAndStart";

const STORE_ID_PREFIX = "shoppingListStore-";

const VALUES_SCHEMA = {
  listId: { type: "string" },
  name: { type: "string" },
  description: { type: "string" },
  emoji: { type: "string" },
  color: { type: "string" },
  shoppingDate: { type: "string" },
  budget: { type: "number" },
  status: { type: "string", default: "regular" },
  completedAt: { type: "string", default: "" },
  createdAt: { type: "string" },
  updatedAt: { type: "string" },
  // ⭐ NEW: Track recipe suggestion state
  recipeSuggestionsPrompted: { type: "boolean", default: false },
  recipeSuggestionsEnabled: { type: "boolean", default: false },
} as const;

const TABLES_SCHEMA = {
  products: {
    id: { type: "string" },
    name: { type: "string" },
    quantity: { type: "number" },
    units: { type: "string" },
    isPurchased: { type: "boolean", default: false },
    category: { type: "string", default: "" },
    notes: { type: "string" },
    selectedStore: { type: "string", default: "" },
    selectedPrice: { type: "number", default: 0 },
    databaseProductId: { type: "number", default: 0 },
    createdBy: { type: "string" },
    createdAt: { type: "string" },
    updatedAt: { type: "string" },
  },
  collaborators: {
    nickname: { type: "string" },
  },
} as const;

type Schemas = [typeof TABLES_SCHEMA, typeof VALUES_SCHEMA];
type ShoppingListValueId = keyof typeof VALUES_SCHEMA;
type ShoppingListProductCellId = keyof (typeof TABLES_SCHEMA)["products"];

const {
  useCell,
  useCreateMergeableStore,
  useDelRowCallback,
  useProvideRelationships,
  useProvideStore,
  useRowCount,
  useSetCellCallback,
  useSetValueCallback,
  useSortedRowIds,
  useStore,
  useCreateRelationships,
  useTable,
  useValue,
  useValuesListener,
} = UiReact as UiReact.WithSchemas<Schemas>;

const useStoreId = (listId: string) => `shoppingListStore-${listId}`;

export const useShoppingListStore = (listId: string) => {
  return useStore(useStoreId(listId));
};

// 🔔 UPDATED: Now supports duplicate warning notifications
export const useAddShoppingListProductCallback = (listId: string) => {
  const store = useStore(useStoreId(listId));
  const [userId] = useUserIdAndNickname();
  
  return useCallback(
    async (
      name: string, 
      quantity: number, 
      units: string, 
      notes: string,
      selectedStore?: string,
      selectedPrice?: number,
      databaseProductId?: number,
      category?: string,
      createDuplicateWarning?: (productName: string, listId: string) => Promise<boolean>
    ) => {
      const id = randomUUID();
      const now = new Date().toISOString();
      
      const normalizedName = name.trim().toLowerCase();
      
      if (!normalizedName) {
        console.warn('❌ Product name cannot be empty');
        return null;
      }
      
      try {
        const existingProducts = store.getTable("products");
        
        const isDuplicate = Object.values(existingProducts).some((product) => {
          if (!product || typeof product !== 'object' || !('name' in product) || !('isPurchased' in product)) {
            return false;
          }
          
          const existingName = String(product.name).trim().toLowerCase();
          const isPurchased = Boolean(product.isPurchased);
          
          return existingName === normalizedName && !isPurchased;
        });
        
        if (isDuplicate) {
          console.warn('❌ DUPLICATE FOUND:', normalizedName);
          
          // 🔔 CREATE DUPLICATE WARNING NOTIFICATION
          if (createDuplicateWarning) {
            try {
              await createDuplicateWarning(name.trim(), listId);
              console.log('🔔 Duplicate warning notification created');
            } catch (error) {
              console.error('❌ Failed to create duplicate warning:', error);
            }
          }
          
          return null;
        }
        
        store.setRow("products", id, {
          id,
          name: name.trim(),
          quantity,
          units,
          notes,
          selectedStore: selectedStore || "",
          selectedPrice: selectedPrice || 0,
          databaseProductId: databaseProductId || 0,
          category: category || "",
          isPurchased: false,
          createdBy: userId,
          createdAt: now,
          updatedAt: now,
        });
        
        console.log('✅ PRODUCT ADDED:', {
          id,
          name: name.trim(),
        });
        
        return id;
        
      } catch (error) {
        console.error('❌ ERROR ADDING PRODUCT:', error);
        return null;
      }
    },
    [store, userId, listId]
  );
};

export const useDelShoppingListProductCallback = (
  listId: string,
  productId: string
) => useDelRowCallback("products", productId, useStoreId(listId));

export const useShoppingListValue = <ValueId extends ShoppingListValueId>(
  listId: string,
  valueId: ValueId
): [
  Value<Schemas[1], ValueId>,
  (value: Value<Schemas[1], ValueId>) => void
] => [
  useValue(valueId, useStoreId(listId)),
  useSetValueCallback(
    valueId,
    (value: Value<Schemas[1], ValueId>) => value,
    [],
    useStoreId(listId)
  ),
];

// Update the useUpdateListStatus function in ShoppingListStore.tsx

export const useUpdateListStatus = (listId: string) => {
  const storeId = useStoreId(listId);
  const store = useStore(storeId);
  
  return useCallback((newStatus: 'regular' | 'ongoing' | 'completed') => {
    if (!store) {
      console.warn('⚠️ Store not initialized yet for:', listId);
      return;
    }
    
    console.log('📝 Updating status in ShoppingListStore:', listId, 'to:', newStatus);
    
    // CRITICAL: Check if we have products BEFORE updating status
    const currentProducts = store.getTable('products');
    const productCount = Object.keys(currentProducts).length;
    
    console.log('📦 Current products count BEFORE status change:', productCount);
    
    if (productCount === 0) {
      console.error('🚨 WARNING: No products found before status update!');
      console.error('🚨 This might indicate products were already lost');
    }
    
    try {
      // Update status without triggering unnecessary syncs
      store.transaction(() => {
        store.setValue('status', newStatus);
        store.setValue('updatedAt', new Date().toISOString());
        
        if (newStatus === 'completed') {
          const currentCompletedAt = store.getValue('completedAt');
          if (!currentCompletedAt) {
            store.setValue('completedAt', new Date().toISOString());
          }
        }
        
        if (newStatus === 'regular') {
          store.setValue('completedAt', '');
        }
      });
      
      // Verify products are still there AFTER update
      const productsAfter = store.getTable('products');
      const productCountAfter = Object.keys(productsAfter).length;
      
      console.log('📦 Current products count AFTER status change:', productCountAfter);
      
      if (productCount !== productCountAfter) {
        console.error('🚨 PRODUCTS LOST DURING STATUS UPDATE!');
        console.error('Before:', productCount, 'After:', productCountAfter);
      } else {
        console.log('✅ Products preserved during status update');
      }
      
      console.log('✅ Status updated successfully to:', newStatus);
    } catch (error) {
      console.error('❌ Error updating status:', error);
    }
  }, [store, listId]);
};

export const useShoppingListProductCell = <
  CellId extends ShoppingListProductCellId
>(
  listId: string,
  productId: string,
  cellId: CellId
): [
  Cell<Schemas[0], "products", CellId>,
  (cell: Cell<Schemas[0], "products", CellId>) => void
] => [
  useCell("products", productId, cellId, useStoreId(listId)),
  useSetCellCallback(
    "products",
    productId,
    cellId,
    (cell: Cell<Schemas[0], "products", CellId>) => cell,
    [],
    useStoreId(listId)
  ),
];

export const useShoppingListProductIds = (listId: string) =>
  useSortedRowIds("products", "name", false, 0, undefined, useStoreId(listId));

export const useShoppingListProductRemoteRowIds = (listId: string) =>
  useRemoteRowId("products", useStoreId(listId));

export const useShoppingListProductCount = (listId: string) =>
  useRowCount("products", useStoreId(listId));

export const useShoppingListCollaboratorIds = (listId: string) =>
  useSortedRowIds(
    "collaborators",
    "nickname",
    false,
    0,
    undefined,
    useStoreId(listId)
  );

export const useShoppingListCollaboratorNicknames = (listId: string) =>
  Object.entries(useTable("collaborators", useStoreId(listId))).map(
    ([, { nickname }]) => nickname
  );

// Get the nickname of the user who created a product
export const useShoppingListProductCreatedByNickname = (
  listId: string,
  productId: string
): string | undefined => {
  const userId = useRemoteRowId(
    "createdByNickname",
    productId,
    useStoreId(listId)
  );
  return useCell("collaborators", userId, "nickname", useStoreId(listId));
};

// Get all user nicknames in the list
export const useShoppingListUserNicknames = (listId: string) =>
  Object.entries(useTable("collaborators", useStoreId(listId))).map(
    ([, { nickname }]) => nickname
  );

export default function ShoppingListStore({
  listId,
  useValuesCopy,
}: {
  listId: string;
  useValuesCopy: (id: string) => [string, (valuesCopy: string) => void];
}) {
  const storeId = useStoreId(listId);
  const [userId, nickname] = useUserIdAndNickname();
  const [valuesCopy, setValuesCopy] = useValuesCopy(listId);
  const initialized = useRef(false);
  const hasReceivedSyncData = useRef(false);

  const store = useCreateMergeableStore(() =>
    createMergeableStore().setSchema(TABLES_SCHEMA, VALUES_SCHEMA)
  );

  // FIRST: Initialize from existing valuesCopy (if we have it)
  useEffect(() => {
    if (!initialized.current && valuesCopy && valuesCopy !== '{}') {
      try {
        const parsedData = JSON.parse(valuesCopy);
        
        console.log('🔍 Initializing ShoppingListStore with valuesCopy:', parsedData);
        
        // ✅ FIXED: Better placeholder detection
        // If values object exists but has no name, it's an empty placeholder
        const hasNoValues = !parsedData.values || Object.keys(parsedData.values).length <= 1; // Only listId
        const hasNoProducts = !parsedData.tables?.products || Object.keys(parsedData.tables.products).length === 0;
        const isEmptyPlaceholder = hasNoValues && hasNoProducts;
        
        if (isEmptyPlaceholder) {
          console.log('⏳ Empty placeholder detected - waiting for WebSocket sync...');
          console.log('💡 This prevents CRDT conflicts - sync will provide all data');
          // DON'T mark as initialized yet - wait for real data from sync
          return;
        }
        
        // Real data - initialize store
        console.log('✅ Real data detected, initializing store...');
        
        if (parsedData.tables?.products) {
          Object.entries(parsedData.tables.products).forEach(([productId, product]) => {
            if (product && typeof product === 'object') {
              store.setRow('products', productId, product);
            }
          });
        }
        
        if (parsedData.tables?.collaborators) {
          Object.entries(parsedData.tables.collaborators).forEach(([collaboratorId, collaborator]) => {
            if (collaborator && typeof collaborator === 'object') {
              store.setRow('collaborators', collaboratorId, collaborator);
            }
          });
        }
        
        if (parsedData.values) {
          const validValueKeys: (keyof typeof VALUES_SCHEMA)[] = [
            'name', 'description', 'emoji', 'color', 'shoppingDate', 'budget', 
            'status', 'completedAt', 'createdAt', 'updatedAt'
          ];
          
          console.log('📝 About to set values from parsedData.values:', parsedData.values);
          
          validValueKeys.forEach(key => {
            // Only set if the value exists in parsedData
            if (key in parsedData.values && parsedData.values[key] !== undefined) {
              const value = parsedData.values[key];
              console.log(`  - Setting ${key}:`, value, typeof value);
              store.setValue(key, value);
              
              // CRITICAL: Verify it was set
              const verifyValue = store.getValue(key);
              console.log(`  - Verified ${key} in store:`, verifyValue);
            } else {
              console.log(`  - Skipping ${key} (not in parsedData or undefined)`);
            }
          });
        }
        
        console.log('✅ Initialized from existing valuesCopy');
        console.log('💰 Final store budget after init:', store.getValue('budget'));
        console.log('📊 All store values:', store.getValues());
        hasReceivedSyncData.current = true;
        initialized.current = true;
        
      } catch (error) {
        console.error('❌ INITIALIZATION ERROR:', error);
        // Even on error, mark as initialized to allow WebSocket sync
        initialized.current = true;
      }
    }
  }, [valuesCopy, store]);

  // Debounced sync back to parent
  const debouncedSetValuesCopyRef = useRef(
    debounce((storeData: string, setter: (data: string) => void) => {
      if (initialized.current) {
        setter(storeData);
      }
    }, 500)
  );

  const setValuesCopyRef = useRef(setValuesCopy);
  const listIdRef = useRef(listId);
  
  useEffect(() => {
    setValuesCopyRef.current = setValuesCopy;
  }, [setValuesCopy]);
  
  useEffect(() => {
    listIdRef.current = listId;
  }, [listId]);

  // ✅ COMPLETELY FIXED: The sync logic
  const syncStoreData = useCallback(() => {
    if (!store) return;
    
    const currentName = store.getValue('name');
    
    // ✅ FIXED: Only skip if we have no data at all (empty placeholder)
    // Once WebSocket provides ANY data, allow syncing
    const hasNoData = !currentName && !hasReceivedSyncData.current && !initialized.current;
    
    if (hasNoData) {
      console.log('⏳ No data yet, waiting for WebSocket sync...');
      return;
    }
    
    // ✅ Mark as initialized once we have ANY real data
    if (!initialized.current && currentName) {
      console.log('✅ Received data from WebSocket, initializing');
      initialized.current = true;
      hasReceivedSyncData.current = true;
    }
    
    // ✅ Now sync is allowed!
    if (!initialized.current) {
      console.log('⏳ Not yet initialized, skipping sync');
      return;
    }
    
    try {
      const storeData = {
        tables: {
          products: store.getTable('products'),
          collaborators: store.getTable('collaborators'),
        },
        values: {
          ...store.getValues(),
          listId: listIdRef.current,
          updatedAt: new Date().toISOString(),
        },
      };
      
      const budget = store.getValue('budget');
      const name = store.getValue('name');
      const status = store.getValue('status');
      
      console.log('🔄 Syncing data:', { budget, name, status });
      
      // Use debounced version to avoid too frequent updates
      const serializedData = JSON.stringify(storeData);
      debouncedSetValuesCopyRef.current(serializedData, setValuesCopyRef.current);
      
    } catch (error) {
      console.error('❌ SYNC ERROR:', error);
    }
  }, [store]);

  // Listen to ALL value changes
  useValuesListener((store) => {
    const currentName = store?.getValue('name');
    console.log('👂 Values changed, name is:', currentName);
    
    // Sync whenever values change (the syncStoreData function will handle filtering)
    syncStoreData();
  }, [], false, store);
  
  useEffect(() => {
    if (!store) return;
    
    const productsListenerId = store.addTableListener('products', syncStoreData);
    const collaboratorsListenerId = store.addTableListener('collaborators', syncStoreData);
    const statusListenerId = store.addValueListener('status', syncStoreData);
    const budgetListenerId = store.addValueListener('budget', (store, valueId, newBudget) => {
      console.log('💰 Budget changed in store:', newBudget);
      syncStoreData();
    });
    const nameListenerId = store.addValueListener('name', (store, valueId, newName) => {
      console.log('📝 Name changed in store:', newName);
      
      // When name changes from "Loading..." to real name, mark as received
      if (newName && newName !== 'Loading...' && !hasReceivedSyncData.current) {
        console.log('✅ Real data arrived from WebSocket sync!');
        hasReceivedSyncData.current = true;
        initialized.current = true;
      }
      
      syncStoreData();
    });
    
    return () => {
      store.delListener(productsListenerId);
      store.delListener(collaboratorsListenerId);
      store.delListener(statusListenerId);
      store.delListener(budgetListenerId);
      store.delListener(nameListenerId);
    };
  }, [store, syncStoreData]);

  useCreateClientPersisterAndStart(storeId, store, valuesCopy, () => {
    const existingCollaborator = store.getCell("collaborators", userId, "nickname");
    if (!existingCollaborator && nickname) {
      store.setRow("collaborators", userId, { nickname });
    }
  });
  
  // THIS IS THE KEY: The sync will populate the store from other clients
  useCreateServerSynchronizerAndStart(storeId, store);
  useProvideStore(storeId, store);

  const relationships = useCreateRelationships(store, (store) =>
    createRelationships(store).setRelationshipDefinition(
      "createdByNickname",
      "products",
      "collaborators",
      "createdBy"
    )
  );
  useProvideRelationships(storeId, relationships);

  return null;
}

export { useStore };
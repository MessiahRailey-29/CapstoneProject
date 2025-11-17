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

export const useUpdateListStatus = (listId: string) => {
  const storeId = useStoreId(listId);
  const store = useStore(storeId);

  return useCallback((newStatus: 'regular' | 'ongoing' | 'completed') => {
    if (!store) {
      console.warn('⚠️ Store not initialized yet for:', listId);
      return;
    }

    console.log('📝 Updating status in ShoppingListStore:', listId, 'to:', newStatus);

    const currentProducts = store.getTable('products');
    const productCount = Object.keys(currentProducts).length;

    console.log('📦 Current products count BEFORE status change:', productCount);
    console.log('📦 Product IDs:', Object.keys(currentProducts).join(', '));

    if (productCount === 0) {
      console.error('🚨 WARNING: No products found before status update!');
      console.error('🚨 Aborting status update to prevent data loss');
      return; // ⭐ CRITICAL: Don't update status if no products
    }

    try {
      // ⭐ Use transaction to ensure atomic update
      store.transaction(() => {
        // Store products in memory before status change
        const productsSnapshot = { ...currentProducts };
        
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
        
        // ⭐ Verify products are still there after status change
        const productsAfterStatus = store.getTable('products');
        if (Object.keys(productsAfterStatus).length === 0 && productCount > 0) {
          console.error('🚨 PRODUCTS LOST IN TRANSACTION! Restoring...');
          // Restore products
          Object.entries(productsSnapshot).forEach(([productId, product]) => {
            if (product && typeof product === 'object') {
              store.setRow('products', productId, product);
            }
          });
        }
      });

      const productsAfter = store.getTable('products');
      const productCountAfter = Object.keys(productsAfter).length;

      console.log('📦 Current products count AFTER status change:', productCountAfter);

      if (productCount !== productCountAfter) {
        console.error('🚨 PRODUCTS LOST DURING STATUS UPDATE!');
        console.error(`🚨 Lost ${productCount - productCountAfter} products`);
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
  const isSyncing = useRef(false);
  const lastSyncedData = useRef<string>('');
  const initializationAttempted = useRef(false);

  const store = useCreateMergeableStore(() =>
    createMergeableStore().setSchema(TABLES_SCHEMA, VALUES_SCHEMA)
  );

  // CRITICAL FIX: Single merged initialization effect
  useEffect(() => {
    if (!store || !valuesCopy) return;

    // ⭐ GUARD 1: If store already has products and is initialized, skip re-initialization
    const existingProducts = store.getTable('products');
    const hasProducts = Object.keys(existingProducts).length > 0;
    
    if (hasProducts && initialized.current) {
      console.log('⚠️ Store already initialized with products, skipping re-initialization');
      return;
    }

    // ⭐ GUARD 2: Only attempt initialization once per data change
    if (initializationAttempted.current) {
      return;
    }

    if (valuesCopy === '{}') {
      console.log('⏳ No valuesCopy yet, waiting...');
      return;
    }

    initializationAttempted.current = true;

    try {
      const parsedData = JSON.parse(valuesCopy);
      
      console.log('🔍 Initializing ShoppingListStore:', {
        listId,
        hasValues: !!parsedData.values,
        hasTables: !!parsedData.tables,
        name: parsedData.values?.name,
        emoji: parsedData.values?.emoji,
        color: parsedData.values?.color,
        budget: parsedData.values?.budget,
      });
      
      // Check if this is an empty placeholder (only has listId, no other values)
      const valueKeys = parsedData.values ? Object.keys(parsedData.values) : [];
      const hasOnlyListId = valueKeys.length === 1 && valueKeys[0] === 'listId';
      const hasNoProducts = !parsedData.tables?.products || Object.keys(parsedData.tables.products).length === 0;
      const isEmptyPlaceholder = hasOnlyListId && hasNoProducts;
      
      if (isEmptyPlaceholder) {
        console.log('📝 Empty placeholder - waiting for sync to populate data');
        // Reset initialization flag so we can try again when real data arrives
        initializationAttempted.current = false;
        return;
      }
      
      // We have real data - initialize the store
      console.log('✅ Real data found, initializing store...');
      
      // Initialize products
      if (parsedData.tables?.products) {
        Object.entries(parsedData.tables.products).forEach(([productId, product]) => {
          if (product && typeof product === 'object') {
            store.setRow('products', productId, product);
          }
        });
        console.log(`  ✓ Loaded ${Object.keys(parsedData.tables.products).length} products`);
      }
      
      // Initialize collaborators
      if (parsedData.tables?.collaborators) {
        Object.entries(parsedData.tables.collaborators).forEach(([collaboratorId, collaborator]) => {
          if (collaborator && typeof collaborator === 'object') {
            store.setRow('collaborators', collaboratorId, collaborator);
          }
        });
        console.log(`  ✓ Loaded ${Object.keys(parsedData.tables.collaborators).length} collaborators`);
      }
      
      // Initialize values
      if (parsedData.values) {
        const validValueKeys: (keyof typeof VALUES_SCHEMA)[] = [
          'name', 'description', 'emoji', 'color', 'shoppingDate', 'budget', 
          'status', 'completedAt', 'createdAt', 'updatedAt',
          'recipeSuggestionsPrompted', 'recipeSuggestionsEnabled'
        ];
        
        // Use transaction to set all values at once
        store.transaction(() => {
          validValueKeys.forEach(key => {
            if (key in parsedData.values) {
              const value = parsedData.values[key];
              if (value !== undefined && value !== null) {
                store.setValue(key, value);
                console.log(`  ✓ Set ${key}:`, value);
              }
            }
          });
        });
      }
      
      // Verify critical values were set
      const verifyName = store.getValue('name');
      const verifyEmoji = store.getValue('emoji');
      const verifyColor = store.getValue('color');
      const verifyBudget = store.getValue('budget');
      
      console.log('🔍 Verification after init:', {
        name: verifyName,
        emoji: verifyEmoji,
        color: verifyColor,
        budget: verifyBudget,
      });
      
      if (!verifyName || !verifyEmoji || !verifyColor) {
        console.error('🚨 CRITICAL: Values not properly initialized!');
        console.error('  Expected:', parsedData.values);
        console.error('  Got in store:', store.getValues());
        // Reset flag to try again
        initializationAttempted.current = false;
        return;
      }
      
      console.log('✅ Store initialized successfully');
      hasReceivedSyncData.current = true;
      initialized.current = true;
      
    } catch (error) {
      console.error('❌ Initialization error:', error);
      // Reset flag to allow retry
      initializationAttempted.current = false;
    }
  }, [valuesCopy, store, listId]);

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

  const syncStoreData = useCallback(() => {
    if (!store) return;

    if (isSyncing.current) {
      console.log('⚠️ Sync already in progress, skipping...');
      return;
    }

    const currentName = store.getValue('name');

    if (!currentName && !hasReceivedSyncData.current && !initialized.current) {
      return;
    }

    if (!initialized.current && currentName) {
      console.log('✅ Data received, marking as initialized');
      initialized.current = true;
      hasReceivedSyncData.current = true;
    }

    if (!initialized.current) {
      return;
    }

    try {
      isSyncing.current = true;

      // ⭐ Verify we have products before syncing
      const products = store.getTable('products');
      const productCount = Object.keys(products).length;
      
      console.log(`🔄 Syncing store data - ${productCount} products`);

      const storeData = {
        tables: {
          products: products,
          collaborators: store.getTable('collaborators'),
        },
        values: {
          ...store.getValues(),
          listId: listIdRef.current,
        },
      };

      const serializedData = JSON.stringify(storeData);

      // ⭐ Verify serialized data contains products
      if (productCount > 0) {
        const parsedCheck = JSON.parse(serializedData);
        const serializedProductCount = Object.keys(parsedCheck.tables?.products || {}).length;
        
        if (serializedProductCount !== productCount) {
          console.error('🚨 Product count mismatch in serialization!');
          console.error(`Expected: ${productCount}, Got: ${serializedProductCount}`);
          isSyncing.current = false;
          return;
        }
      }

      if (serializedData === lastSyncedData.current) {
        isSyncing.current = false;
        return;
      }

      lastSyncedData.current = serializedData;

      debouncedSetValuesCopyRef.current(serializedData, setValuesCopyRef.current);

      setTimeout(() => {
        isSyncing.current = false;
      }, 100);

    } catch (error) {
      console.error('❌ Sync error:', error);
      isSyncing.current = false;
    }
  }, [store]);

  useValuesListener((store) => {
    syncStoreData();
  }, [], false, store);
  
  useEffect(() => {
    if (!store) return;
    
    const productsListenerId = store.addTableListener('products', syncStoreData);
    const collaboratorsListenerId = store.addTableListener('collaborators', syncStoreData);
    const statusListenerId = store.addValueListener('status', (store, valueId, newStatus) => {
      // ⭐ Verify products are preserved during status change
      const products = store.getTable('products');
      const productCount = Object.keys(products).length;
      
      console.log(`📊 Status changed to: ${newStatus}, Products: ${productCount}`);
      
      if (productCount === 0 && initialized.current) {
        console.error('🚨 WARNING: Products disappeared after status change!');
        console.error('🚨 This indicates a sync/persistence issue');
      }
      
      syncStoreData();
    });
    const budgetListenerId = store.addValueListener('budget', syncStoreData);
    const nameListenerId = store.addValueListener('name', (store, valueId, newName) => {
      if (newName && newName !== 'Loading...' && !hasReceivedSyncData.current) {
        console.log('✅ Real name arrived from sync:', newName);
        hasReceivedSyncData.current = true;
        initialized.current = true;
        // Reset initialization flag to allow re-initialization with new data
        initializationAttempted.current = false;
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
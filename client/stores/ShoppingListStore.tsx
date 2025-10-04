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
  budget: { type: "number", default: 0 },
  createdAt: { type: "string" },
  updatedAt: { type: "string" },
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
    // Enhanced with store selection
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

// Enhanced product creation with immediate duplicate check
export const useAddShoppingListProductCallback = (listId: string) => {
  const store = useStore(useStoreId(listId));
  const [userId] = useUserIdAndNickname();
  
  return useCallback(
    (
      name: string, 
      quantity: number, 
      units: string, 
      notes: string,
      selectedStore?: string,
      selectedPrice?: number,
      databaseProductId?: number,
      category?: string
    ) => {
      const id = randomUUID();
      const now = new Date().toISOString();
      
      // Normalize name for comparison
      const normalizedName = name.trim().toLowerCase();
      
      if (!normalizedName) {
        console.warn('❌ Product name cannot be empty');
        return null;
      }
      
      try {
        // Get current products directly from store - this should work now
        const existingProducts = store.getTable("products");
        
        console.log('🔍 DUPLICATE CHECK:', {
          listId,
          searchingFor: normalizedName,
          existingCount: Object.keys(existingProducts).length,
          existingNames: Object.values(existingProducts)
            .map(p => p && typeof p === 'object' && 'name' in p ? String(p.name).trim().toLowerCase() : null)
            .filter(Boolean)
        });
        
        // Check for duplicates
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
          return null;
        }
        
        // Add product
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
          newProductCount: Object.keys(store.getTable("products")).length
        });
        
        return id;
        
      } catch (error) {
        console.error('❌ ERROR ADDING PRODUCT:', error);
        return null;
      }
    },
    [store, userId]
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

export const useShoppingListProductIds = (
  listId: string,
  cellId: ShoppingListProductCellId = "createdAt",
  descending?: boolean,
  offset?: number,
  limit?: number
) =>
  useSortedRowIds(
    "products",
    cellId,
    descending,
    offset,
    limit,
    useStoreId(listId)
  );

export const useShoppingListProductCount = (listId: string) =>
  useRowCount("products", useStoreId(listId));

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

export const useShoppingListProductCreatedByNickname = (
  listId: string,
  productId: string
) => {
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

// Simplified store - going back to original approach but with better initialization
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

  const store = useCreateMergeableStore(() =>
    createMergeableStore().setSchema(TABLES_SCHEMA, VALUES_SCHEMA)
  );

  // Initialize store from valuesCopy only once
  useEffect(() => {
    if (!initialized.current && valuesCopy && valuesCopy !== '{}') {
      try {
        const parsedData = JSON.parse(valuesCopy);
        
        console.log('🔧 INITIALIZING STORE FROM VALUESCOPY:', {
          hasProducts: !!parsedData.tables?.products,
          productCount: Object.keys(parsedData.tables?.products || {}).length,
          hasValues: !!parsedData.values,
          values: parsedData.values
        });
        
        // Initialize products
        if (parsedData.tables?.products) {
          Object.entries(parsedData.tables.products).forEach(([productId, product]) => {
            if (product && typeof product === 'object') {
              store.setRow('products', productId, product);
            }
          });
        }
        
        // Initialize collaborators
        if (parsedData.tables?.collaborators) {
          Object.entries(parsedData.tables.collaborators).forEach(([collaboratorId, collaborator]) => {
            if (collaborator && typeof collaborator === 'object') {
              store.setRow('collaborators', collaboratorId, collaborator);
            }
          });
        }
        
        // Initialize values (THIS WAS MISSING!)
        if (parsedData.values) {
          const validValueKeys: (keyof typeof VALUES_SCHEMA)[] = [
            'name', 'description', 'emoji', 'color', 'shoppingDate', 
            'budget', 'createdAt', 'updatedAt'
          ];
          
          validValueKeys.forEach(key => {
            if (key in parsedData.values && parsedData.values[key] !== undefined) {
              console.log(`📝 Setting ${key}:`, parsedData.values[key]);
              store.setValue(key, parsedData.values[key]);
            }
          });
        }
        
        initialized.current = true;
        
      } catch (error) {
        console.error('❌ INITIALIZATION ERROR:', error);
      }
    }
  }, [valuesCopy, store]);

  // Sync changes back to valuesCopy (but only after initialization)
  const debouncedSetValuesCopy = useCallback(
    debounce((storeData: string) => {
      if (initialized.current) {
        setValuesCopy(storeData);
      }
    }, 500),
    [setValuesCopy]
  );

  // Create sync function
  const syncStoreData = useCallback(() => {
    if (!initialized.current) return;
    
    try {
      const storeData = {
        tables: {
          products: store.getTable('products'),
          collaborators: store.getTable('collaborators'),
        },
        values: {
          ...store.getValues(),
          listId,
          updatedAt: new Date().toISOString(),
        },
      };
      
      const serializedData = JSON.stringify(storeData);
      
      if (serializedData !== valuesCopy) {
        console.log('🔄 SYNCING CHANGES:', {
          listId,
          productCount: Object.keys(storeData.tables.products).length,
          collaboratorCount: Object.keys(storeData.tables.collaborators).length
        });
        debouncedSetValuesCopy(serializedData);
      }
    } catch (error) {
      console.error('❌ SYNC ERROR:', error);
    }
  }, [store, valuesCopy, listId, debouncedSetValuesCopy]);

  // Listen to both tables and values changes
  useValuesListener(syncStoreData, [syncStoreData], false, store);
  
  // Add listeners for table changes (this is the key fix)
  useEffect(() => {
    if (!store || !initialized.current) return;
    
    const listenerId = store.addTableListener('products', () => {
      console.log('📊 PRODUCTS TABLE CHANGED');
      syncStoreData();
    });
    
    return () => {
      store.delListener(listenerId);
    };
  }, [store, syncStoreData]);
  
  useEffect(() => {
    if (!store || !initialized.current) return;
    
    const listenerId = store.addTableListener('collaborators', () => {
      console.log('👥 COLLABORATORS TABLE CHANGED');
      syncStoreData();
    });
    
    return () => {
      store.delListener(listenerId);
    };
  }, [store, syncStoreData]);

  useCreateClientPersisterAndStart(storeId, store, valuesCopy, () => {
    // Add collaborator if not exists
    const existingCollaborator = store.getCell("collaborators", userId, "nickname");
    if (!existingCollaborator && nickname) {
      store.setRow("collaborators", userId, { nickname });
      console.log('👥 Added collaborator:', { userId, nickname });
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
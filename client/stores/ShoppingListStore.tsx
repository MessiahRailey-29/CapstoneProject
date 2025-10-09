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

  // ✅ Initialize ONCE from valuesCopy - never update from it again
  useEffect(() => {
    if (!initialized.current && valuesCopy && valuesCopy !== '{}') {
      try {
        const parsedData = JSON.parse(valuesCopy);
        
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
        
        // Initialize values
        if (parsedData.values) {
          const validValueKeys: (keyof typeof VALUES_SCHEMA)[] = [
            'name', 'description', 'emoji', 'color', 'shoppingDate', 
            'budget', 'createdAt', 'updatedAt'
          ];
          
          validValueKeys.forEach(key => {
            if (key in parsedData.values && parsedData.values[key] !== undefined) {
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

  // ✅ Sync FROM store TO valuesCopy only
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
    if (!initialized.current || !store) return;
    
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
      
      const serializedData = JSON.stringify(storeData);
      debouncedSetValuesCopyRef.current(serializedData, setValuesCopyRef.current);
    } catch (error) {
      console.error('❌ SYNC ERROR:', error);
    }
  }, [store]);

  useValuesListener(syncStoreData, [], false, store);
  
  useEffect(() => {
    if (!store || !initialized.current) return;
    
    const productsListenerId = store.addTableListener('products', syncStoreData);
    const collaboratorsListenerId = store.addTableListener('collaborators', syncStoreData);
    
    return () => {
      store.delListener(productsListenerId);
      store.delListener(collaboratorsListenerId);
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
import { useCallback } from "react";
import { randomUUID } from "expo-crypto";
import { debounce } from 'lodash'
import { useRemoteRowId } from "tinybase/ui-react";
import * as UiReact from "tinybase/ui-react/with-schemas";
import {
  Cell,
  createMergeableStore,
  createRelationships,
  Value,
} from "tinybase/with-schemas";
import { useUserIdAndNickname } from "@/hooks/useNickname";
import { useCreateClientPersisterAndStart } from "@/stores/persistence/useCreateClientPersisterAndStart";
import { useCreateServerSynchronizerAndStart } from "./synchronization/useCreateServerSynchronizerAndStart";
import React from "react";

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

const useStoreId = (listId: string) => STORE_ID_PREFIX + listId;

// Enhanced product creation with store selection
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
      
      // Check for duplicate products by name
      const existingProducts = store.getTable("products");
      const isDuplicate = Object.values(existingProducts).some(
        (product: any) => product.name === name && !product.isPurchased
      );
      
      if (isDuplicate) {
        console.warn('Product with same name already exists:', name);
        return id;
      }
      
      // Use transaction for atomic operation
      store.transaction(() => {
        store.setRow("products", id, {
          id,
          name,
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
      });
      
      console.log('âœ… Added product:', name);
      return id;
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

// Fixed store with better sync handling
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

  const store = useCreateMergeableStore(() =>
    createMergeableStore().setSchema(TABLES_SCHEMA, VALUES_SCHEMA)
  );

  // Initialize store with data from valuesCopy when it changes
  React.useEffect(() => {
    if (valuesCopy) {
      try {
        const data = JSON.parse(valuesCopy);
        console.log('Initializing store with data:', data);
        
        // Set individual values in TinyBase store
        if (data.values) {
          const values = data.values;
          
          // Set all the values properly in TinyBase
          if (values.name) store.setValue('name', values.name);
          if (values.description) store.setValue('description', values.description);
          if (values.emoji) store.setValue('emoji', values.emoji);
          if (values.color) store.setValue('color', values.color);
          if (values.budget !== undefined) {
            console.log('Setting budget in TinyBase:', values.budget);
            store.setValue('budget', values.budget);
          }
          if (values.createdAt) store.setValue('createdAt', values.createdAt);
          if (values.updatedAt) store.setValue('updatedAt', values.updatedAt);
          
          store.setValue('listId', listId);
        }
        
        // Also restore tables data if present
        if (data.tables) {
          if (data.tables.products) {
            Object.entries(data.tables.products).forEach(([productId, productData]: [string, any]) => {
              store.setRow('products', productId, productData);
            });
          }
          if (data.tables.collaborators) {
            Object.entries(data.tables.collaborators).forEach(([collaboratorId, collaboratorData]: [string, any]) => {
              store.setRow('collaborators', collaboratorId, collaboratorData);
            });
          }
        }
      } catch (error) {
        console.error('Error initializing store from valuesCopy:', error);
      }
    }
  }, [valuesCopy, store, listId]);

  // Improved debounce with more conservative timing
  const debouncedSetValuesCopy = useCallback(
    debounce((storeData: string) => {
      setValuesCopy(storeData);
    }, 1000), // Increased to 1 second to reduce sync conflicts
    [setValuesCopy]
  );

  // Better values listener with change detection
  useValuesListener(
    () => {
      try {
        const storeData = {
          tables: {
            products: store.getTable('products'),
            collaborators: store.getTable('collaborators'),
          },
          values: {
            ...store.getValues(), // This will now include the properly set budget
            listId,
            updatedAt: new Date().toISOString(),
          },
        };
        
        const serializedData = JSON.stringify(storeData);
        
        // Only update if data actually changed (prevents loops)
        if (serializedData !== valuesCopy) {
          console.log('Syncing store data:', storeData.values);
          debouncedSetValuesCopy(serializedData);
        }
      } catch (error) {
        console.error('Error in values listener:', error);
      }
    },
    [debouncedSetValuesCopy, valuesCopy, listId, store],
    false,
    store
  );

  useCreateClientPersisterAndStart(storeId, store, valuesCopy, () => {
    // Only add collaborator once
    const existingCollaborator = store.getCell("collaborators", userId, "nickname");
    if (!existingCollaborator) {
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
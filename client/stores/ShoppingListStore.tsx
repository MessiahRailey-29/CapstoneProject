import * as UiReact from 'tinybase/ui-react/with-schemas';
import { createMergeableStore, Value } from 'tinybase/with-schemas';
import { useCreateClientPersisterAndStart } from './persistence/useCreateClientPersisterAndStart';
import { useCreateServerSynchronizerAndStart } from './synchronization/useCreateServerSynchronizerAndStart';
import { useUserIdAndNickname } from '@/hooks/useNickname';
const STORE_ID_PREFIX = "shoppingListStore-";

const VALUES_SCHEMA = {
  listId: { type: "string" },
  name: { type: "string" },
  description: { type: "string" },
  emoji: { type: "string" },
  color: { type: "string" },
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
    createdBy: { type: "string" }, // userId
    createdAt: { type: "string" },
    updatedAt: { type: "string" },
  },
  collaborators: {
    nickname: { type: "string" },
  },
} as const;

type Schemas = [typeof TABLES_SCHEMA, typeof VALUES_SCHEMA];
type ShoppingListValueId = keyof typeof VALUES_SCHEMA;
type ShoppingListProductCellId = keyof (typeof TABLES_SCHEMA) ["products"];

const {
  useCell,
  useCreateMergeableStore,
  useProvideStore,
  useRowCount,
  useSetCellCallback,
  useSortedRowIds,
  useDelRowCallback,
  useSetValueCallback,
  useStore,
  useTable,
  useValue,
} = UiReact as UiReact.WithSchemas<Schemas>;

const useStoreId = (listId: string) => STORE_ID_PREFIX + listId;

//return the number of products
export const useShoppingListProductCount = (listId: string) => 
  useRowCount("products", useStoreId(listId));

// returns the nicknames of collaborators
export const useShoppingListUserNicknames = (listId: string) =>
  Object.entries(useTable("collaborators", useStoreId(listId))).map(
    ([, {nickname }]) => nickname
  )
export const  useShoppingListValue = <ValueId extends ShoppingListValueId>(
  listId: string,
  valueId: ValueId 
): [
  Value <Schemas[1], ValueId>,
  (value: Value <Schemas[1], ValueId>) => void
] => [
  useValue (valueId, useStoreId(listId)),
  useSetValueCallback(
    valueId,
    (value: Value<Schemas[1], ValueId>) => value,
    [],
    useStoreId(listId)
  ),
];
// Create, persist, and sync a store, containing the shopping list and products.
export default function ShoppingListStore({
    listId,
    initialContentJson,
}: {
    listId: string;
    initialContentJson: string;
}) {
    const storeId = useStoreId (listId);
    const store = useCreateMergeableStore(() =>
    createMergeableStore().setSchema(TABLES_SCHEMA, VALUES_SCHEMA)
    );
    const [userId, nickname] = useUserIdAndNickname();
    useCreateClientPersisterAndStart(storeId, store, initialContentJson, () =>
    store.setRow("collaborators", userId, {nickname})
    );
    useCreateServerSynchronizerAndStart(storeId, store);
    useProvideStore(storeId, store);
    
    return null;
}
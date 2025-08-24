import { useUser } from '@clerk/clerk-expo';
import * as UiReact from 'tinybase/ui-react/with-schemas';
import { createMergeableStore, NoValuesSchema } from 'tinybase/with-schemas';
import { useCreateClientPersisterAndStart } from './persistence/useCreateClientPersisterAndStart';
import { useCreateServerSynchronizerAndStart } from './synchronization/useCreateServerSynchronizerAndStart';
import ShoppingListStore from './ShoppingListStore';
import { useCallback } from 'react';
import { randomUUID } from 'expo-crypto';

const STORE_ID_PREFIX = "shoppingListsStore-";

const TABLES_SCHEMA = {
    lists: {
        id: {type: "string"},
        initialContentJson: {type: "string"},
    },
} as const;

const {
    useCreateMergeableStore,
    useDelRowCallback,
    useProvideStore,
    useRowIds,
    useStore,
    useTable,
} = UiReact as UiReact.WithSchemas<[typeof TABLES_SCHEMA, NoValuesSchema]>

const useStoreId = () => STORE_ID_PREFIX + useUser().user.id;

export const useAddShoppingListCallback = () => {
    const store = useStore(useStoreId())

    return useCallback(
        (name: string, description: string, emoji: string, color: string) => {
            const id = randomUUID();
            store.setRow("lists", id, {
                id,
                initialContentJson: JSON.stringify([
                    {},
                    {
                        id,
                        name,
                        description,
                        emoji,
                        color,
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString(),
                    },
                ]),
            });
            return id;
        },
        [store]
    )
}

export default function ShoppingListsStore () {
    const storeId = useStoreId();
    const store = useCreateMergeableStore (() =>
    createMergeableStore().setTablesSchema(TABLES_SCHEMA)
    );

    useCreateClientPersisterAndStart(storeId, store);
    useCreateServerSynchronizerAndStart(storeId, store);
    useProvideStore(storeId, store);
    const currentUserLists = useTable("lists", storeId);

    return Object.entries(currentUserLists).map(
        ([ListId, {initialContentJson}]) => (
            <ShoppingListStore
            listId={ListId}
            initialContentJson={initialContentJson}
            key={ListId}
            />
        )
    )
}
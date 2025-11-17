import * as UiReact from "tinybase/ui-react/with-schemas";
import type {
  Content,
  MergeableStore,
  OptionalSchemas,
} from "tinybase/with-schemas";
import { createClientPersister } from "./createClientPersister";

export const useCreateClientPersisterAndStart = <
  Schemas extends OptionalSchemas
>(
  storeId: string,
  store: MergeableStore<Schemas>,
  initialValues?: string,
  then?: () => void
) =>
  (UiReact as UiReact.WithSchemas<Schemas>).useCreatePersister(
    store,
    (store: MergeableStore<Schemas>) => createClientPersister(storeId, store),
    [storeId],
    async (persister) => {
      // ⭐ CRITICAL FIX: Check if store already has data before loading from persister
      // This prevents the persister from overwriting products during status changes
      
      const existingTables = store.getTables();
      const hasAnyData = Object.keys(existingTables).some(tableId => {
        const table = store.getTable(tableId as any);
        return table && Object.keys(table).length > 0;
      });
      
      console.log('🔧 Persister initialization:', {
        storeId,
        hasAnyData,
        tableCount: Object.keys(existingTables).length
      });
      
      // Log product count if products table exists
      const productsTable = store.getTable('products' as any);
      if (productsTable) {
        const productCount = Object.keys(productsTable).length;
        console.log(`📦 Store has ${productCount} products`);
        
        if (productCount > 0) {
          console.log('⚠️ Products exist in store - will NOT load from persister to prevent overwrite');
        }
      }

      let initialContent: Content<Schemas> | undefined = undefined;
      
      try {
        initialContent = [{}, JSON.parse(initialValues || '{}')];
      } catch (error) {
        console.warn('⚠️ Could not parse initial values:', error);
      }

      // ⭐ KEY FIX: Only load from persister if store is completely empty
      if (!hasAnyData) {
        console.log('🆕 Store is empty - loading from persister/initial values');
        await persister.load(initialContent);
        console.log('✅ Loaded from persister');
      } else {
        console.log('♻️ Store has data - saving current state to persister instead of loading');
        
        // Save current in-memory state to disk
        // This ensures persister has the latest data
        try {
          await persister.save();
          console.log('✅ Saved current state to persister');
        } catch (error) {
          console.error('❌ Error saving to persister:', error);
        }
      }
      
      // Start auto-save - this is safe as it only saves changes, never loads
      await persister.startAutoSave();
      console.log('✅ Auto-save started for:', storeId);
      
      then?.();
    },
    [initialValues]
  );
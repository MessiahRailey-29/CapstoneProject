import ReconnectingWebSocket from "reconnecting-websocket";
import { createWsSynchronizer } from "tinybase/synchronizers/synchronizer-ws-client/with-schemas";
import * as UiReact from "tinybase/ui-react/with-schemas";
import { MergeableStore, OptionalSchemas } from "tinybase/with-schemas";

const SYNC_SERVER_URL = process.env.EXPO_PUBLIC_SYNC_SERVER_URL;

console.log('🔍 SYNC_SERVER_URL:', SYNC_SERVER_URL);

if (!SYNC_SERVER_URL) {
  throw new Error(
    "Please set EXPO_PUBLIC_SYNC_SERVER_URL in .env to the URL of the sync server"
  );
}

export const useCreateServerSynchronizerAndStart = <
  Schemas extends OptionalSchemas
>(
  storeId: string,
  store: MergeableStore<Schemas>
) =>
  (UiReact as UiReact.WithSchemas<Schemas>).useCreateSynchronizer(
    store,
    async (store: MergeableStore<Schemas>) => {
      const wsUrl = SYNC_SERVER_URL + storeId;
      console.log('🔗 Connecting to WebSocket:', wsUrl);

      // Create the synchronizer.
      const synchronizer = await createWsSynchronizer(
        store,
        new ReconnectingWebSocket(wsUrl, [], {
          maxReconnectionDelay: 10000,  // 10 seconds between retries
          connectionTimeout: 30000,      // 30 seconds to connect (Render can take time to wake up)
        })
      );

      console.log('✅ Synchronizer created for:', storeId);

      // Start the synchronizer.
      await synchronizer.startSync();
      
      console.log('✅ Sync started for:', storeId);

      // If the websocket reconnects in the future, do another explicit sync.
      synchronizer.getWebSocket().addEventListener("open", () => {
        console.log('🔌 WebSocket opened for:', storeId);
        synchronizer.load().then(() => {
          console.log('📥 Loaded from server');
          return synchronizer.save();
        }).then(() => {
          console.log('📤 Saved to server');
        });
      });

      synchronizer.getWebSocket().addEventListener("error", (error) => {
        console.error('❌ WebSocket error for:', storeId, error);
      });

      synchronizer.getWebSocket().addEventListener("close", () => {
        console.log('👋 WebSocket closed for:', storeId);
      });

      synchronizer.getWebSocket().addEventListener("message", (event) => {
        console.log('📩 Received WebSocket message:', event.data);
      });

      return synchronizer;
    },
    [storeId]
  );
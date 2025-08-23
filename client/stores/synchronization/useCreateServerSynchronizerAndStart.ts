import ReconnectingWebSocket from "reconnecting-websocket";
import { createWsSynchronizer } from "tinybase/synchronizers/synchronizer-ws-client/with-schemas";
import * as UiReact from "tinybase/ui-react/with-schemas";
import { MergeableStore, OptionalSchemas } from "tinybase/with-schemas";
import { Platform } from "react-native";

const getSyncServerUrl = (fallback = false) => {
  // Use .env if available (for production deployments)
  let envUrl = process.env.EXPO_PUBLIC_SYNC_SERVER_URL;

  if (envUrl) {
    return envUrl.endsWith("/") ? envUrl : envUrl + "/";
  }

  // Otherwise, auto-detect based on platform
  let host = "127.0.0.1"; // Web default
  if (Platform.OS === "android") host = "10.0.2.2";
  if (Platform.OS === "ios") host = "localhost";

  // If first attempt fails, try localhost instead of 127.0.0.1
  if (fallback) {
    host = "localhost";
  }

  const protocol = process.env.NODE_ENV === "production" ? "wss" : "ws";
  return `${protocol}://${host}:8787/`;
};

export const useCreateServerSynchronizerAndStart = <
  Schemas extends OptionalSchemas
>(
  storeId: string,
  store: MergeableStore<Schemas>
) =>
  (UiReact as UiReact.WithSchemas<Schemas>).useCreateSynchronizer(
    store,
    async (store: MergeableStore<Schemas>) => {
      let baseUrl = getSyncServerUrl();
      let fullUrl = `${baseUrl}${storeId}`;
      console.log("🔗 Connecting to WebSocket:", fullUrl);

      let ws: ReconnectingWebSocket;
      try {
        ws = new ReconnectingWebSocket(fullUrl, [], {
          maxReconnectionDelay: 1000,
          connectionTimeout: 1000,
        });
      } catch (error) {
        console.error("❌ Initial WebSocket connection failed:", error);
        console.log("🔄 Retrying with fallback host...");
        baseUrl = getSyncServerUrl(true);
        fullUrl = `${baseUrl}${storeId}`;
        ws = new ReconnectingWebSocket(fullUrl, [], {
          maxReconnectionDelay: 1000,
          connectionTimeout: 1000,
        });
      }

      const synchronizer = await createWsSynchronizer(store, ws);

      await synchronizer.startSync();

      ws.addEventListener("open", () => {
        console.log("✅ WebSocket connected:", fullUrl);
        synchronizer.load().then(() => synchronizer.save());
      });

      ws.addEventListener("error", (err) => {
        console.error("⚠️ WebSocket error:", err);
      });

      ws.addEventListener("close", () => {
        console.warn("🔌 WebSocket closed. Will attempt to reconnect.");
      });

      return synchronizer;
    },
    [storeId]
  );

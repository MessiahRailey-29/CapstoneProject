// server/src/syncServer.ts
import { Server as HttpServer } from 'http';
import { WebSocketServer } from 'ws';
import { createWsServer } from 'tinybase/synchronizers/synchronizer-ws-server';
import { createMergeableStore } from 'tinybase';
import { createFilePersister } from 'tinybase/persisters/persister-file';
import { ShoppingList } from './models';
import mongoose from 'mongoose';
import * as fs from 'fs';
import * as path from 'path';

const STORAGE_DIR = path.join(process.cwd(), '.storage');

if (!fs.existsSync(STORAGE_DIR)) {
  fs.mkdirSync(STORAGE_DIR, { recursive: true });
  console.log('📁 Created storage directory:', STORAGE_DIR);
}

export const stores = new Map<string, any>();
const persisters = new Map<string, any>();
const mongoSyncTimeouts = new Map<string, NodeJS.Timeout>();

// ✅ Global notifications store (shared by all users)
let globalNotificationsStore: any = null;

// Sync store to MongoDB
async function syncToMongoDB(storeId: string, store: any): Promise<void> {
  if (!storeId.startsWith('shoppingListStore-')) {
    return;
  }

  if (mongoSyncTimeouts.has(storeId)) {
    clearTimeout(mongoSyncTimeouts.get(storeId)!);
  }

  mongoSyncTimeouts.set(storeId, setTimeout(async () => {
    try {
      if (mongoose.connection.readyState !== 1) {
        return;
      }

      const listId = storeId.replace('shoppingListStore-', '');
      
      const data = {
        tables: store.getTables(),
        values: store.getValues(),
      };
      
      const valuesCopy = JSON.stringify(data);
      
      await ShoppingList.findOneAndUpdate(
        { listId },
        { 
          valuesCopy,
          updatedAt: new Date(),
          ...(data.values?.name && { name: data.values.name }),
          ...(data.values?.budget !== undefined && { budget: data.values.budget }),
          ...(data.values?.status && { status: data.values.status }),
        },
        { upsert: true }
      );
      
      console.log('💾 Synced to MongoDB:', { listId, budget: data.values?.budget });
    } catch (error) {
      console.error('❌ Error syncing to MongoDB:', error);
    }
  }, 1000));
}

// ✅ Initialize global notifications store BEFORE any clients connect
async function initializeGlobalNotificationsStore(): Promise<any> {
  if (globalNotificationsStore) {
    console.log('✅ Global notifications store already initialized');
    return persisters.get('globalNotificationsStore');
  }
  
  console.log('🆕 Initializing GLOBAL notifications store on server');
  
  globalNotificationsStore = createMergeableStore();
  const filePath = path.join(STORAGE_DIR, 'globalNotificationsStore.json');
  const persister = createFilePersister(globalNotificationsStore, filePath);
  
  try {
    await persister.load();
    console.log('✅ Loaded existing notifications from file');
    
    // Log what we loaded
    const table = globalNotificationsStore.getTable('notifications');
    const notificationIds = Object.keys(table);
    console.log(`📊 Loaded ${notificationIds.length} notifications from disk`);
  } catch (error) {
    console.log('ℹ️ No existing notifications file, starting fresh');
  }
  
  await persister.startAutoSave();
  console.log('✅ Auto-save enabled for global notifications');
  
  stores.set('globalNotificationsStore', globalNotificationsStore);
  persisters.set('globalNotificationsStore', persister);
  
  // Add listener to log when notifications are added
  globalNotificationsStore.addTablesListener(() => {
    const table = globalNotificationsStore.getTable('notifications');
    const notificationIds = Object.keys(table);
    console.log(`🔔 Global notifications store updated: ${notificationIds.length} total notifications`);
  });
  
  return persister;
}

// Get or create a persistent store
async function getStore(pathId: string): Promise<any> {
  // ✅ Handle global notifications store
  if (pathId === 'globalNotificationsStore') {
    if (!persisters.has(pathId)) {
      await initializeGlobalNotificationsStore();
    }
    return persisters.get(pathId);
  }

  // Handle shopping list stores
  if (persisters.has(pathId)) {
    return persisters.get(pathId);
  }
  
  console.log('🆕 Creating persistent store for:', pathId);
  
  const store = createMergeableStore();
  const filePath = path.join(STORAGE_DIR, `${pathId}.json`);
  const persister = createFilePersister(store, filePath);
  
  try {
    await persister.load();
    console.log('✅ Loaded existing data from file:', pathId);
  } catch (error) {
    console.log('ℹ️ No existing file data for:', pathId);
    
    if (mongoose.connection.readyState === 1 && pathId.startsWith('shoppingListStore-')) {
      const listId = pathId.replace('shoppingListStore-', '');
      const list = await ShoppingList.findOne({ listId });
      
      if (list && list.valuesCopy) {
        try {
          const data = JSON.parse(list.valuesCopy);
          console.log('🔥 Loading initial data from MongoDB:', {
            listId,
            name: data.values?.name,
            budget: data.values?.budget,
          });
          
          if (data.tables) {
            Object.entries(data.tables).forEach(([tableName, table]: [string, any]) => {
              if (table && typeof table === 'object') {
                Object.entries(table).forEach(([rowId, row]: [string, any]) => {
                  if (row && typeof row === 'object') {
                    store.setRow(tableName, rowId, row);
                  }
                });
              }
            });
          }
          if (data.values) {
            Object.entries(data.values).forEach(([key, value]) => {
              store.setValue(key, value as any);
            });
          }
          
          await persister.save();
          console.log('✅ Saved MongoDB data to file:', pathId);
        } catch (e) {
          console.error('❌ Failed to load from MongoDB:', e);
        }
      }
    }
  }
  
  await persister.startAutoSave();
  console.log('✅ Auto-save enabled for:', pathId);
  
  if (mongoose.connection.readyState === 1) {
    store.addValuesListener(() => {
      syncToMongoDB(pathId, store);
    });
    store.addTablesListener(() => {
      syncToMongoDB(pathId, store);
    });
  }
  
  stores.set(pathId, store);
  persisters.set(pathId, persister);
  
  return persister;
}

export async function setupSyncServer(httpServer: HttpServer) {
  // ✅ Initialize global notifications store FIRST
  console.log('🚀 Initializing global notifications store...');
  await initializeGlobalNotificationsStore();
  console.log('✅ Global notifications store ready for connections');
  
  const wss = new WebSocketServer({ 
    noServer: true
  });

  console.log('🔄 TinyBase WebSocket Sync Server with persistence');
  console.log('📁 Storage directory:', STORAGE_DIR);

  // Create TinyBase WS server with store factory
  const wsServer = createWsServer(wss, async (pathId: string) => {
    console.log('🔍 Getting store for path:', pathId);
    return await getStore(pathId);
  });

  // Handle upgrade manually
  httpServer.on('upgrade', (request, socket, head) => {
    const url = request.url || '';
    
    console.log('🔌 WebSocket upgrade request for:', url);
    
    if (url.startsWith('/sync/')) {
      wss.handleUpgrade(request, socket, head, (ws) => {
        const storeId = url.replace('/sync/', '').split('?')[0];
        console.log('🔌 Client connecting to store:', storeId);
        
        wss.emit('connection', ws, request);
      });
    } else {
      console.log('❌ Rejected WebSocket connection to:', url);
      socket.destroy();
    }
  });

  wss.on('connection', (ws, req) => {
    const url = req.url || '';
    const storeId = url.replace('/sync/', '').split('?')[0];
    
    console.log('✅ Client connected to store:', storeId);
    
    ws.on('close', () => {
      console.log('👋 Client disconnected from store:', storeId);
    });

    ws.on('error', (error) => {
      console.error('❌ WebSocket error for store', storeId, ':', error);
    });
  });

  return wsServer;
}

// Helper function to get store by list ID
export function getStoreForList(listId: string): any {
  const storeId = `shoppingListStore-${listId}`;
  return stores.get(storeId);
}

// ✅ Get the global notifications store
export function getGlobalNotificationsStore(): any {
  return globalNotificationsStore;
}
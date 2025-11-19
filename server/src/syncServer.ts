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

// Storage directory for persistent data (relative to project root)
const STORAGE_DIR = path.join(process.cwd(), '.storage');

// Ensure storage directory exists
if (!fs.existsSync(STORAGE_DIR)) {
  fs.mkdirSync(STORAGE_DIR, { recursive: true });
  console.log('📁 Created storage directory:', STORAGE_DIR);
}

// Keep track of active stores and persisters
const stores = new Map<string, any>();
const persisters = new Map<string, any>();

// MongoDB sync timeouts (for debouncing)
const mongoSyncTimeouts = new Map<string, NodeJS.Timeout>();

// Sync store to MongoDB
async function syncToMongoDB(storeId: string, store: any): Promise<void> {
  // Only sync shopping list stores
  if (!storeId.startsWith('shoppingListStore-')) {
    return;
  }

  // Clear existing timeout
  if (mongoSyncTimeouts.has(storeId)) {
    clearTimeout(mongoSyncTimeouts.get(storeId)!);
  }

  // Debounce: sync after 1 second of no changes
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

// Get or create a persistent store
async function getStore(pathId: string): Promise<any> {
  if (persisters.has(pathId)) {
    return persisters.get(pathId);
  }
  
  console.log('🆕 Creating persistent store for:', pathId);
  
  // Create mergeable store
  const store = createMergeableStore();
  
  // File path for this store
  const filePath = path.join(STORAGE_DIR, `${pathId}.json`);
  
  // Create file persister
  const persister = createFilePersister(store, filePath);
  
  // Try to load existing data from file
  try {
    await persister.load();
    console.log('✅ Loaded existing data from file:', pathId);
  } catch (error) {
    console.log('ℹ️ No existing file data for:', pathId);
    
    // Try loading from MongoDB as fallback
    if (mongoose.connection.readyState === 1 && pathId.startsWith('shoppingListStore-')) {
      const listId = pathId.replace('shoppingListStore-', '');
      const list = await ShoppingList.findOne({ listId });
      
      if (list && list.valuesCopy) {
        try {
          const data = JSON.parse(list.valuesCopy);
          console.log('📥 Loading initial data from MongoDB:', {
            listId,
            name: data.values?.name,
            budget: data.values?.budget,
          });
          
          // Populate store with MongoDB data
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
          
          // Save to file for next time
          await persister.save();
          console.log('✅ Saved MongoDB data to file:', pathId);
        } catch (e) {
          console.error('❌ Failed to load from MongoDB:', e);
        }
      }
    }
  }
  
  // Start auto-save (saves to file on every change)
  await persister.startAutoSave();
  console.log('✅ Auto-save enabled for:', pathId);
  
  // Also sync to MongoDB on changes (if MongoDB is available)
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
  
  // Return the persister (TinyBase expects this)
  return persister;
}

export function setupSyncServer(httpServer: HttpServer) {
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

  // Handle upgrade manually to capture full path including store ID
  httpServer.on('upgrade', (request, socket, head) => {
    const url = request.url || '';
    
    console.log('🔌 WebSocket upgrade request for:', url);
    
    if (url.startsWith('/sync/')) {
      wss.handleUpgrade(request, socket, head, (ws) => {
        // Extract store ID from URL
        const storeId = url.replace('/sync/', '').split('?')[0];
        console.log('🔌 Client connecting to store:', storeId);
        
        // Let TinyBase handle the connection with the store ID as the path
        wss.emit('connection', ws, request);
      });
    } else {
      console.log('❌ Rejected WebSocket connection to:', url);
      socket.destroy();
    }
  });

  // Optional: Add logging for connections
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
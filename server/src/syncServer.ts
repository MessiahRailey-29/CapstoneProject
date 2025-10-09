// server/src/syncServer.ts
import { Server as HttpServer } from 'http';
import { WebSocketServer } from 'ws';
import { createWsServer } from 'tinybase/synchronizers/synchronizer-ws-server';

export function setupSyncServer(httpServer: HttpServer) {
  const wss = new WebSocketServer({ 
    noServer: true
  });

  console.log('🔄 TinyBase WebSocket Sync Server initialized');

  // Create TinyBase WS server - this handles all the CRDT protocol
  const wsServer = createWsServer(wss);

  // Handle upgrade manually to capture full path including store ID
  httpServer.on('upgrade', (request, socket, head) => {
    const url = request.url || '';
    
    console.log('🔍 WebSocket upgrade request for:', url);
    
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
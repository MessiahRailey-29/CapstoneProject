// server/src/index.ts
import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import dotenv from 'dotenv';
import { connectDB } from './db';
import routes from './routes';
import { setupSyncServer } from './syncServer';

// Load environment variables
dotenv.config();

const app = express();
const httpServer = createServer(app);
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString() 
  });
});

// API Routes
app.use('/api', routes);

// Setup WebSocket sync server for TinyBase
setupSyncServer(httpServer);

// Start server
async function start() {
  try {
    // Try to connect to MongoDB (optional)
    const mongoUri = process.env.MONGODB_URI;
    if (mongoUri) {
      try {
        await connectDB(mongoUri);
        console.log('✅ MongoDB features enabled');
      } catch (error) {
        console.warn('⚠️ MongoDB not available - sync server will still work');
        console.warn('Products API will be disabled');
      }
    } else {
      console.log('ℹ️ No MONGODB_URI set - running in sync-only mode');
    }
    
    // Start HTTP server on all interfaces
    const port = Number(PORT);
    httpServer.listen(port, '0.0.0.0', () => {
      console.log(`🚀 Server running on port ${port}`);
      console.log(`📡 Health: http://localhost:${port}/health`);
      console.log(`📡 Network: http://192.168.1.142:${port}/health`);
      console.log(`🔄 Sync: ws://192.168.1.142:${port}/sync/`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

start();
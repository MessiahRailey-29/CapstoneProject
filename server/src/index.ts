// server/src/index.ts
import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import dotenv from 'dotenv';
import { connectDB } from './db';
import routes from './routes';
import { setupSyncServer } from './syncServer';
import notificationRoutes from './routes/notificationRoutes';
import { startAllNotificationCrons } from './jobs/notificationCronJobs';

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
    timestamp: new Date().toISOString(),
    mongodb: !!process.env.MONGODB_URI,
  });
});

// Test notification endpoint
app.get('/api/notifications/test', (req, res) => {
  res.json({
    success: true,
    message: 'Notification routes are working!',
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use('/api', routes);
app.use('/api/notifications', notificationRoutes);

// Log registered routes
console.log('📝 Registered routes:');
console.log('  - /health');
console.log('  - /api/*');
console.log('  - /api/notifications/*');

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
        
        // 🔔 START CRON JOBS AFTER MONGODB CONNECTION
        startAllNotificationCrons();
        
      } catch (error) {
        console.error('❌ MongoDB connection failed:', error);
        console.warn('⚠️ MongoDB not available - sync server will still work');
        console.warn('⚠️ Notification features will NOT work without MongoDB!');
      }
    } else {
      console.log('ℹ️ No MONGODB_URI set - running in sync-only mode');
      console.warn('⚠️ Notification features require MongoDB!');
    }
    
    // Start HTTP server on all interfaces
    const port = Number(PORT);
    httpServer.listen(port, '0.0.0.0', () => {
      console.log('');
      console.log('🚀 Server running on port', port);
      console.log('📡 Health: http://localhost:' + port + '/health');
      console.log('📡 Network: http://192.168.254.109:' + port + '/health');
      console.log('🔔 Notifications: http://localhost:' + port + '/api/notifications');
      console.log('🔄 Sync: ws://192.168.254.109:' + port + '/sync/');
      console.log('');
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

start();
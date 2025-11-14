// server/src/index.ts
import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

// Load environment variables FIRST
dotenv.config();

const app = express();
const httpServer = createServer(app);
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Add request logging middleware
app.use((req, res, next) => {
  console.log(`📥 ${req.method} ${req.url}`);
  next();
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    mongodb: mongoose.connection.readyState === 1,
    mongodbState: ['disconnected', 'connected', 'connecting', 'disconnecting'][mongoose.connection.readyState],
  });
});

// DB status check
app.get('/api/db-status', (req, res) => {
  res.json({
    connectionState: mongoose.connection.readyState,
    states: {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting'
    },
    currentState: ['disconnected', 'connected', 'connecting', 'disconnecting'][mongoose.connection.readyState]
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

// Import routes with ES modules
console.log('📦 Loading routes...');

// Dynamic imports wrapped in async function
async function loadRoutes() {
  try {
    const { default: routes } = await import('./routes/index.js');
    app.use('/api', routes);
    console.log('✅ Main routes loaded');
  } catch (error) {
    console.error('❌ Failed to load main routes:', error);
  }

  // Load notification routes ONCE
  try {
    const { default: notificationRoutes } = await import('./routes/notificationRoutes.js');
    app.use('/api/notifications', notificationRoutes);
    console.log('✅ Notification routes loaded');
  } catch (error) {
    console.error('❌ Failed to load notification routes:', error);
  }

  try {
    const { setupSyncServer } = await import('./syncServer.js');
    setupSyncServer(httpServer);
    console.log('✅ Sync server loaded');
  } catch (error) {
    console.error('❌ Failed to setup sync server:', error);
  }
}

// Start server
async function start() {
  try {
    // Load all routes first
    await loadRoutes();

    const mongoUri = process.env.MONGODB_URI;
    
    if (mongoUri) {
      console.log('🔌 Connecting to MongoDB...');
      
      try {
        // Connect to MongoDB
        await mongoose.connect(mongoUri);
        console.log('✅ MongoDB connected successfully');
        
        // Start cron jobs ONLY after successful MongoDB connection
        try {
          const { startAllNotificationCrons } = await import('./jobs/notificationCronJobs.js');
          startAllNotificationCrons();
          console.log('✅ Notification cron jobs started');
        } catch (error) {
          console.error('❌ Failed to start cron jobs:', error);
          console.error('Error details:', error);
        }
        
      } catch (error) {
        console.error('❌ MongoDB connection failed:', error);
        console.warn('⚠️ Running without MongoDB features');
        console.error('Connection error details:', error);
      }
    } else {
      console.log('ℹ️ No MONGODB_URI set - running in sync-only mode');
    }

    // Start HTTP server on all interfaces
    const port = Number(PORT);
    httpServer.listen(port, '0.0.0.0', () => {
      console.log('');
      console.log('🚀 ===================================');
      console.log('🚀 Server running successfully!');
      console.log('🚀 ===================================');
      console.log('');
      console.log('📍 Port:', port);
      console.log('📍 Host: 0.0.0.0 (all interfaces)');
      console.log('');
      console.log('🔗 API Endpoints:');
      console.log('   Health:        http://192.168.254.104:' + port + '/health');
      console.log('   DB Status:     http://192.168.254.104:' + port + '/api/db-status');
      console.log('   Notifications: http://192.168.254.104:' + port + '/api/notifications');
      console.log('   Products:      http://192.168.254.104:' + port + '/api/products');
      console.log('   Test:          http://192.168.254.104:' + port + '/api/notifications/test');
      console.log('');
      console.log('🔗 WebSocket:');
      console.log('   Sync:          ws://192.168.254.104:' + port + '/sync/');
      console.log('');
      console.log('💡 Test push notifications:');
      console.log('   curl -X POST http://192.168.254.104:' + port + '/api/notifications/YOUR_USER_ID/test-push');
      console.log('');
      console.log('🐛 Debug info:');
      console.log('   curl http://192.168.254.104:' + port + '/api/notifications/YOUR_USER_ID/debug');
      console.log('');
      console.log('🔄 Manually trigger reminders:');
      console.log('   curl -X POST http://192.168.254.104:' + port + '/api/notifications/admin/trigger-reminders');
      console.log('');
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    console.error('Stack trace:', error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down gracefully...');
  try {
    await mongoose.connection.close();
    console.log('✅ MongoDB connection closed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during shutdown:', error);
    process.exit(1);
  }
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise);
  console.error('Reason:', reason);
});

start();
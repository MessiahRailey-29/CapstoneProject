// server/src/test-notification-routes.ts
// Quick test to verify notification routes work

import express from 'express';

const app = express();
app.use(express.json());

// Test 1: Basic Express works
app.get('/test', (req, res) => {
  res.json({ message: 'Express is working!' });
});

// Test 2: Try to load notification routes
async function loadNotificationRoutes() {
  console.log('🧪 Testing notification routes loading...\n');
  
  // Method 1: Try with .js extension (standard for TS + ES modules)
  console.log('Method 1: Trying import with .js extension...');
  try {
    const { default: routes1 } = await import('./routes/notificationRoutes.js');
    console.log('✅ Method 1 SUCCESS!');
    app.use('/api/notifications', routes1);
    return true;
  } catch (error: any) {
    console.log('❌ Method 1 failed:', error.message);
  }
  
  // Method 2: Try without extension
  console.log('\nMethod 2: Trying import without extension...');
  try {
    const { default: routes2 } = await import('./routes/notificationRoutes');
    console.log('✅ Method 2 SUCCESS!');
    app.use('/api/notifications', routes2);
    return true;
  } catch (error: any) {
    console.log('❌ Method 2 failed:', error.message);
  }
  
  // Method 3: Try CommonJS require
  console.log('\nMethod 3: Trying CommonJS require...');
  try {
    const routes3 = require('./routes/notificationRoutes');
    const router = routes3.default || routes3;
    console.log('✅ Method 3 SUCCESS!');
    app.use('/api/notifications', router);
    return true;
  } catch (error: any) {
    console.log('❌ Method 3 failed:', error.message);
  }
  
  console.log('\n❌ ALL METHODS FAILED!');
  console.log('\n💡 This means:');
  console.log('   1. The file might not exist at: ./routes/notificationRoutes.ts');
  console.log('   2. There might be a syntax error in the file');
  console.log('   3. The export format might be wrong');
  console.log('\n🔍 Check if this file exists:');
  console.log('   server/src/routes/notificationRoutes.ts');
  
  return false;
}

// Start the test server
async function startTestServer() {
  const loaded = await loadNotificationRoutes();
  
  const PORT = 3001;
  app.listen(PORT, '0.0.0.0', () => {
    console.log('\n' + '='.repeat(60));
    console.log('🚀 TEST SERVER RUNNING');
    console.log('='.repeat(60));
    console.log(`\n📍 Server listening on: http://192.168.1.142:${PORT}`);
    console.log('\n🧪 Test these URLs:\n');
    console.log(`   Basic test:        curl http://192.168.1.142:${PORT}/test`);
    
    if (loaded) {
      console.log(`   Notification test: curl http://192.168.1.142:${PORT}/api/notifications/test`);
      console.log('\n✅ If the notification test works here, the problem is in your main server setup!');
    } else {
      console.log('\n❌ Notification routes could not be loaded!');
      console.log('   Check the error messages above for clues.');
    }
    
    console.log('\n' + '='.repeat(60) + '\n');
  });
}

startTestServer().catch(error => {
  console.error('❌ Failed to start test server:', error);
  process.exit(1);
});
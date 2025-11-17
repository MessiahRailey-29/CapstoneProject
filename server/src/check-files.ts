// server/src/check-files.ts
// Check what files actually exist

import { existsSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🔍 FILE SYSTEM CHECK\n');
console.log('='.repeat(60));

// Check current directory
console.log('\n📁 Current directory:', process.cwd());
console.log('📁 Script directory:', __dirname);

// Check if routes directory exists
const routesPath = './src/routes';
const routesPathAlt = './routes';

console.log('\n📂 Checking for routes directory:');
console.log(`   ${routesPath}: ${existsSync(routesPath) ? '✅ EXISTS' : '❌ NOT FOUND'}`);
console.log(`   ${routesPathAlt}: ${existsSync(routesPathAlt) ? '✅ EXISTS' : '❌ NOT FOUND'}`);

// List files in src directory
console.log('\n📄 Files in ./src:');
try {
  const srcFiles = readdirSync('./src');
  srcFiles.forEach(file => {
    console.log(`   - ${file}`);
  });
} catch (error: any) {
  console.log(`   ❌ Error reading ./src: ${error.message}`);
}

// List files in routes directory if it exists
const routesDir = existsSync(routesPathAlt) ? routesPathAlt : (existsSync(routesPath) ? routesPath : null);

if (routesDir) {
  console.log(`\n📄 Files in ${routesDir}:`);
  try {
    const routeFiles = readdirSync(routesDir);
    routeFiles.forEach(file => {
      console.log(`   - ${file}`);
    });
  } catch (error: any) {
    console.log(`   ❌ Error reading ${routesDir}: ${error.message}`);
  }
} else {
  console.log('\n❌ No routes directory found!');
}

// Check for specific notification route files
console.log('\n🎯 Looking for notification route files:');
const possiblePaths = [
  './routes/notificationRoutes.ts',
  './routes/notificationRoutes.js',
  './routes/notification-routes.ts',
  './routes/notification-routes.js',
  './src/routes/notificationRoutes.ts',
  './src/routes/notificationRoutes.js',
  './routes/notifications.ts',
  './routes/notifications.js'
];

possiblePaths.forEach(path => {
  console.log(`   ${path}: ${existsSync(path) ? '✅ FOUND' : '❌ not found'}`);
});

console.log('\n' + '='.repeat(60));
console.log('\n💡 NEXT STEPS:');
console.log('   1. If no notification routes file exists, you need to create it');
console.log('   2. If it exists with a different name, update your imports');
console.log('   3. The file should export a router as default export');
console.log('\n' + '='.repeat(60));
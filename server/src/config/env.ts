// server/src/config/env.ts
import dotenv from 'dotenv';

dotenv.config();

/**
 * Validate required environment variables
 * Throws an error if any required variables are missing
 */
export function validateEnv() {
  const requiredVars = [
    'MONGODB_URI',
    'CLERK_PUBLISHABLE_KEY',
    'CLERK_SECRET_KEY',
  ];

  const missingVars = requiredVars.filter(
    (varName) => !process.env[varName]
  );

  if (missingVars.length > 0) {
    console.error('❌ Missing required environment variables:');
    missingVars.forEach((varName) => {
      console.error(`   - ${varName}`);
    });
    console.error('\n💡 Please check your .env file and ensure all required variables are set.');
    console.error('   See .env.example for reference.\n');
    throw new Error('Missing required environment variables');
  }

  // Warn about optional but recommended variables
  const recommendedVars = ['ADMIN_API_KEY', 'FIREBASE_SERVICE_ACCOUNT'];
  const missingRecommended = recommendedVars.filter(
    (varName) => !process.env[varName] && !process.env[`${varName}_PATH`]
  );

  if (missingRecommended.length > 0) {
    console.warn('⚠️ Missing recommended environment variables:');
    missingRecommended.forEach((varName) => {
      console.warn(`   - ${varName}`);
    });
    console.warn('   Some features may not work without these variables.\n');
  }

  console.log('✅ Environment variables validated');
}

/**
 * Get environment variable with type safety
 */
export function getEnv(key: string, defaultValue?: string): string {
  const value = process.env[key];
  if (!value && defaultValue === undefined) {
    throw new Error(`Environment variable ${key} is not set`);
  }
  return value || defaultValue || '';
}

/**
 * Check if running in production
 */
export function isProduction(): boolean {
  return process.env.NODE_ENV === 'production';
}

/**
 * Check if running in development
 */
export function isDevelopment(): boolean {
  return process.env.NODE_ENV === 'development' || !process.env.NODE_ENV;
}

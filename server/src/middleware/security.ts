// server/src/middleware/security.ts
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import cors from 'cors';
import { Express } from 'express';

/**
 * Configure Helmet for security headers
 * Protects against common web vulnerabilities
 */
export const helmetConfig = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'https:'],
    },
  },
  hsts: {
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: true,
  },
  frameguard: {
    action: 'deny',
  },
  noSniff: true,
  xssFilter: true,
  hidePoweredBy: true,
});

/**
 * Configure CORS
 * In production, replace with your actual client domains
 */
export function configureCors() {
  const allowedOrigins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',')
    : [
        'http://localhost:3000',
        'http://localhost:8081',
        'http://localhost:19006',
        'exp://localhost:8081',
      ];

  return cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, Postman, etc.)
      if (!origin) {
        return callback(null, true);
      }

      // Check if origin is in allowed list or matches Expo development pattern
      if (
        allowedOrigins.includes(origin) ||
        origin.startsWith('exp://') ||
        origin.startsWith('http://localhost') ||
        origin.startsWith('http://127.0.0.1') ||
        (process.env.NODE_ENV === 'development' && origin.includes('192.168'))
      ) {
        callback(null, true);
      } else {
        console.warn(`⚠️ Blocked CORS request from unauthorized origin: ${origin}`);
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-admin-api-key'],
  });
}

/**
 * Rate Limiting Middleware
 * Prevents brute force and DoS attacks
 */
export const generalRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    success: false,
    error: 'Too many requests',
    message: 'Too many requests from this IP, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    console.warn(`⚠️ Rate limit exceeded for IP: ${req.ip}`);
    res.status(429).json({
      success: false,
      error: 'Too many requests',
      message: 'Too many requests from this IP, please try again later.',
    });
  },
});

/**
 * Stricter rate limit for authentication endpoints
 */
export const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit to 10 login attempts per windowMs
  message: {
    success: false,
    error: 'Too many authentication attempts',
    message: 'Too many login attempts, please try again later.',
  },
  skipSuccessfulRequests: true,
});

/**
 * Admin endpoint rate limiting
 */
export const adminRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // Limit admin operations
  message: {
    success: false,
    error: 'Too many admin requests',
    message: 'Admin rate limit exceeded.',
  },
});

/**
 * WebSocket rate limiting (for sync endpoints)
 */
export const wsRateLimit = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 30, // Max 30 sync operations per minute
  message: {
    success: false,
    error: 'Too many sync requests',
    message: 'Sync rate limit exceeded.',
  },
});

/**
 * Apply all security middleware to Express app
 */
export function applySecurityMiddleware(app: Express) {
  // Apply Helmet for security headers
  app.use(helmetConfig);

  // Apply CORS
  app.use(configureCors());

  // Apply general rate limiting
  app.use(generalRateLimit);

  console.log('✅ Security middleware configured');
}

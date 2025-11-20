// server/src/middleware/auth.ts
import { Request, Response, NextFunction } from 'express';

// Extend Express Request type to include userId
declare global {
  namespace Express {
    interface Request {
      userId?: string;
      auth?: {
        userId: string;
      };
    }
  }
}

/**
 * Authorization Middleware
 * Verifies that the authenticated user matches the userId in the request params
 * MUST be used after authenticateUser middleware
 */
export function authorizeUser(req: Request, res: Response, next: NextFunction) {
  const authenticatedUserId = req.userId;
  const requestedUserId = req.params.userId;

  if (!authenticatedUserId) {
    return res.status(401).json({
      success: false,
      error: 'Unauthorized',
      message: 'Authentication required. Please log in.',
    });
  }

  if (requestedUserId && authenticatedUserId !== requestedUserId) {
    console.warn(
      `⚠️ Authorization failed: User ${authenticatedUserId} attempted to access resources for ${requestedUserId}`
    );

    return res.status(403).json({
      success: false,
      error: 'Forbidden',
      message: 'You do not have permission to access this resource.',
    });
  }

  console.log(`✅ Authorized user: ${authenticatedUserId}`);
  next();
}

/**
 * Admin API Key Authentication Middleware
 * Protects admin endpoints with an API key
 */
export function authenticateAdmin(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const apiKey = req.headers['x-admin-api-key'];
  const validApiKey = process.env.ADMIN_API_KEY;

  if (!validApiKey) {
    console.error('❌ ADMIN_API_KEY not configured in environment variables!');
    return res.status(500).json({
      success: false,
      error: 'Server configuration error',
      message: 'Admin API key not configured.',
    });
  }

  if (!apiKey || apiKey !== validApiKey) {
    console.warn(`⚠️ Unauthorized admin access attempt from ${req.ip}`);

    return res.status(403).json({
      success: false,
      error: 'Forbidden',
      message: 'Invalid or missing admin API key.',
    });
  }

  console.log(`✅ Admin authenticated from ${req.ip}`);
  next();
}

/**
 * Optional Authentication Middleware
 * Authenticates if token is present but doesn't require it
 * Useful for endpoints that behave differently for authenticated vs anonymous users
 */
export async function optionalAuth(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    // No token provided, continue without authentication
    return next();
  }


  next();
}

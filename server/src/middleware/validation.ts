// server/src/middleware/validation.ts
import { Request, Response, NextFunction } from 'express';
import { z, ZodSchema } from 'zod';
import mongoSanitize from 'express-mongo-sanitize';

/**
 * Validates request body against a Zod schema
 */
export function validateBody(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const validated = schema.parse(req.body);
      req.body = validated as any; // Replace with validated data
      next();
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          error: 'Validation error',
          message: 'Invalid request data',
          details: error.issues.map((err: any) => ({
            field: err.path.join('.'),
            message: err.message,
          })),
        });
      }

      return res.status(400).json({
        success: false,
        error: 'Validation error',
        message: 'Invalid request data',
      });
    }
  };
}

/**
 * Validates request params against a Zod schema
 */
export function validateParams(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const validated = schema.parse(req.params);
      req.params = validated as any;
      next();
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          error: 'Validation error',
          message: 'Invalid URL parameters',
          details: error.issues.map((err: any) => ({
            field: err.path.join('.'),
            message: err.message,
          })),
        });
      }

      return res.status(400).json({
        success: false,
        error: 'Validation error',
        message: 'Invalid URL parameters',
      });
    }
  };
}

/**
 * Validates request query against a Zod schema
 */
export function validateQuery(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const validated = schema.parse(req.query);
      req.query = validated as any;
      next();
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          error: 'Validation error',
          message: 'Invalid query parameters',
          details: error.issues.map((err: any) => ({
            field: err.path.join('.'),
            message: err.message,
          })),
        });
      }

      return res.status(400).json({
        success: false,
        error: 'Validation error',
        message: 'Invalid query parameters',
      });
    }
  };
}

// =========================
// Common Validation Schemas
// =========================

export const userIdSchema = z.object({
  userId: z.string().min(1, 'User ID is required').max(100),
});

export const listIdSchema = z.object({
  listId: z.string().min(1, 'List ID is required').max(100),
});

export const notificationIdSchema = z.object({
  notificationId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid notification ID'),
});

export const pushTokenSchema = z.object({
  pushToken: z.string().min(1, 'Push token is required'),
});

export const scheduleReminderSchema = z.object({
  listId: z.string().min(1),
  listName: z.string().min(1).max(200),
  emoji: z.string().max(10).optional(),
  scheduledDate: z.string().datetime(),
});

export const duplicateWarningSchema = z.object({
  productName: z.string().min(1).max(200),
  listId: z.string().min(1),
});

export const trackPurchaseSchema = z.object({
  productId: z.string().min(1),
  productName: z.string().min(1).max(200),
});

export const sharedListUpdateSchema = z.object({
  listId: z.string().min(1),
  listName: z.string().min(1).max(200),
  emoji: z.string().max(10).optional(),
  message: z.string().min(1).max(500),
  action: z.string().min(1).max(50),
  itemName: z.string().max(200).optional(),
  updatedBy: z.string().min(1).max(100),
});

export const notificationSettingsUpdateSchema = z.object({
  enabled: z.boolean().optional(),
  preferences: z.object({
    shoppingReminders: z.boolean().optional(),
    lowStockAlerts: z.boolean().optional(),
    duplicateWarnings: z.boolean().optional(),
    priceDrops: z.boolean().optional(),
    sharedListUpdates: z.boolean().optional(),
  }).optional(),
  reminderTiming: z.object({
    hoursBefore: z.number().min(0).max(168).optional(), // Max 1 week
    daysOfWeek: z.array(z.number().min(0).max(6)).optional(),
  }).optional(),
  lowStockThreshold: z.object({
    daysAfterLastPurchase: z.number().min(1).max(365).optional(),
  }).optional(),
}).strict();

export const productIdSchema = z.object({
  id: z.string().regex(/^\d+$/, 'Product ID must be a number'),
});

export const paginationQuerySchema = z.object({
  limit: z.string().regex(/^\d+$/).optional().default('50'),
  unreadOnly: z.enum(['true', 'false']).optional().default('false'),
});

/**
 * MongoDB Injection Protection Middleware
 * Sanitizes request data to prevent NoSQL injection attacks
 */
export const sanitizeRequest = mongoSanitize({
  replaceWith: '_',
  onSanitize: ({ req, key }) => {
    console.warn(`⚠️ Sanitized potentially malicious data in request: ${key}`);
  },
});

/**
 * Request Size Limit Middleware
 * Prevents large payload attacks
 */
export function validateRequestSize(maxSizeKb: number = 100) {
  return (req: Request, res: Response, next: NextFunction) => {
    const contentLength = req.headers['content-length'];

    if (contentLength && parseInt(contentLength) > maxSizeKb * 1024) {
      return res.status(413).json({
        success: false,
        error: 'Payload too large',
        message: `Request body must be less than ${maxSizeKb}KB`,
      });
    }

    next();
  };
}

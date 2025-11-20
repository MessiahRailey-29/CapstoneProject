# Security Implementation Guide

This document describes the security improvements implemented in the backend/server.

## Table of Contents

1. [Overview](#overview)
2. [Security Features Implemented](#security-features-implemented)
3. [Environment Setup](#environment-setup)
4. [Authentication & Authorization](#authentication--authorization)
5. [API Security](#api-security)
6. [Testing](#testing)
7. [Deployment Checklist](#deployment-checklist)

## Overview

The backend now includes comprehensive security measures to protect against common vulnerabilities:

- ✅ Authentication (Clerk JWT verification)
- ✅ Authorization (user access control)
- ✅ Input validation (Zod schemas)
- ✅ Rate limiting (DoS protection)
- ✅ Security headers (Helmet.js)
- ✅ CORS configuration
- ✅ NoSQL injection protection
- ✅ Admin endpoint protection

## Security Features Implemented

### 1. Authentication Middleware

**Location:** `src/middleware/auth.ts`

#### Clerk JWT Authentication

All protected endpoints now require a valid Clerk session token:

```typescript
// Middleware validates JWT from Authorization header
authenticateUser
```

**How to use:**
```bash
# Include Authorization header in all API requests
curl -H "Authorization: Bearer YOUR_CLERK_TOKEN" \
  http://localhost:3000/api/lists/user_123
```

#### Authorization Checks

Ensures users can only access their own data:

```typescript
// Verifies userId in URL matches authenticated user
authorizeUser
```

### 2. Input Validation

**Location:** `src/middleware/validation.ts`

Uses Zod schemas to validate all user input:

- User IDs
- Notification settings
- Push tokens
- Shopping reminders
- Product data

**Example:**
```typescript
// Validates userId parameter
validateParams(userIdSchema)

// Validates request body
validateBody(scheduleReminderSchema)
```

### 3. Security Headers

**Location:** `src/middleware/security.ts`

Helmet.js adds security headers:

- Content Security Policy (CSP)
- HTTP Strict Transport Security (HSTS)
- X-Frame-Options (clickjacking protection)
- X-Content-Type-Options (MIME sniffing protection)
- XSS Filter

### 4. Rate Limiting

**Protection levels:**

- **General endpoints:** 100 requests / 15 minutes
- **Auth endpoints:** 10 requests / 15 minutes
- **Admin endpoints:** 10 requests / hour
- **WebSocket sync:** 30 requests / minute

### 5. CORS Configuration

**Development:** Allows localhost and local IP addresses
**Production:** Configure `ALLOWED_ORIGINS` environment variable

```env
ALLOWED_ORIGINS=https://yourapp.com,https://api.yourapp.com
```

### 6. NoSQL Injection Protection

MongoDB sanitization middleware removes malicious operators:

```typescript
// Blocks attempts like: { userId: { "$ne": null } }
sanitizeRequest
```

### 7. Admin Endpoint Protection

**Location:** Admin routes require API key

```bash
# Admin endpoints require x-admin-api-key header
curl -X POST \
  -H "x-admin-api-key: your-admin-key" \
  http://localhost:3000/api/notifications/admin/trigger-reminders
```

## Environment Setup

### Required Environment Variables

Copy `.env.example` to `.env` and configure:

```env
# MongoDB
MONGODB_URI=mongodb://localhost:27017/shopping-app

# Clerk Authentication
CLERK_PUBLISHABLE_KEY=pk_test_xxxxx
CLERK_SECRET_KEY=sk_test_xxxxx

# Admin API Key (generate with: openssl rand -hex 32)
ADMIN_API_KEY=your-secure-random-key

# Firebase (optional, for push notifications)
FIREBASE_SERVICE_ACCOUNT='{"type":"service_account",...}'
```

### Generate Secure Admin API Key

```bash
# On Linux/Mac
openssl rand -hex 32

# On Windows (PowerShell)
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | % {[char]$_})
```

## Authentication & Authorization

### Protected Endpoints

All user-specific endpoints are now protected:

#### Shopping Lists
- `GET /api/lists/:userId` - Requires auth + ownership
- `GET /api/lists/:userId/:listId` - Requires auth + ownership
- `POST /api/lists` - Requires auth
- `PUT /api/lists/:listId` - Requires auth
- `DELETE /api/lists/:listId` - Requires auth

#### Notifications
- `GET /api/notifications/:userId` - Requires auth + ownership
- `GET /api/notifications/:userId/settings` - Requires auth + ownership
- `PUT /api/notifications/:userId/settings` - Requires auth + ownership
- `POST /api/notifications/:userId/push-token` - Requires auth + ownership
- `POST /api/notifications/:userId/schedule-reminder` - Requires auth + ownership
- All other user-specific notification endpoints - Requires auth + ownership

#### Admin Endpoints
- `POST /api/notifications/admin/trigger-reminders` - Requires admin API key

### Public Endpoints

These endpoints don't require authentication:

- `GET /health` - Health check
- `GET /api/db-status` - Database status
- `GET /api/products` - Product list (optional auth)
- `GET /api/products/:id` - Product details
- `GET /api/products/:id/prices` - Product prices

## API Security

### Request Format

All authenticated requests must include:

```javascript
fetch('http://localhost:3000/api/lists/user_123', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${clerkToken}`,
    'Content-Type': 'application/json'
  }
})
```

### Response Format

**Success:**
```json
{
  "success": true,
  "data": {...}
}
```

**Error:**
```json
{
  "success": false,
  "error": "Unauthorized",
  "message": "Missing or invalid authorization header"
}
```

**Validation Error:**
```json
{
  "success": false,
  "error": "Validation error",
  "message": "Invalid request data",
  "details": [
    {
      "field": "pushToken",
      "message": "Push token is required"
    }
  ]
}
```

## Testing

### Test Authentication

```bash
# 1. Get a Clerk token from your app
# 2. Test with curl
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3000/api/notifications/YOUR_USER_ID

# Expected: 200 OK with your notifications
# Without token: 401 Unauthorized
```

### Test Authorization

```bash
# Try to access another user's data
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3000/api/notifications/DIFFERENT_USER_ID

# Expected: 403 Forbidden
```

### Test Rate Limiting

```bash
# Make 100+ requests quickly
for i in {1..101}; do
  curl http://localhost:3000/health
done

# After 100 requests: 429 Too Many Requests
```

### Test Admin Endpoint

```bash
# Without API key
curl -X POST http://localhost:3000/api/notifications/admin/trigger-reminders
# Expected: 403 Forbidden

# With API key
curl -X POST \
  -H "x-admin-api-key: your-admin-key" \
  http://localhost:3000/api/notifications/admin/trigger-reminders
# Expected: 200 OK
```

## Deployment Checklist

Before deploying to production:

### 1. Environment Variables

- [ ] Set `NODE_ENV=production`
- [ ] Configure `MONGODB_URI` with production database
- [ ] Set Clerk production keys
- [ ] Generate strong `ADMIN_API_KEY`
- [ ] Configure `ALLOWED_ORIGINS` with production URLs
- [ ] Set `FIREBASE_SERVICE_ACCOUNT` if using push notifications

### 2. Security Configuration

- [ ] Enable HTTPS (required for production)
- [ ] Review CORS allowed origins
- [ ] Adjust rate limits if needed
- [ ] Review and test all authentication flows
- [ ] Ensure admin API key is secure and rotated regularly

### 3. Monitoring

- [ ] Set up logging for security events
- [ ] Monitor rate limit violations
- [ ] Track authentication failures
- [ ] Set up alerts for suspicious activity

### 4. Testing

- [ ] Test all protected endpoints
- [ ] Verify authorization checks work
- [ ] Test rate limiting
- [ ] Verify CORS configuration
- [ ] Test error handling

## Security Best Practices

1. **Never commit .env files** - They contain sensitive credentials
2. **Rotate API keys regularly** - Especially admin keys
3. **Monitor logs** - Watch for suspicious patterns
4. **Keep dependencies updated** - Run `npm audit` regularly
5. **Use HTTPS in production** - Required for secure token transmission
6. **Validate all input** - Never trust user input
7. **Follow principle of least privilege** - Grant minimal access needed

## Vulnerability Remediation

### Before (Critical Issues)

❌ No authentication - anyone can access any user's data
❌ No authorization checks
❌ No input validation
❌ No rate limiting
❌ CORS allows all origins
❌ No admin endpoint protection
❌ Vulnerable to NoSQL injection

### After (Secured)

✅ Clerk JWT authentication on all user endpoints
✅ Authorization checks verify ownership
✅ Zod schema validation on all inputs
✅ Rate limiting prevents abuse
✅ CORS configured for specific origins
✅ Admin endpoints protected with API key
✅ MongoDB sanitization prevents injection

## Support

If you encounter security issues:

1. Check the logs for detailed error messages
2. Verify your environment variables are correct
3. Ensure your Clerk tokens are valid
4. Review this documentation

For questions or issues, refer to:
- Clerk docs: https://clerk.com/docs
- Express security: https://expressjs.com/en/advanced/best-practice-security.html
- OWASP Top 10: https://owasp.org/www-project-top-ten/

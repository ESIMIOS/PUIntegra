# Cloud Functions — HTTP Endpoints Spec

## Status: draft

## Base URL
Production:     https://<region>-<project-id>.cloudfunctions.net
Local emulator: http://localhost:5001/<project-id>/<region>

## Router
Hono — all HTTP functions routed through packages/api/src/functions/app.ts

## Authentication
All endpoints require a valid Firebase Auth ID token:
  Authorization: Bearer <idToken>

Middleware: packages/api/src/middleware/auth.ts validates token before handler.

## Endpoints

### POST /api/users/role
- Purpose: Update user role (admin only)
- Auth: Required — admin role
- Request body: { userId: string, role: 'admin' | 'member' | 'viewer' }
- Response: { success: true } | { error: string }
- Zod schema: RoleUpdateSchema (to be created in packages/shared)
- Status: planned

## Conventions
- All request/response bodies validated with Zod schemas from packages/shared
- Errors return { error: string, code: string } with appropriate HTTP status
- No business logic in route handlers — delegate to packages/api/src/services/

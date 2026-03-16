# api — Agent Context

Cloud Functions for Firebase. Router: Hono. All data access goes through
services/ — never call Firestore directly from route handlers.

## Rules specific to this package
- Import types exclusively from @puintegra/shared
- Validate all incoming data with Zod schemas before any logic runs
- Firestore access only through src/services/ — never in handlers directly
- All functions must be tested with Firebase Emulator, never real Firebase
- Auth validation happens in src/middleware/auth.ts — nowhere else

NEVER generate Firebase security rules. Flag and stop.
NEVER call Firestore or Auth Admin SDK outside of src/services/.

## Why

The web application currently relies on a runtime mock layer for authentication, session context, and domain data, which makes the app depend on implementation details that must be removed before production integration. This change replaces that mock runtime with a Firebase Emulator-backed foundation so local development exercises the same architecture intended for production.

## What Changes

- **BREAKING**: Remove all runtime mock modules, mock stores, mock composables, mock exports, and mock-specific UI/system error contracts from `packages/web`.
- Add Firebase client initialization in `packages/web` for Auth and Firestore Emulator usage in development.
- Use Firebase Auth Emulator with email/password as the first authentication flow.
- Defer MFA until real Firebase environment rollout.
- Use Firestore Emulator for domain data currently held by the mock dataset.
- Add API service structure in `packages/api` for emulator-backed Hono/Firebase Functions routes where server-side orchestration is needed.
- Add emulator seed scripts for Auth and Firestore using the existing domain records as the source dataset.
- Refactor web stores, route guards, auth pages, and data controllers to use Firebase-backed gateways instead of mock services.
- Update live specs to state that mock mode is removed, not moved.

## Capabilities

### New Capabilities

- `firebase-emulator-foundation`: Covers Firebase Auth Emulator login/logout/hydration, Firestore Emulator domain data access, seed data, and removal of the web mock runtime.

### Modified Capabilities

- None.

## Impact

- Affected web areas: auth store, auth/session composables, route guards, bootstrap runtime, auth pages, data stores/controllers, `bom.ts`, development panel behavior, tests, and system message mapping.
- Affected API areas: Firebase Functions/Hono entrypoint, services, emulator seed scripts, and tests.
- Shared Zod schemas affected: none initially. Existing `UserSchema`, `PermissionSchema`, `InstitutionSchema`, `ContactSchema`, `RequestSchema`, `FindingSchema`, and `LogSchema` are sufficient for first implementation. If request/response envelope schemas become necessary, implementation must stop and request approval before modifying `packages/shared/src/schemas/`.
- Firebase security rules affected: no.
- Firebase Auth production configuration affected: no.
- Firebase Auth Emulator is used locally; MFA is explicitly out of scope for this change.

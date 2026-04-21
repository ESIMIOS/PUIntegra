## 1. OpenSpec And Contracts

- [x] 1.1 Create the Firebase emulator foundation OpenSpec change.
- [x] 1.2 Confirm existing shared schemas are sufficient for first implementation and do not edit shared schemas.
- [x] 1.3 Update live specs after implementation to describe Firebase emulator mode and removal of mock runtime.

## 2. Firebase Dependencies And Configuration

- [x] 2.1 Add Firebase web dependency to `@puintegra/web` using pnpm.
- [x] 2.2 Add emulator-aware Firebase client initialization for Auth and Firestore.
- [x] 2.3 Document public `VITE_FIREBASE_*` variables without reading or editing real `.env` files.

## 3. Emulator Seed And API Foundation

- [x] 3.1 Move deterministic seed data out of `packages/web/src/mock` into emulator seed modules/scripts.
- [x] 3.2 Add Auth Emulator seed script for local email/password users.
- [x] 3.3 Add Firestore Emulator seed script for institutions, permissions, contacts, requests, and findings.
- [x] 3.4 Add `packages/api` Hono/Firebase Functions structure for emulator-backed health/session/data routes where needed.
- [x] 3.5 Add authenticated Firestore Emulator read rules for seeded domain collections while keeping client writes denied.
- [x] 3.6 Replace Auth Emulator password environment variable with deterministic local-only seed data.
- [x] 3.7 Add Auth onCreate trigger to create `users/{uid}` and account creation logs.
- [x] 3.8 Add authenticated API routes for login/logout audit logs.
- [x] 3.9 Add structured error logging and safe HTTP error responses for Auth audit failures.
- [x] 3.10 Fix shared ESM build output so API runtime can import shared contracts in Node.
- [x] 3.11 Move Firebase function implementations into `packages/api/src/functions`.
- [x] 3.12 Generate log IDs server-side and correlate Auth logs with event/execution trace IDs.
- [x] 3.13 Remove direct seed entry `log-001`; Auth/API functions own account logs.
- [x] 3.14 Add shared API response envelope and apply it to current API routes.

## 4. Web Auth Migration

- [x] 4.1 Replace mock auth store dependencies with Firebase Auth client operations.
- [x] 4.2 Refactor login, logout, session hydration, and context switching to use Firebase-backed app session state.
- [x] 4.3 Replace mock auth/data error mapping with neutral app auth/data error mapping.
- [x] 4.4 Preserve route guard semantics for anonymous, institutional, system, and error routes.
- [x] 4.5 Preserve post-auth profile resolution errors instead of mapping them to invalid credentials.
- [x] 4.6 Avoid duplicate startup hydration and skip Firebase hydration for public non-auth routes.
- [x] 4.7 Render login before existing-session hydration and redirect authenticated sessions in the background.
- [x] 4.8 Report successful session establishment and logout to the API audit routes.
- [x] 4.9 Proxy `/api` requests from Vite dev server to the Functions Emulator.

## 5. Web Data Migration

- [x] 5.1 Replace mock data store/controllers with Firestore-backed neutral gateways.
- [x] 5.2 Validate all Firestore records with shared Zod schemas before writing Pinia state.
- [x] 5.3 Preserve current read/mutation behavior for account, institution, permissions, contacts, dashboard, requests, findings, and logs where implemented.

## 6. Remove Mock Runtime

- [x] 6.1 Remove `packages/web/src/mock`.
- [x] 6.2 Remove `MockSessionSwitcher`, `useMockSession`, `useMockDataStore`, `useMockDataControllers`, mock exports, and `MOCK_*` app-facing constants.
- [x] 6.3 Delete or replace mock-specific tests.

## 7. Tests And Gates

- [x] 7.1 Add Firebase Auth/session tests.
- [x] 7.2 Add Firestore data gateway tests.
- [x] 7.3 Add API/emulator seed tests where practical.
- [x] 7.4 Run package gates for shared, api, and web.
- [x] 7.5 Run monorepo typecheck, lint, and test gates.

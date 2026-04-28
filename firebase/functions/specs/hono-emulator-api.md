# Hono Functions Emulator API (Live Spec)

## Purpose

Define the local Cloud Functions + Hono foundation for PUIntegra API development.

## Scope

- Firebase Functions Emulator entrypoint exported by `packages/api/src/index.ts`.
- Hono router used for HTTP route composition.
- Emulator-only health endpoint and future server-side domain operations.

## Contract

- The API package exposes a Firebase `onRequest` function named `api`.
- Function implementations live under `packages/api/src/functions/`; `packages/api/src/index.ts` only re-exports deployed functions.
- Hono owns route definitions and response formatting.
- Server-side domain mutations must validate inputs with shared Zod schemas before service logic.
- Operations that require audit logs or production parity should be implemented in `packages/api`, not in web stores.
- Firebase Auth login and logout are application events, not Firebase Auth triggers. The web app reports them to the API with only the current Firebase ID token.
- Account-level Auth logs must use `RFC: null`.
- Log document IDs must be generated server-side from Firestore document refs and copied into the log payload `id`.
- Auth HTTP event logs must set `originTraceId` from an available execution/trace header (`function-execution-id`, `x-cloud-trace-context`, `x-request-id`) or a server-generated fallback.
- HTTP route failures must be logged through Firebase Functions structured logging and returned to callers as safe JSON without internal exception details.
- HTTP responses must use the shared API response envelope from `ApiResponseSchema`.
- API errors must include stable machine codes and may include `uiMessageKey`, `uiMessageParams`, and safe `displayMessage` when server-owned policy or timing needs user-facing fallback copy.

## Current endpoints

- `GET /health` returns `{ "ok": true, "data": { "service": "puintegra-api" } }`.
- `POST /api/auth/events/login` verifies a Firebase bearer token and writes a `USER_ACCOUNT_LOGIN` account-level log.
- `POST /api/auth/events/logout` verifies a Firebase bearer token and writes a `USER_ACCOUNT_LOGOUT` account-level log.
- `POST /api/admin/institutions` verifies a Firebase bearer token, authorizes only `SYSTEM_ADMINISTRATOR`, validates onboarding payload, rejects reserved RFCs (`SYSTEM_RFC`, `DEFAULT_RFC`), and writes institution + bootstrap permission + `INSTITUTION_CREATION`, `INSTITUTION_PERMISSION_CREATION`, and `INSTITUTION_PLAN_CREATION` audit logs.
- `PATCH /api/admin/institutions/:rfc/plan` verifies a Firebase bearer token, authorizes only `SYSTEM_ADMINISTRATOR`, validates plan update payload, rejects reserved RFCs (`SYSTEM_RFC`, `DEFAULT_RFC`), updates the tenant plan fields and institution update history, and writes an `INSTITUTION_PLAN_UPDATE` audit log.

## Current trigger

- `createUserProfile` runs on Firebase Auth `onCreate`, creates `users/{uid}`, and writes a `USER_ACCOUNT_CREATION` log.
- `createUserProfile` failures are logged with sanitized Auth context and rethrown so the Functions runtime marks the invocation as failed.

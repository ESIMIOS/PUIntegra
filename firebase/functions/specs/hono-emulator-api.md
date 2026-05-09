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
- Protected auth and RFC-scoped mutation routes use Firestore-backed distributed throttling with endpoint runtime config from `apiThrottleConfigs`, fixed-window counters in `apiThrottleCounters`, and simple per-field dimension enforcement.
- Over-quota throttle responses return HTTP `422` with a generic machine code and only safe metadata (`endpointKey`, `dimensionKey`, `maxRequests`, `windowMs`, `retryAfterSeconds`).

## Current endpoints

- `GET /health` returns `{ "ok": true, "data": { "service": "puintegra-api" } }`.
- `POST /api/auth/events/login` verifies a Firebase bearer token, enforces distributed auth-event throttling (`ip`, `user`), and writes a `USER_ACCOUNT_LOGIN` account-level log.
- `POST /api/auth/events/logout` verifies a Firebase bearer token, enforces distributed auth-event throttling (`ip`, `user`), and writes a `USER_ACCOUNT_LOGOUT` account-level log.
- `POST /api/auth/lifecycle/account-creation-policy` validates normalized email registration eligibility without creating Firebase Auth users and enforces distributed throttling (`ip`, `email`).
- `POST /api/auth/lifecycle/password-recovery` applies public recovery abuse controls, enforces distributed throttling (`ip`, `email`), and returns neutral recovery copy without exposing account existence.
- `POST /api/auth/lifecycle/password-reset-completed`, `POST /api/auth/lifecycle/email-verification-completed`, and `POST /api/auth/lifecycle/mfa-enrollment-completed` enforce distributed throttling with whatever simple subjects are present on the request (`ip`, `user`, `email`) and record sanitized account-level lifecycle logs.
- `POST /api/admin/institutions` verifies a Firebase bearer token, authorizes only `SYSTEM_ADMINISTRATOR`, validates onboarding payload, rejects reserved RFCs (`SYSTEM_RFC`, `DEFAULT_RFC`), and writes institution + bootstrap permission + `INSTITUTION_CREATION`, `INSTITUTION_PERMISSION_CREATION`, and `INSTITUTION_PLAN_CREATION` audit logs.
- `PATCH /api/admin/institutions/:rfc/plan` verifies a Firebase bearer token, authorizes only `SYSTEM_ADMINISTRATOR`, validates plan update payload, rejects reserved RFCs (`SYSTEM_RFC`, `DEFAULT_RFC`), enforces distributed throttling (`ip`, `user`, `rfc`), updates the tenant plan fields and institution update history, and writes an `INSTITUTION_PLAN_UPDATE` audit log.
- `POST /api/admin/users/:userId/mfa-reset` verifies a Firebase bearer token, authorizes only `SYSTEM_ADMINISTRATOR`, enforces distributed throttling (`ip`, `user`, `target_user`), clears the user's Firebase MFA enrollment through Admin SDK, and writes a sanitized `USER_ACCOUNT_MFA_UNENROLL` account-level log.
- `PATCH /api/account/profile` verifies a Firebase bearer token, enforces distributed throttling (`ip`, `user`), updates authenticated user profile fields (`name`, `emojiIcon`, `phone`), synchronizes Firebase Auth `displayName` when `name` changes, appends `users/{uid}.updates` history including phone deltas, and writes a `USER_ACCOUNT_SETTINGS_UPDATE` account-level log.
- `PUT /api/app/institutions/:rfc/contacts/:type` verifies a Firebase bearer token, requires an `INSTITUTION_ADMIN` permission granted for the same `RFC`, enforces distributed throttling (`ip`, `user`, `rfc`, `contact_type`), upserts exactly one canonical contact record for each supported type (`LEGAL`, `TECHNICAL`, `IMMEDIATE_SEARCH`), and writes `INSTITUTION_CONTACT_CREATION` or `INSTITUTION_CONTACT_UPDATE`.
- `PUT /api/app/institutions/:rfc/shared-secret` verifies a Firebase bearer token, requires an `INSTITUTION_ADMIN` permission granted for the same `RFC`, enforces distributed throttling (`ip`, `user`, `rfc`), computes SHA256 of the raw submitted secret, encrypts the raw value with a per-institution HKDF-derived key and AES-256-GCM, stores encrypted payload metadata in `institutions.sharedSecret`, stores the digest in `institutions.SHA256SharedSecret`, appends institution update history deltas for SHA256 fields, and writes `INSTITUTION_SHARED_SECRET_UPDATE`.
- `POST /api/app/institutions/:rfc/permissions` verifies a Firebase bearer token, requires an `INSTITUTION_ADMIN` permission granted for the same `RFC`, enforces distributed throttling (`ip`, `user`, `rfc`, `target_email`), creates invitation-by-email permissions with deterministic IDs (`<normalizedEmail>__<normalizedRfc>`), rejects duplicates, and writes `INSTITUTION_PERMISSION_CREATION`.
- `PATCH /api/app/institutions/:rfc/permissions/:permissionId` verifies a Firebase bearer token, requires an `INSTITUTION_ADMIN` permission granted for the same `RFC`, enforces distributed throttling (`ip`, `user`, `rfc`, `permission`), updates only permission `role` and `status`, appends permission history, and writes `INSTITUTION_PERMISSION_UPDATE`.

## Current trigger

- `createUserProfile` runs on Firebase Auth `onCreate`, creates `users/{uid}`, and writes a `USER_ACCOUNT_CREATION` log.
- `createUserProfile` failures are logged with sanitized Auth context and rethrown so the Functions runtime marks the invocation as failed.

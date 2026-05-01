## Why

PUIntegra has Firebase-backed login, permission-based context selection, and placeholder auth routes, but it does not yet provide a complete professional-grade lifecycle for self-registration, email verification, password recovery, password reset, or TOTP setup. Institutions need these flows to be usable, auditable, abuse-resistant, and aligned with Firebase Auth rather than custom credential handling.

## What Changes

- Replace `/auth/create-account`, `/auth/verify-email`, `/auth/forgot-password`, `/auth/reset-password`, and `/auth/security-setup` placeholders with operational auth lifecycle pages.
- Gate account creation by existing granted permissions so only invited or authorized email addresses can create Firebase Auth accounts.
- Require Firebase email verification before a user can enter PUIntegra protected domains or resolve granted application contexts.
- Use Firebase email action handlers for verification and password reset completion while keeping PUIntegra-owned UX.
- Provide neutral password recovery responses that do not reveal whether an email exists, is invited, verified, disabled, or already registered.
- Add layered abuse controls for account creation, verification resend, password recovery, password reset, and TOTP setup attempts.
- Add TOTP MFA enrollment and sign-in handling only behind explicit Firebase Auth MFA/Identity Platform approval; each user may have only one TOTP factor, and lost authenticator access requires admin-assisted reset.
- Add professional, friendly auth UI guidance with clear Spanish instructions, contextual help, recovery paths, and non-alarming security copy.
- Add audit logging for auth lifecycle events and suspicious throttling without logging secrets or action codes.

## Capabilities

### New Capabilities

- `auth-account-lifecycle`: Public and authenticated auth lifecycle behavior for permission-gated account creation, email verification, password recovery, password reset, TOTP setup, abuse controls, and auditability.

### Modified Capabilities

- `api-domain-write-boundary`: Auth lifecycle operations that require server-owned policy, abuse throttling, or audit logging must go through authenticated or public HTTP API endpoints instead of direct client-only writes.

## Impact

- Shared schemas: no direct changes expected; `PermissionSchema` already supports email-based grants and optional `userId`, `UserSchema` already supports the Auth-created domain profile, `LogSchema` already supports account-level audit logs, and API responses can use `ApiResponseSchema`.
- Web: auth pages, Firebase Auth gateway, route guards, auth store/session handling, navigation catalog copy, page tests, gateway tests, and guard tests.
- API: server-owned abuse controls, safe public/auth lifecycle endpoints where needed, admin-assisted MFA reset policy endpoints, audit log writes, structured error responses, and API tests.
- Firebase Auth: email/password remains the provider; email templates must point to PUIntegra custom action routes; App Check and TOTP MFA enforcement require explicit approval before production configuration changes.
- Firebase security rules: no Firestore rules changes are planned for the auth page implementation; if implementation discovers a Firestore access-policy change, stop and request explicit approval before editing `firebase/firestore/firestore.rules`.
- Specs: add the new OpenSpec capability and update permanent live specs for web auth behavior, Firebase Auth behavior, and API write/audit boundaries as implementation tasks.

# Firebase Emulator Mode (Live Spec)

## Purpose

Define the local development contract for `packages/web` after removing the frontend runtime backend simulation.

## Scope

- Applies to Firebase client initialization in `packages/web`.
- Applies to Auth Emulator login, logout, auth-state hydration, and app context selection.
- Applies to Firestore Emulator reads and writes through neutral gateways.
- Does not define production Firebase Auth providers, MFA, blocking functions, or Firestore security rules.

## Firebase client runtime

- `packages/web/src/plugins/firebase.ts` owns singleton Firebase app, Auth, and Firestore instances.
- Public Vite variables use the `VITE_FIREBASE_*` prefix and contain no secrets.
- Development and test runtimes connect to:
  - Auth Emulator: `VITE_FIREBASE_AUTH_EMULATOR_URL`, default `http://127.0.0.1:9099`
  - Firestore Emulator: `VITE_FIRESTORE_EMULATOR_HOST`, default `127.0.0.1`
  - Firestore Emulator port: `VITE_FIRESTORE_EMULATOR_PORT`, default `8081`
- Production mode must not connect to emulators.

## Auth and session contract

- The first supported local auth flow is Firebase Auth email/password through the Auth Emulator.
- Account creation, email verification, password recovery, and password reset use Firebase Auth SDK primitives plus PUIntegra API policy/audit calls.
- Account settings profile updates (`/account/settings`) use an authenticated API write boundary; the browser does not write Firestore user profile fields directly.
- Account settings name changes synchronize Firebase Auth `displayName`; phone updates remain Firestore-domain fields in this phase.
- App-domain institution-admin writes (`/app/:rfc/admin/contacts`, `/app/:rfc/admin/settings`, `/app/:rfc/admin/permissions`) use authenticated API routes; the browser keeps Firestore reads for safe fields but does not perform those writes directly.
- Users with unverified Firebase email cannot resolve PUIntegra permission contexts or enter protected domains.
- MFA is deferred for Firebase project configuration and must not be simulated in web runtime.
- TOTP setup pages show a controlled unavailable state when Firebase TOTP MFA is not enabled.
- Each user may have only one active TOTP factor; lost authenticator access requires admin-assisted reset before the user can re-enroll.
- After Firebase sign-in, the app resolves the domain user and granted permissions from Firestore.
- If more than one permission context exists, the user selects an active role/RFC context.
- The active app context is persisted separately from Firebase Auth and validated during hydration.
- Invalid or missing saved context clears local app context and treats the user as not authorized for protected domains.

## Guard constraints

- No Firebase user means anonymous.
- Firebase user without granted permission contexts means authenticated identity but no authorized app context.
- If a route requires authentication and the effective role is `ANONYMOUS`, redirect to `/auth/login`.
- If role is `SYSTEM_ADMINISTRATOR` without `SYSTEM_RFC`, redirect to `/error/403`.
- If role is institutional while using `SYSTEM_RFC`, redirect to `/error/403`.
- `/error/*` routes must not enter redirection loops because of these validations.

## Runtime removal rule

- `packages/web` must not contain runtime backend simulation modules, stores, composables, or app-facing `MOCK_*` contracts.
- Test doubles may use Vitest module mocks at test boundaries, but application code must depend on Firebase/auth/data gateways rather than mock services.

## Out of scope

- Real production Firebase Auth provider rollout.
- MFA.
- Firestore rules changes.
- Production Firebase project configuration changes.

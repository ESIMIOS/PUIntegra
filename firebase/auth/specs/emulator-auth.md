# Firebase Auth Emulator (Live Spec)

## Purpose

Define the local Firebase Auth behavior for PUIntegra development.

## Scope

- Local Firebase Auth Emulator only.
- Email/password provider only for the first Firebase-backed flow.
- Seeded development users created by `packages/api/src/emulator/seedEmulators.ts`.

## Contract

- Web login uses Firebase Auth client SDK against the Auth Emulator in development and test modes.
- Public auth pages use Firebase Auth SDK primitives for email/password account creation, email verification action codes, password reset emails, and password reset confirmation.
- Account creation is preflighted against PUIntegra API policy before the browser calls Firebase Auth user creation.
- Firebase users whose email is not verified cannot establish a PUIntegra application session or resolve granted permission contexts.
- The seeded Auth user UID must match the domain `User.userId` and `Permission.userId` records written to Firestore Emulator.
- The `createUserProfile` Auth `onCreate` trigger creates the Firestore `users/{uid}` profile from the Firebase Auth user and writes a `USER_ACCOUNT_CREATION` log.
- The seeded Auth user password is deterministic local-only data defined by `packages/api/src/emulator/seedData.ts`.
- The current local password is `local-password` and is not treated as a secret.
- TOTP MFA is deferred for production configuration and must not be simulated in web runtime. The web flow may show a controlled unavailable state when Firebase MFA is not enabled.
- PUIntegra policy allows no more than one active TOTP factor per user. If a user loses authenticator access, recovery is admin-assisted and writes `USER_ACCOUNT_MFA_UNENROLL`.
- Production provider policy, MFA policy, blocking functions, and security posture are out of scope for this emulator foundation.

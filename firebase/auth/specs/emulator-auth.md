# Firebase Auth Emulator (Live Spec)

## Purpose

Define the local Firebase Auth behavior for PUIntegra development.

## Scope

- Local Firebase Auth Emulator only.
- Email/password provider only for the first Firebase-backed flow.
- Seeded development users created by `packages/api/src/emulator/seedEmulators.ts`.

## Contract

- Web login uses Firebase Auth client SDK against the Auth Emulator in development and test modes.
- The seeded Auth user UID must match the domain `User.userId` and `Permission.userId` records written to Firestore Emulator.
- The `createUserProfile` Auth `onCreate` trigger creates the Firestore `users/{uid}` profile from the Firebase Auth user and writes a `USER_ACCOUNT_CREATION` log.
- The seeded Auth user password is deterministic local-only data defined by `packages/api/src/emulator/seedData.ts`.
- The current local password is `local-password` and is not treated as a secret.
- MFA is deferred and must not be simulated in web runtime.
- Production provider policy, MFA policy, blocking functions, and security posture are out of scope for this emulator foundation.

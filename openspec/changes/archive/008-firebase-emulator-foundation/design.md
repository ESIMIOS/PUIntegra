## Context

The current frontend contains a complete runtime mock backend under `packages/web/src/mock`. That layer owns local authentication, localStorage persistence, seeded domain data, artificial latency, and typed mock errors. The target architecture is Firebase-first: local development should use Firebase Auth, Firestore, and Functions emulators instead of an in-web backend simulation.

Existing shared schemas are sufficient for first-pass domain data validation. The migration must not modify Firestore rules, production Auth posture, MFA configuration, or shared schemas without separate approval.

## Goals / Non-Goals

**Goals:**

- Remove the web mock runtime completely.
- Authenticate with Firebase Auth Emulator using email/password.
- Resolve app role/RFC context from Firestore-backed `User` and `Permission` records.
- Read domain data from Firestore Emulator through neutral web gateways/stores.
- Seed Auth and Firestore emulators from deterministic local seed data.
- Preserve existing guard semantics for anonymous, institution, and system roles.

**Non-Goals:**

- No production Firebase Auth rollout.
- No MFA implementation.
- No Firebase security rules changes.
- No shared schema changes unless explicitly approved.
- No support for real Firebase projects in the first implementation.

## Decisions

1. Use Firebase client SDK in web for authentication.
   - Rationale: Firebase Auth client persistence, emulator support, and `onAuthStateChanged` directly match the desired local and future production model.

2. Use Firestore Emulator for domain data.
   - Rationale: This removes browser mock persistence and validates Firestore data shapes early while keeping production data untouched.

3. Keep app context separate from Firebase identity.
   - Rationale: Firebase Auth identifies the user; PUIntegra permissions decide active role/RFC. The selected app context remains an app-level state validated against Firestore permissions.

4. Replace mock errors with neutral app errors.
   - Rationale: UI and stores should not know whether an error came from Firebase, API, or another future backend implementation.

5. Seed emulator data from server-side scripts.
   - Rationale: Dev fixtures belong to emulator setup, not browser runtime.

## Risks / Trade-offs

- Emulator-based tests are heavier than pure unit tests. Keep Firebase integration tests focused and keep pure web tests mocking neutral gateways.
- Removing all mock code in one change has broad blast radius. Use tasks and gates to migrate subsystem by subsystem.
- Firestore rules are intentionally not changed, so emulator integration may initially rely on Admin SDK seeding and client reads compatible with current rules only where already allowed.
- Firebase Auth throttling and MFA behavior will differ from the old mock lockout. This is accepted because Firebase owns auth policy.

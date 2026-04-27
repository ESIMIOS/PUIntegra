# Firebase Data Gateway (Live Spec)

## Purpose

Define the local Firestore Emulator-backed data architecture used by `packages/web`.

## Scope

- Firestore reads and writes through `packages/web/src/gateways/firebaseDataGateway.ts`.
- Pinia orchestration through `packages/web/src/stores/dataStore.ts`.
- UI-oriented composables through `packages/web/src/composables/useDataControllers.ts`.
- Emulator seed data produced by `packages/api/src/emulator`.

## Dataset contract

- Seed data lives outside `packages/web` and is written to Firebase emulators.
- Auth Emulator seed users are created by `packages/api/src/emulator/seedEmulators.ts`.
- Firestore Emulator collections currently seeded:
  - `users`
  - `institutions`
  - `permissions`
  - `contacts`
  - `requests`
  - `findings`
  - `logs`
- `SYSTEM_RFC` remains a reserved provider context and is not modeled as a tenant institution document.
- Permissions are tied to Firebase Auth users via `Permission.email`.

## Layer boundaries

- Seed layer: deterministic emulator seed records validated with shared schemas.
- Gateway layer: Firestore access and shared Zod validation before data leaves the gateway.
- Gateway institution reads include both collection reads for institution lists and single-document reads by RFC for admin inspection.
- Store layer: reactive loading, saving, and user-facing error orchestration.
- Controller layer: UI-oriented load/mutate wrappers without artificial backend delay.
- Provider-managed domain writes that require server-side authorization, pre-existence validation, or audit logging (for example institution onboarding) must go through authenticated HTTP API endpoints in `packages/api` rather than direct client Firestore writes.
- Authorized domain reads can remain Firebase SDK-backed where Firestore rules allow them.
- Existing direct client mutation helpers remain transitional for previously implemented MVP flows and are out of scope for the institution-onboarding change unless explicitly migrated in a dedicated change.

## Error handling strategy

- `SystemError` in `packages/shared/src/errors/system-app-error.ts` is the single error class used across the project.
- Shared and web system message catalogs are the source of truth for error codes, keys, and user-safe messages:
  - `packages/shared/src/constants/system-messages.ts`
  - `packages/web/src/shared/constants/systemMessages.ts`
- Firestore payload validation failures must surface as validation errors and include only safe diagnostic metadata.

## Testing expectations

- Route guard and auth UI tests mock the Firebase gateway boundary, not application runtime services.
- Firestore gateway integration tests should use the Firebase Emulator Suite when added.
- API seed tests should validate records with shared schemas and never target a real Firebase project.

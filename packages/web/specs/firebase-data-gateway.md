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
- Permissions are tied to Firebase Auth users via `Permission.userId`.

## Layer boundaries

- Seed layer: deterministic emulator seed records validated with shared schemas.
- Gateway layer: Firestore access and shared Zod validation before data leaves the gateway.
- Store layer: reactive loading, saving, and user-facing error orchestration.
- Controller layer: UI-oriented load/mutate wrappers without artificial backend delay.

## Error handling strategy

- App data errors are neutral and live in `src/shared/errors/appErrors.ts`.
- User-safe error messages are mapped in `src/shared/constants/systemMessages.ts`.
- Firestore payload validation failures must surface as validation errors and include only safe diagnostic metadata.

## Testing expectations

- Route guard and auth UI tests mock the Firebase gateway boundary, not application runtime services.
- Firestore gateway integration tests should use the Firebase Emulator Suite when added.
- API seed tests should validate records with shared schemas and never target a real Firebase project.

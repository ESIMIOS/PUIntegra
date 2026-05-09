# Firestore Emulator Data (Live Spec)

## Purpose

Define the local Firestore Emulator dataset used by PUIntegra development.

## Scope

- Firestore Emulator collections seeded by `packages/api/src/emulator/seedEmulators.ts` and function-created Auth records.
- Domain validation using shared Zod schemas before seed writes and before web gateway data consumption.

## Collections

- `institutions`
- `permissions`
- `contacts`
- `requests`
- `findings`
- `apiThrottleConfigs`
- `users` (created by Auth `onCreate`, not directly seeded)
- `logs` (created by Auth/API functions, not directly seeded)

## Contract

- `SYSTEM_RFC` is a reserved provider context and must not be seeded as a tenant institution document.
- Permissions reference Firebase Auth users through `Permission.userId`.
- `apiThrottleConfigs` stores distributed API throttle runtime policy per endpoint and is validated with shared Zod schemas before seed writes.
- The seed script must not write `users` or `logs` directly; Auth/API functions own those collections for account events.
- Web code must validate Firestore payloads with shared schemas before writing to Pinia state.
- This spec does not modify or authorize changes to `firebase/firestore/firestore.rules`.

## Required local environment

- `PUINTEGRA_EMULATOR_INSTITUTION_SHARED_SECRET` must be provided when running the seed script.
- Do not commit shared secrets or real credentials.

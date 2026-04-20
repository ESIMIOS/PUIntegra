# Firestore Security Model (Live Spec)

## Purpose

Define the Firestore access model used by PUIntegra during local emulator-backed development.

## Scope

- Firestore Emulator reads required by the web app to hydrate Firebase-backed sessions and read seeded domain data.
- Local development and test Firebase project behavior.
- This spec does not define the production Firestore security model.

## Emulator Read Contract

- Authenticated Firebase users may read seeded domain collections from the Firestore Emulator.
- Anonymous users must not read seeded domain collections.
- Client writes remain denied until a production security model is specified and approved.
- The web app must still validate every Firestore payload with shared Zod schemas before writing to Pinia state.
- The current authenticated-read policy is intentionally broad and exists only to unblock local emulator development.
- Before any production Firestore rules are proposed, this policy must be replaced with least-privilege authorization by user, role, and tenant/RFC context.
- Future secure rules should avoid cross-tenant reads and should prefer deterministic permission lookups or custom claims so rules can evaluate access without broad collection exposure.

## Collections

The authenticated emulator read policy applies to:

- `users`
- `institutions`
- `permissions`
- `contacts`
- `requests`
- `findings`
- `logs`

## Out Of Scope

- Production Firestore rules.
- Role-based Firestore authorization.
- Client-side writes to domain collections.
- Firebase Auth provider, MFA, or custom-claims policy.

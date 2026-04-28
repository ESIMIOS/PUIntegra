# Firestore Security Model (Live Spec)

## Purpose

Define the Firestore access model used by PUIntegra during local emulator-backed development.

## Scope

- Firestore Emulator reads required by the web app to hydrate Firebase-backed sessions and read seeded domain data.
- Local development and test Firebase project behavior.
- This spec does not define the production Firestore security model.

## Emulator Read Contract

- Authenticated Firebase users may read authorized seeded domain collections from the Firestore Emulator.
- Anonymous users must not read seeded domain collections.
- Client writes remain denied until a production security model is specified and approved.
- The web app must still validate every Firestore payload with shared Zod schemas before writing to Pinia state.
- Reads are least-privilege for seeded domain collections using deterministic permission document IDs (`email__rfc`).
- `SYSTEM_ADMINISTRATOR` grants on `SYSTEM_RFC` allow cross-tenant inspection reads where explicitly documented.
- Tenant reads require a granted permission for the document RFC unless the user is a system administrator.
- Account log reads require `RFC == null` and `userId == request.auth.uid` unless the user is a system administrator.
- Future production rules may migrate deterministic permission checks to custom claims, but must preserve the same scope boundaries.

## Collections

The authenticated emulator read policy applies to:

- `users`
- `institutions`
- `permissions`
- `contacts`
- `requests`
- `findings`
- `logs`

## Logs

The `logs` collection is read-only to clients and has three allowed read scopes:

- System administrators may read any log, including tenant logs and `RFC: null` account logs.
- Tenant users may read logs only when `resource.data.RFC` matches a granted tenant RFC.
- Authenticated users may read their own account logs only when `resource.data.RFC == null` and `resource.data.userId == request.auth.uid`.

Anonymous reads and all client writes remain denied.

## Out Of Scope

- Production Firestore deployment hardening beyond the emulator-backed rules in this repository.
- Role-based Firestore authorization.
- Client-side writes to domain collections.
- Firebase Auth provider, MFA, or custom-claims policy.

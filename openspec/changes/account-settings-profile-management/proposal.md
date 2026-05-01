## Why

PUIntegra already exposes `/account/settings` in navigation, but the page still renders a placeholder. Authenticated users need a real self-service account settings flow to keep their visible identity current without requiring provider-side intervention or ad hoc data edits.

The current system persists user profile data in Firestore `users/{uid}` and uses Firebase Auth for session identity, but it has no controlled update boundary to keep Firestore profile data, Firebase Auth `displayName`, session UI, update history, and audit logs consistent.

## What Changes

- Replace `/account/settings` placeholder behavior with a real authenticated account settings page.
- Allow authenticated users to edit `emojiIcon`, `name`, and `phone` from `/account/settings`.
- Add a built-in curated emoji picker with large preview and selection UX; do not add a new emoji dependency in v1.
- Add an authenticated API route for self-profile updates instead of using direct client Firestore writes.
- Synchronize successful `name` changes to both Firestore `users/{uid}.name` and Firebase Auth `displayName`.
- Keep `phone` as a Firestore-domain field only; do not add Firebase Auth phone verification or `phoneNumber` synchronization in this change.
- Extend `UserUpdateSchema` so `users/{uid}.updates` can track `previousPhone` and `updatedPhone` alongside existing name and emoji deltas.
- Record successful settings updates with the existing `USER_ACCOUNT_SETTINGS_UPDATE` log category.

## Capabilities

### New Capabilities
- `account-profile-settings`: Self-service account profile management for authenticated users at `/account/settings`.

### Modified Capabilities
- `api-domain-write-boundary`: Add an authenticated self-profile update API boundary so account settings writes do not happen directly from the browser.

## Impact

- Shared schemas: `packages/shared/src/schemas/user.schema.ts` is affected because `UserUpdateSchema` must add `previousPhone` and `updatedPhone`; no other shared schema changes are expected.
- Web: `packages/web` account settings page, account-profile gateway/composable, account-facing UX states, and session identity refresh behavior are affected.
- API: `packages/api` requires an authenticated self-profile update endpoint plus service-layer synchronization, validation, update-history persistence, and audit logging.
- Firebase Auth: successful name changes update Firebase Auth `displayName`; no provider, MFA, or `phoneNumber` security posture changes are included.
- Firebase security rules: no changes expected because writes move through the API boundary rather than new direct client permissions.
- Specs: add a new OpenSpec capability and update live specs for API write boundaries plus the relevant web and Firebase behavior documents as implementation tasks.

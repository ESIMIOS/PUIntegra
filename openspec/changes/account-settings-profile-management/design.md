## Context

`/account/settings` already exists in routing and navigation, but `packages/web/src/pages/account/AccountSettingsPage.vue` is still a placeholder. The current authenticated session shows `name`, `email`, `uid`, and `emojiIcon` in header UI, but there is no supported path for a user to update those values after account creation.

The persisted account profile lives in Firestore `users/{uid}` and is validated by `UserSchema` in `packages/shared/src/schemas/user.schema.ts`. Firebase Auth is currently used as the runtime identity provider, and account creation already sets Firebase Auth `displayName`, but no update flow exists for profile edits. The existing live specs that constrain this change include:
- `packages/shared/src/schemas/user.schema.ts`
- `openspec/specs/api-domain-write-boundary/spec.md`
- `packages/web/specs/firebase-emulator-mode.md`
- `firebase/functions/specs/hono-emulator-api.md`

This design must preserve the repo’s SDD order: shared contract update first, then tests, then implementation.

## Goals / Non-Goals

**Goals:**
- Provide a production-shaped `/account/settings` experience for editing `emojiIcon`, `name`, and `phone`.
- Keep writes on a server-owned authenticated API boundary with audit logging.
- Synchronize `name` to Firebase Auth `displayName` and Firestore `users/{uid}.name`.
- Extend user update history so phone changes are tracked in `users/{uid}.updates`.
- Refresh visible session identity immediately after a successful save.

**Non-Goals:**
- Editing account email.
- Syncing Firestore `phone` to Firebase Auth `phoneNumber`.
- SMS verification or phone-auth rollout.
- MFA, App Check, Auth provider, or Firestore rules changes.
- Any direct modification of persistent live specs as part of artifact creation; those remain implementation tasks.

## Decisions

### 1. Use a standalone OpenSpec change
- Decision: create `account-settings-profile-management` as its own change rather than extending `professional-auth-account-recovery`.
- Rationale: profile management is a separate capability with different data ownership, UI behavior, and audit semantics.
- Alternative considered: fold it into auth lifecycle work.
- Why not: that change is already broad and centered on registration, verification, recovery, and MFA lifecycle.

### 2. Use an authenticated API boundary for updates
- Decision: account settings writes go through an authenticated HTTP API route in `packages/api`.
- Rationale: the API can own normalization, cross-system synchronization, update-history generation, and audit logging in one place.
- Alternative considered: direct client SDK writes to Firestore plus local Firebase Auth updates.
- Why not: it weakens auditability, duplicates validation, and makes partial consistency harder to control.

### 3. Keep phone as a Firestore-only field in this change
- Decision: update `users/{uid}.phone` only; do not update Firebase Auth `phoneNumber`.
- Rationale: the shared domain user already supports `phone`, while Firebase Auth phone writes imply a different verification and security model.
- Alternative considered: dual-write phone to Firestore and Firebase Auth.
- Why not: it would expand the change into phone verification and provider-auth behavior that is not currently approved.

### 4. Extend `UserUpdateSchema` for phone deltas
- Decision: add `previousPhone` and `updatedPhone` to `UserUpdateSchema`.
- Rationale: the user explicitly wants phone modifications tracked inside the `updates` node, and the current shared contract does not support that delta.
- Alternative considered: rely on `USER_ACCOUNT_SETTINGS_UPDATE` logs only for phone history.
- Why not: it would not satisfy the requested document-level change history.

### 5. Use a built-in curated emoji picker in v1
- Decision: ship a dependency-light emoji selector with a curated set and large preview.
- Rationale: it keeps the UI controlled, testable, and avoids introducing a new package just for the first iteration.
- Alternative considered: add `vue3-emoji-picker` or similar.
- Why not: the repo does not already depend on an emoji picker, and the requested UX can be covered by a curated set.

### 6. Server owns normalization and delta generation
- Decision: the API normalizes inputs and decides which update-history delta fields are populated.
- Rationale: one authoritative normalization path avoids client/server drift and keeps update entries deterministic.
- Alternative considered: trust client-normalized values.
- Why not: update history and audit logs should not depend on browser-side formatting behavior.

## Risks / Trade-offs

- Partial consistency between Firebase Auth and Firestore if one write succeeds and the next fails. → Update Firebase Auth first only when `name` changes, then attempt Firestore write and best-effort Auth rollback on downstream failure.
- Phone formatting ambiguity between UI and backend. → Define canonical server normalization and keep client validation advisory only.
- Shared contract expansion increases approval and review scope. → Call out `packages/shared/src/schemas/user.schema.ts` explicitly in proposal and tasks before implementation starts.
- A curated emoji picker may be less comprehensive than a third-party search UX. → Keep the first version intentionally small and upgradeable without changing the API contract.

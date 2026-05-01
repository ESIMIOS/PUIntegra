## 1. Tests First

- [x] 1.1 Add shared tests for `UserUpdateSchema` phone delta support and malformed phone-history rejection.
- [x] 1.2 Add API tests for authenticated self-profile updates, invalid payloads, unauthorized access, update-history delta generation, Auth displayName sync, and audit logging.
- [x] 1.3 Add web tests for `/account/settings` render, curated emoji selection, name editing, phone validation, success state, and backend error state.
- [x] 1.4 Add session/store tests proving successful account settings saves refresh visible identity immediately.

## 2. Shared Contract Update

- [x] 2.1 Review `packages/shared/src/schemas/user.schema.ts` and confirm the approved contract change scope before editing.
- [x] 2.2 Extend `UserUpdateSchema` with `previousPhone` and `updatedPhone`.
- [x] 2.3 Keep `UserSchema` and inferred types schema-derived with no manual interface duplication.

## 3. API Account Profile Update Boundary

- [x] 3.1 Add an authenticated self-profile update route in `packages/api` for account settings writes.
- [x] 3.2 Implement service-layer normalization and validation for `name`, `emojiIcon`, and `phone`.
- [x] 3.3 Synchronize successful `name` changes to Firebase Auth `displayName`.
- [x] 3.4 Persist Firestore `users/{uid}` changes, append `updates` deltas including `previousPhone` and `updatedPhone`, and update `updatedAt`.
- [x] 3.5 Record `USER_ACCOUNT_SETTINGS_UPDATE` logs for successful saves and handle partial write failure safely.

## 4. Web Account Settings Experience

- [x] 4.1 Replace `packages/web/src/pages/account/AccountSettingsPage.vue` placeholder with a real authenticated settings page.
- [x] 4.2 Implement a built-in curated emoji picker with large preview and selection feedback.
- [x] 4.3 Implement editable `name` and `phone` fields plus read-only email display and Spanish helper/error copy.
- [x] 4.4 Add a web gateway or composable for the account settings API with Zod-validated responses.
- [x] 4.5 Patch `authStore` identity after a successful save so header UI updates immediately.

## 5. Permanent Specs

- [x] 5.1 Update `openspec/specs/api-domain-write-boundary/spec.md` with the new authenticated account profile write requirement.
- [x] 5.2 Update `packages/web/specs/firebase-emulator-mode.md` or the more specific web live spec that owns account settings behavior.
- [x] 5.3 Update `firebase/functions/specs/hono-emulator-api.md` if the new authenticated account profile endpoint changes documented API ownership or route surface.

## 6. Quality Gates

- [ ] 6.1 Run `pnpm --filter @puintegra/web test`.
  - Fails on pre-existing assertion in `tests/auth-pages.test.ts` (`shows TOTP setup guidance and admin-assisted recovery instructions`), unrelated to this change.
- [x] 6.2 Run `pnpm --filter @puintegra/api exec vitest run`.
- [x] 6.3 Run `pnpm -r typecheck`.
- [x] 6.4 Run `pnpm -r lint`.
- [ ] 6.5 Run `pnpm -r test`.
  - Fails for the same pre-existing `packages/web` TOTP copy assertion noted in 6.1.

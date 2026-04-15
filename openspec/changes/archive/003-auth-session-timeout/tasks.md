## 1. Shared Contract & Constants

- [x] 1.1 Add `SECONDS_TO_CLOSE_SESSION_FOR_INACTIVITY` and `SECONDS_TO_SHOW_INACTIVITY_ALERT` to `packages/shared/src/constants/access.ts`.
- [x] 1.2 Export the new constant in `packages/shared/src/index.ts`.

## 2. Testing Framework Setup

- [x] 2.1 Create `packages/web/tests/session-inactivity.test.ts` to define the test suite for inactivity tracking.
- [x] 2.2 Implement mock timer support in Vitest for session timeout testing.

## 3. Frontend Implementation

- [x] 3.1 Create `packages/web/src/composables/useSessionInactivity.ts` with timer and alert state.
- [x] 3.2 Implement event listeners and timer logic.
- [x] 3.3 Create `packages/web/src/components/auth/InactivityWarningModal.vue`.
- [x] 3.4 Integrate modal and tracker in `packages/web/src/App.vue`.
- [x] 3.5 Update `MockSessionSwitcher.vue` to show time remaining.
- [x] 3.6 Ensure `authStore.resetToAnonymous()` is triggered upon timer expiration.

## 4. Quality Gates

- [x] 4.1 Run `pnpm -r typecheck`.
- [x] 4.2 Run `pnpm -r lint`.
- [x] 4.3 Run `pnpm -r test` and ensure all tests pass (focusing on `session-inactivity.test.ts`).

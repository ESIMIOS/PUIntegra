## 1. Tests First

- [x] 1.1 Add shared schema success and failure tests for stage-1 entity schemas and shared update/log support structures.
- [x] 1.2 Add web fixture validation tests proving canonical mock seed data passes shared Zod schemas and malformed fixtures fail safely.
- [x] 1.3 Add repository contract tests for async list/get/create/update success behavior, not-found/error behavior, and `SYSTEM_RFC` exclusion from tenant institution lists.
- [x] 1.4 Add permission repository tests proving the mock user has both `SYSTEM_RFC + SYSTEM_ADMINISTRATOR` and `DEFAULT_RFC + INSTITUTION_ADMIN`.
- [x] 1.5 Add mock storage success/error tests for LocalStorage hydration, invalid persisted state fallback, persistence failure, and reset to canonical seed data.
- [x] 1.6 Add service success/error tests for valid mutations, validation errors, not-found errors, conflict errors, forbidden context errors, history entries, log side effects, and state integrity after failure.
- [x] 1.7 Add store/controller success/error tests for loading, saving, error state, reset behavior, and async operation handling without mounting business views.
- [x] 1.8 Add controller tests proving `MOCK_MILLISECONDS_RESPONSE_DELAY` is applied to load, save, reset, and mutation handlers using fake timers or a test-safe override.
- [x] 1.9 Add routing/context regression tests for provider context vs tenant institution separation.
- [x] 1.10 Add regression tests proving failed operations do not persist partial mock state or append misleading logs.

## 2. Shared Schema Contract

- [x] 2.1 Confirm approval to modify `packages/shared/src/schemas/` before editing shared schema files.
- [x] 2.2 Add shared schemas for `User`, `Institution`, `Permission`, `Contact`, `Request`, `Finding`, and `Log`.
- [x] 2.3 Add shared support schemas for entity updates, actor attribution, timestamps, log categories, and constrained stage-1 status values required by the mock layer.
- [x] 2.4 Export the new schemas and Zod-inferred types from `packages/shared/src/index.ts`.
- [x] 2.5 Ensure all new types in web implementation are inferred from Zod schemas and do not use manual entity interfaces.

## 3. Mock Seed and Storage

- [x] 3.1 Create canonical mock seed data for one mock user, one `DEFAULT_RFC` tenant institution, and one `SYSTEM_RFC` provider context metadata record.
- [x] 3.2 Seed two permissions for the mock user: `SYSTEM_RFC + SYSTEM_ADMINISTRATOR` and `DEFAULT_RFC + INSTITUTION_ADMIN`.
- [x] 3.3 Seed minimal contacts, requests, findings, and logs connected to `DEFAULT_RFC` for stage-1 UI coverage.
- [x] 3.4 Implement a mock storage adapter that hydrates from LocalStorage, validates persisted state, falls back to seed data when invalid, and persists supported mutations.
- [x] 3.5 Implement an async reset operation that clears persisted mock data and restores canonical seed state.

## 4. Async Repositories and Services

- [x] 4.1 Implement async mock repositories for users, institutions, permissions, contacts, requests, findings, and logs.
- [x] 4.2 Ensure `institutionRepository.list()` returns only tenant institutions and excludes `SYSTEM_RFC`.
- [x] 4.3 Implement service/use-case operations for account settings, institution settings, permission CRUD, contact CRUD, request/finding read models, logs, and mock reset.
- [x] 4.4 Ensure service mutations append update history and create logs where required by stage-1 data docs.
- [x] 4.5 Ensure `/admin` service reads inspect `DEFAULT_RFC` while active session context remains `SYSTEM_RFC`.
- [x] 4.6 Keep repositories and services free of artificial response delay so data behavior tests remain fast.
- [x] 4.7 Ensure service mutations are atomic at mock-state level: failed operations must not persist partial changes, append history, or append success logs.

## 5. Error Handling and System Messages

- [x] 5.1 Add typed web data errors for validation, not found, conflict, forbidden, storage, and unknown failures.
- [x] 5.2 Add web system message catalog entries for mock hydration, persistence, reset, validation, not found, conflict, forbidden, and unknown data failures.
- [x] 5.3 Add user-facing error message mapping that does not expose technical codes, stack traces, LocalStorage keys, secrets, or raw validation payloads.
- [x] 5.4 Log safe metadata only: operation name, entity type, safe entity id, active RFC, and active role.

## 6. Store and Controllers

- [x] 6.1 Add a mock data Pinia store for hydrated state, async load/save/reset status, and shared error state.
- [x] 6.2 Update mock session behavior so role switches hydrate user identity, allowed RFCs, and active context from the two seeded permissions.
- [x] 6.3 Add `MOCK_MILLISECONDS_RESPONSE_DELAY` under the web mock/constants layer and a reusable delay helper for data controllers.
- [x] 6.4 Add page controllers/composables for institution selection, account settings, institution settings, permissions, contacts, dashboard, requests, findings, and logs.
- [x] 6.5 Apply `MOCK_MILLISECONDS_RESPONSE_DELAY` to controller load, save, reset, and mutation handlers while keeping loading/saving state active.
- [x] 6.6 Ensure controllers expose view-ready success data, user-safe error state, and retry/reset handlers for follow-up UI changes.
- [x] 6.7 Keep existing placeholder pages unchanged; business views will be implemented in follow-up OpenSpec changes.

## 7. Live Specs and Documentation

- [x] 7.1 Update `packages/web/specs/mock-mode.md` to document one tenant institution plus reserved provider context.
- [x] 7.2 Add or update a permanent web mock data layer spec documenting async repositories, services, storage, reset, `MOCK_MILLISECONDS_RESPONSE_DELAY`, and controller boundaries.
- [x] 7.3 Add or update shared contract documentation for the approved stage-1 schemas.
- [x] 7.4 Document that `SYSTEM_RFC` is not an `Institutions` document and must be excluded from tenant institution lists.

## 8. Quality Gates

- [x] 8.1 Run `pnpm -r typecheck` and ensure zero errors.
- [x] 8.2 Run `pnpm -r lint` and ensure zero warnings.
- [x] 8.3 Run `pnpm -r test` and ensure zero failures.

## 1. Tests First

- [x] 1.1 Add gateway tests for `getInstitutionByRfc` success, not-found, invalid payload, and `SYSTEM_RFC` rejection.
- [x] 1.2 Add admin institution list page tests for loading, rows, empty state, error state, search, and navigation.
- [x] 1.3 Add admin institution detail page tests for loading by route RFC, rendered fields, error state, and related route links.

## 2. Data Read Layer

- [x] 2.1 Add `getInstitutionByRfc(rfc)` to `firebaseDataGateway.ts` using `InstitutionSchema`.
- [x] 2.2 Extend `dataStore.ts` and `useDataControllers.ts` with admin institution list/detail read controllers.

## 3. Admin Pages

- [x] 3.1 Replace `AdminInstitutionsPage.vue` placeholder with the read-only searchable list UI.
- [x] 3.2 Replace `AdminInstitutionPage.vue` placeholder with the read-only detail UI and related route links.

## 4. Specs And Quality Gates

- [x] 4.1 Update live web data gateway spec if the new read helper changes documented behavior.
- [x] 4.2 Run targeted web tests for the new behavior.
- [x] 4.3 Run final quality gates: `pnpm -r typecheck`, `pnpm -r lint`, and `pnpm -r test`.

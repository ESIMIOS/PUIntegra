## 1. Tests First

- [x] 1.1 Add date range utility tests for every preset and custom local-day boundaries.
- [x] 1.2 Add log column preference and CSV utility tests, including export of hidden fields and 1000-record cap.
- [x] 1.3 Add Firestore data gateway tests for global, tenant, account, category, origin, date, order, and cursor log queries.
- [x] 1.4 Add Firestore rules tests for admin, tenant, account, anonymous, cross-tenant, and denied write behavior.
- [x] 1.5 Add page tests for admin, app, and account logs loading, empty, error, filters, ordering, pagination, column personalization, all-record loading, and CSV export.
- [x] 1.6 Add routing and guard tests proving the three log routes resolve and enforce profile scope.

## 2. Data And Security

- [x] 2.1 Extend Firestore log query input types without changing shared schemas.
- [x] 2.2 Implement scoped Firestore log queries with date/order/category/origin/cursor/page-size constraints.
- [x] 2.3 Update Firestore rules for global admin log reads, tenant RFC log reads, own account log reads, and denied writes.
- [x] 2.4 Update Firestore security and web data gateway live specs.

## 3. Logs UI Foundation

- [x] 3.1 Implement date range preset utilities using browser-local boundaries.
- [x] 3.2 Implement log column definitions, default visible columns, scope-specific availability, and localStorage persistence.
- [x] 3.3 Implement CSV export with all fields, selected order, current filters, and 1000-record cap warning.
- [x] 3.4 Implement shared logs table/filter component using `VaDataTable` unless it cannot satisfy requirements cleanly.
- [x] 3.5 Implement dense audit table styles, row accents, stable widths, and responsive column behavior.

## 4. Domain Pages

- [x] 4.1 Implement `/admin/logs` with global scope, tenant filter options, all categories, pagination, and export.
- [x] 4.2 Implement `/app/:rfc/logs` with route RFC scope, institution/PUI categories, no `userId` column personalization, pagination, and export.
- [x] 4.3 Implement `/account/logs` with authenticated user + `RFC: null` scope, user-account categories, pagination, and export.
- [x] 4.4 Update navigation/page content specs if route descriptions or visible behavior changed.
- [x] 4.5 Apply account logs UI observations: Spanish date labels, `TODO` unfiltered options, custom range validation, locked required columns, and account-specific hidden column options.
- [x] 4.6 Seed deterministic `DEFAULT_RFC` emulator logs for filter and pagination validation.
- [x] 4.7 Remove duplicate permission impact data from `INSTITUTION_CREATION` onboarding audit log.
- [x] 4.8 Make date range default unbounded `TODO` and defer custom range queries until both dates are valid.

## 5. Quality Gates

- [x] 5.1 Run `pnpm -r typecheck`.
- [x] 5.2 Run `pnpm -r lint`.
- [x] 5.3 Run `pnpm -r test`.
- [x] 5.4 Run `pnpm --filter @puintegra/api run test:firestore-rules`.
  - Standard emulator-exec command was blocked by an existing Firestore emulator on port 8081; `pnpm --filter @puintegra/api exec vitest run tests/firestore.rules.test.ts` passed against the running emulator.

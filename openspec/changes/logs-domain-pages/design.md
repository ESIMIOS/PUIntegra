## Context

The web app already has routes for `/admin/logs`, `/app/:rfc/logs`, and `/account/logs`, but they render placeholders. Log documents are produced by Auth/API functions and validated by `packages/shared/src/schemas/log.schema.ts`. Current Firestore rules only allow tenant logs through `RFC`, so `RFC: null` account logs and system-admin global log inspection require explicit rules work. Related permanent specs are `firebase/firestore/specs/security-model.md`, `packages/web/specs/firebase-data-gateway.md`, and `packages/web/specs/frontend-foundations.md`.

## Goals / Non-Goals

**Goals:**
- Deliver scoped, read-only log inspection for admin, tenant, and account domains.
- Support large datasets with query-level filtering, pagination, incremental loading, and bounded CSV export.
- Keep profile security enforceable in both route guards and Firestore rules.
- Reuse existing shared schemas and derive TypeScript types from Zod exports.

**Non-Goals:**
- No new log categories or changes to `LogSchema`.
- No client-side log writes.
- No API read endpoint for logs in this change.
- No timeline-primary UI; the primary experience is a dense audit table.

## Decisions

1. Use Firestore SDK reads with explicit rule coverage.
   - Rationale: Existing web data access already reads domain collections through Firestore and validates payloads with shared schemas.
   - Alternative considered: API read endpoints. Rejected because the requested plan chose Firestore rules for account logs.

2. Use query constraints for scope, category, origin, date range, order, and page size.
   - Rationale: Log volume is expected to be large, so normal paginated views must not load the whole collection.
   - Alternative considered: Load all records and filter in memory. Rejected for performance and security clarity.

3. Keep date preset calculations in browser-local time.
   - Rationale: The user-facing filter semantics are calendar concepts for the operator's local day/week/month.
   - Boundaries: today starts at local 00:00 and ends at now; yesterday spans the previous local day; week spans Monday 00:00 through Sunday 23:59:59.999; month spans first day 00:00 through now.
   - UI copy uses Spanish labels: `TODO`, `5 minutos`, `1 hora`, `Hoy`, `Ayer`, `Semana`, `Mes`, and `Rango`.
   - `TODO` is the default unbounded range and omits `createdAt` constraints so users can browse all matching activity with pagination or incremental loading.

4. Share a reusable logs table and filter model across the three pages.
   - Rationale: Columns, filters, CSV export, pagination, and preference persistence are identical except for scope and allowed categories.
   - UI decision: evaluate `VaDataTable` first; use a custom `va-table` only if it cannot support the required incremental loading and column visibility cleanly.

5. Persist visible column preferences per page scope in localStorage.
   - Rationale: Admin, tenant, and account users inspect different fields; preferences should not leak between scopes.
   - Storage keys: `puintegra-logs-columns-admin`, `puintegra-logs-columns-app`, and `puintegra-logs-columns-account`.
   - `Fecha` and `Categoría` are required visible columns.
   - Account logs hide execution role, permission-impact, and search-request column options because they are not useful in the account domain.

6. Seed emulator tenant logs for manual filter and pagination validation.
   - Rationale: The logs UI cannot be validated meaningfully with one or two records.
   - Seed logs are deterministic, scoped to `DEFAULT_RFC`, and include both `INSTITUTION_*` and `PUI_*` categories.

7. Keep institution creation audit impact separate from permission creation impact.
   - Rationale: `INSTITUTION_PERMISSION_CREATION` records the created admin permission impact; duplicating that impact on `INSTITUTION_CREATION` makes the audit trail ambiguous.

## Risks / Trade-offs

- Firestore composite indexes may be required for some combined filters -> keep implementation focused on the planned query shapes and document any emulator index requirement found during tests.
- `All` mode can still be expensive on very large result sets -> load in batches of 100 and keep CSV export capped at 1000 records.
- Local timezone boundaries can differ from backend/server time interpretations -> document and test local-time behavior explicitly.
- Firestore rules changes are security-sensitive -> add rules tests for every profile/scope combination and keep client writes denied.

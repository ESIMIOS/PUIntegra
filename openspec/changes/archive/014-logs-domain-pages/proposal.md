## Why

PUIntegra already records account, institution, and system audit logs, but the three logs routes still render placeholders. Operators and administrators need scoped, secure, high-density audit inspection to support traceability, support, and operational review.

## What Changes

- Replace `/admin/logs`, `/app/:rfc/logs`, and `/account/logs` placeholders with read-only logs pages.
- Add scoped log reads for system, tenant, and account contexts using the existing `LogSchema`.
- Add date preset filters, custom date ranges, category/origin filters, ordering, pagination, incremental all-record loading, column personalization, and CSV export.
- Add `/admin/logs` tenant filtering using institution records plus `DEFAULT_RFC`.
- Persist visible-column preferences in browser storage per logs page scope.
- Update Firestore rules so profiles can only read the logs required by their role and context.

## Capabilities

### New Capabilities

- `logs-domain-inspection`: Read-only, scoped audit log inspection across admin, tenant, and account domains.

### Modified Capabilities

- `api-domain-write-boundary`: No requirement change; existing API-created logs are consumed by the new read-only pages.
- `admin-institution-inspection`: No requirement change; admin institution records are reused only to populate the admin tenant filter.

## Impact

- Shared schemas: no changes expected; `LogSchema`, `LogCategorySchema`, `LogOriginSchema`, and existing log category constants are sufficient.
- Web: logs pages, shared log table/filter/export utilities, log gateway/store/controller reads, page tests.
- Firebase: `firebase/firestore/firestore.rules` and Firestore rules tests are affected to authorize account-level `RFC: null` logs and global admin log reads while preserving denied client writes.
- Specs: add a new OpenSpec capability and update live specs for Firestore security and web data gateway behavior.

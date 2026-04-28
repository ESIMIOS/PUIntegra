## Why

System administrators need complete tenant-level backoffice surfaces beyond institution list/detail. The current admin tenant requests, plan, and contacts routes are placeholders, while permissions and account institution routing work has already been started outside an OpenSpec change and should be captured for traceability without rework.

## What Changes

- Add canonical RFC-scoped admin routes for tenant operations:
  - `/admin/:rfc/requests` as read-only request inspection.
  - `/admin/:rfc/contacts` as read-only contact inspection.
  - `/admin/:rfc/plan` as an editable commercial plan surface for plan, status, start date, and end date.
- Normalize admin tenant subroute helpers and navigation links around `/admin/:rfc/*` for requests, plan, contacts, and permissions.
- Add a server-owned plan update workflow instead of direct browser Firestore writes.
- Patch institution onboarding so creating an institution plan also writes an `INSTITUTION_PLAN_CREATION` log entry.
- Require every successful tenant plan edit to write an `INSTITUTION_PLAN_UPDATE` log entry.
- Record already completed work as completed tasks only:
  - Moving `/app/institutions` to `/account/institutions`.
  - Adding `/admin/:rfc/permissions` as a read-only tenant permissions route.
- Update live specs so the permanent route and API contracts match the implemented behavior.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `admin-institution-inspection`: Extend tenant inspection from institution list/detail into RFC-scoped requests, contacts, permissions, and editable plan views.
- `api-domain-write-boundary`: Add institution plan updates as provider-managed writes through the API boundary.

## Impact

- Shared schemas: `InstitutionSchema` remains the institution source of truth; implementation will need a new shared Zod payload schema for plan updates before code is written. This schema change requires explicit human approval before editing `packages/shared/src/schemas/*`.
- Web: admin routes, route path helpers, navigation catalog, admin tenant pages, Firestore read gateway/store/controller surfaces, and page tests.
- API: new authenticated HTTP endpoint for plan updates, service validation, Firestore mutation, and audit logging; patch existing institution onboarding audit logs.
- Firebase security rules: no change planned; browser writes remain denied and plan writes go through `packages/api`.
- OpenSpec/live specs: update `admin-institution-inspection` and `api-domain-write-boundary`; likely update web/API live specs that enumerate routes or HTTP endpoints.

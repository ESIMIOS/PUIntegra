## Why

`/app/:rfc/admin/*` routes already exist in routing and navigation, but the current pages still render placeholders instead of institution-admin operational workflows.

Institution administrators need self-service administration surfaces inside the app domain without requiring provider-side intervention for routine administrative tasks.

Current gaps in the app-domain admin surface are:
- no readonly plan page,
- no canonical three-slot contact management flow,
- no shared-secret management UX,
- no institution-admin permission management,
- no app-domain API write boundary for these mutations.

Shared-secret handling must move from plaintext-style semantics to encrypted-at-rest semantics with backend-only operational use.

## What Changes

- Replace `/app/:rfc/admin/plan` placeholder behavior with readonly plan inspection.
- Replace `/app/:rfc/admin/contacts` placeholder behavior with three required contact slots: `LEGAL`, `TECHNICAL`, and `IMMEDIATE_SEARCH`.
- Replace `/app/:rfc/admin/settings` placeholder behavior with shared-secret status and fingerprint management.
- Replace `/app/:rfc/admin/permissions` placeholder behavior with permission list, filter, create, and edit UX.
- Add app-domain authenticated mutation endpoints only:
  - `PUT /api/app/institutions/:rfc/contacts/:type`
  - `PUT /api/app/institutions/:rfc/shared-secret`
  - `POST /api/app/institutions/:rfc/permissions`
  - `PATCH /api/app/institutions/:rfc/permissions/:permissionId`
- Add key-management documentation as part of the implementation deliverables.
- Update environment documentation to define the backend master-key requirement.
- Propose shared schema changes before implementation:
  - `InstitutionSchema.sharedSecret` becomes encrypted payload, never plaintext.
  - add `SHA256SharedSecret`.

## Capabilities

### New Capabilities

- `app-admin-institution-operations`: Institution-admin self-service administration under `/app/:rfc/admin/*`.

### Modified Capabilities

- `api-domain-write-boundary`: add institution-admin app-domain mutation endpoints for contacts, shared secret, and permissions.

## Impact

- Shared schemas:
  - `packages/shared/src/schemas/institution.schema.ts` will require explicit human approval before implementation.
  - `ContactSchema` and `PermissionSchema` are expected to remain structurally sufficient for this change.
- Web:
  - app admin pages,
  - route tests,
  - page tests,
  - controller/store/gateway support.
- API:
  - new authenticated routes,
  - service-layer mutation logic,
  - audit logging.
- Docs/specs:
  - key-management documentation,
  - environment/master-key documentation,
  - live spec updates during implementation.

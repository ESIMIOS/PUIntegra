# App Admin Institution Operations (Live Spec)

## Purpose

Define the app-domain institution-admin operations contract under `/app/:rfc/admin/*`.

## Route surface

- `/app/:rfc/admin/plan` readonly plan inspection.
- `/app/:rfc/admin/contacts` canonical three-slot contact administration.
- `/app/:rfc/admin/settings` shared-secret configuration and rotation.
- `/app/:rfc/admin/permissions` permission listing, filtering, creation, and constrained editing.

## Behavior contract

- `plan` page is readonly and backed by existing institution read model.
- `contacts` page enforces exactly three canonical contact types:
  - `LEGAL`
  - `TECHNICAL`
  - `IMMEDIATE_SEARCH`
- `settings` page never renders plaintext shared-secret values and exposes only operational metadata:
  - secret configured state
  - SHA256 fingerprint
- `permissions` page:
  - supports email/role/status filters
  - supports invitation-by-email creation
  - limits edit to `role` and `status`

## Security and write boundary

- Browser reads safe fields from Firestore via existing validated data gateway paths.
- Browser mutations are routed through authenticated API endpoints only.
- App-domain mutation routes reject reserved RFC operations (`SYSTEM_RFC`, `DEFAULT_RFC`).
- App-domain mutation routes require a granted `INSTITUTION_ADMIN` permission for the same RFC scope.

## Audit expectations

- Contact create/update writes:
  - `INSTITUTION_CONTACT_CREATION`
  - `INSTITUTION_CONTACT_UPDATE`
- Shared-secret create/rotation writes:
  - `INSTITUTION_SHARED_SECRET_UPDATE`
- Permission create/update writes:
  - `INSTITUTION_PERMISSION_CREATION`
  - `INSTITUTION_PERMISSION_UPDATE`

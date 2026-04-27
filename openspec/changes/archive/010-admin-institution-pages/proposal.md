## Why

System administrators can create institutions and are redirected to `/admin/institutions/:rfc`, but the list and detail pages remain placeholders. This change turns those existing routes into useful read-only inspection surfaces without expanding the provider mutation boundary.

## What Changes

- Replace `/admin/institutions` with a searchable institution list for provider backoffice users.
- Replace `/admin/institutions/:rfc` with a read-only institution detail page.
- Add a web Firebase SDK read helper for loading a single institution by RFC.
- Reuse existing route guards, `InstitutionSchema`, and SDK-backed read architecture.
- Keep all provider-managed writes out of scope.

## Capabilities

### New Capabilities

- `admin-institution-inspection`: Covers read-only provider inspection of tenant institutions through admin list and detail pages.

### Modified Capabilities

- None.

## Impact

- Affected web areas: admin institution pages, Firebase data gateway, data store/controller layer, and web tests.
- Shared Zod schemas affected: no. The existing `InstitutionSchema` is sufficient for read-only inspection.
- API affected: no new endpoint or mutation.
- Firebase security rules affected: no.
- Dependencies affected: no.

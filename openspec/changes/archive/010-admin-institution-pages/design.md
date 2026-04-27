## Context

The admin route tree already includes `/admin/institutions` and `/admin/institutions/:rfc`, but both pages render placeholders. Institution onboarding now redirects to the detail route, so the provider backoffice needs read-only inspection pages backed by the existing institution contract.

Permanent specs and contracts referenced by this design:

- `packages/shared/src/schemas/institution.schema.ts`
- `packages/web/specs/firebase-data-gateway.md`
- `packages/web/specs/frontend-foundations.md`
- `packages/web/specs/design-system.md`

## Goals / Non-Goals

**Goals:**

- Render a searchable admin institution list.
- Render a read-only admin institution detail page.
- Validate Firestore payloads with `InstitutionSchema` before UI use.
- Keep reads SDK-backed according to the current web data gateway spec.
- Keep system-admin access enforced by existing `/admin` route guards.

**Non-Goals:**

- No edits to shared schemas.
- No API `GET` endpoint.
- No Firestore rule changes.
- No institution plan, contact, permission, secret, or settings mutations.
- No exposure of secret values in UI.

## Decisions

1. Use Firebase SDK reads for list and detail.
   - Rationale: `packages/web/specs/firebase-data-gateway.md` already allows authorized domain reads through the SDK.
   - Alternative considered: API `GET /api/admin/institutions/:rfc`; rejected because it expands backend scope without a current policy need.

2. Add `getInstitutionByRfc(rfc)` beside `listInstitutions()`.
   - Rationale: detail pages should load one document directly and still validate with `InstitutionSchema`.
   - Alternative considered: fetch all institutions and filter client-side; rejected because it couples detail performance and errors to list loading.

3. Keep page state local and gateway/store/controller layers thin.
   - Rationale: the pages do not introduce shared domain state; controllers only expose loading/error/read actions.
   - Alternative considered: a dedicated admin store; rejected as unnecessary for read-only MVP behavior.

4. Show secret setup state only as metadata.
   - Rationale: the schema may contain `sharedSecret`, but UI must not reveal credential material.
   - Alternative considered: omit secret status entirely; rejected because operational readiness benefits from a safe configured/not-configured indicator.

## Risks / Trade-offs

- SDK read permissions may differ across environments -> keep error rendering explicit and rely on existing route/system error patterns.
- The list uses client-side search over currently loaded institutions -> acceptable for MVP dataset size; server-side search can be proposed later if needed.
- Detail not-found and reserved `SYSTEM_RFC` errors share the same user recovery path -> both lead the user back to the institution list without exposing internal rule details.

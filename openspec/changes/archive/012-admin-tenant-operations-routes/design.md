## Context

Admin institution inspection currently has a real list/detail surface, while tenant requests, plan, and contacts pages are placeholders. Recent completed work also moved account institution selection to `/account/institutions` and added `/admin/:rfc/permissions`; this change records those tasks for traceability and finishes the remaining tenant-operation routes.

Permanent specs that constrain this design:
- `openspec/specs/admin-institution-inspection/spec.md`
- `openspec/specs/api-domain-write-boundary/spec.md`
- `packages/web/specs/firebase-data-gateway.md`
- `firebase/functions/specs/hono-emulator-api.md`
- `packages/shared/src/schemas/institution.schema.ts`
- `packages/shared/src/schemas/request.schema.ts`
- `packages/shared/src/schemas/contact.schema.ts`
- `packages/shared/src/schemas/permission.schema.ts`

## Goals / Non-Goals

**Goals:**
- Implement `/admin/:rfc/requests`, `/admin/:rfc/contacts`, and `/admin/:rfc/plan`.
- Keep requests and contacts read-only, backed by existing Firestore read helpers and shared Zod schemas.
- Make plan editing server-owned through `packages/api` with a shared Zod payload contract.
- Patch onboarding audit behavior so institution creation also records the initial commercial plan creation.
- Record every successful plan edit as a distinct plan update audit event.
- Normalize tenant admin subroutes so navigation targets `/admin/:rfc/*`.
- Preserve already completed `/account/institutions` and `/admin/:rfc/permissions` work without reimplementation.

**Non-Goals:**
- No Firebase Auth provider, MFA, blocking function, or production auth configuration changes.
- No Firestore rule changes.
- No mutation support for requests, contacts, or permissions.
- No direct browser writes to `institutions`.
- No archival of this OpenSpec change without explicit human approval.

## Decisions

1. Use canonical `/admin/:rfc/*` tenant-operation routes.
   - Rationale: `/admin/:rfc/permissions` already follows this route shape, and the requested routes use the same tenant-RFC layout.
   - Alternative considered: keep `/admin/institutions/:rfc/*`; rejected because it preserves two route conventions for the same tenant inspection context.

2. Keep requests and contacts on SDK-backed read paths.
   - Rationale: existing gateway reads already validate Firestore data with `RequestSchema` and `ContactSchema`, and current live specs allow authorized SDK reads.
   - Alternative considered: add API read endpoints; rejected because it expands backend scope without a current write/audit requirement.

3. Implement plan updates through `PATCH /api/admin/institutions/:rfc/plan`.
   - Rationale: plan updates are provider-managed domain writes and must follow the API boundary used for audited server-owned operations.
   - Alternative considered: browser-side Firestore update; rejected because it conflicts with the current denied client-write posture and API-domain write boundary.

4. Use explicit plan audit categories for creation and update.
   - Rationale: `LOG_CATEGORIES.INSTITUTION_PLAN_CREATION` and `LOG_CATEGORIES.INSTITUTION_PLAN_UPDATE` already exist, but onboarding currently creates the institution and its bootstrap permission without a plan creation log.
   - Implementation direction: onboarding should build and persist an additional `INSTITUTION_PLAN_CREATION` log; plan update should build and persist one `INSTITUTION_PLAN_UPDATE` log after the institution update succeeds.
   - Alternative considered: rely on `INSTITUTION_CREATION` as implicit plan creation; rejected because it hides commercial plan lifecycle events from audit consumers.

5. Add a shared plan update payload schema before tests and implementation.
   - Rationale: all constrained types must be inferred from Zod and shared between web and API.
   - Required approval: editing `packages/shared/src/schemas/*` needs explicit human approval before implementation.

## Risks / Trade-offs

- Route shape migration may leave stale internal links -> Update route helpers, navigation catalog, detail related-actions, and documented paths together.
- Plan write adds backend scope -> Keep endpoint narrowly scoped to `plan`, `planStatus`, `planStartAt`, and `planFinishAt`; validate actor as `SYSTEM_ADMINISTRATOR`.
- Date handling can drift between UI and API -> Store and submit UTC millisecond timestamps and validate `planStartAt <= planFinishAt` server-side.
- Audit expectations may be underspecified -> Onboarding must write `INSTITUTION_PLAN_CREATION`; plan edits must append an `InstitutionUpdateSchema` history entry and write `INSTITUTION_PLAN_UPDATE` from the API service layer.

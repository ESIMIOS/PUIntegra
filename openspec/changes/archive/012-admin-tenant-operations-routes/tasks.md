## 1. Tests First

- [x] 1.1 Add routing tests for `/admin/:rfc/requests`, `/admin/:rfc/plan`, `/admin/:rfc/contacts`, and canonical related-action links.
- [x] 1.2 Add navigation catalog tests for tenant admin route targets.
- [x] 1.3 Add page tests for read-only admin tenant requests and contacts lists.
- [x] 1.4 Add web tests for tenant plan form validation, successful submit, and API error handling.
- [x] 1.5 Add API tests for plan update authorization, validation, missing tenant, successful update, update history, and audit logging.
- [x] 1.6 Add API tests proving institution onboarding writes `INSTITUTION_PLAN_CREATION`.

## 2. Shared Contract

- [x] 2.1 Propose and obtain explicit approval to edit `packages/shared/src/schemas/*` for the plan update payload contract.
- [x] 2.2 Add `UpdateInstitutionPlanSchema` using existing commercial plan, plan status, and timestamp schemas.
- [x] 2.3 Export the new schema and infer all new plan update types from Zod.

## 3. API Plan Update

- [x] 3.1 Patch institution onboarding service to build and persist an `INSTITUTION_PLAN_CREATION` log in addition to existing institution and permission creation logs.
- [x] 3.2 Add `PATCH /api/admin/institutions/:rfc/plan` to the Hono API route tree.
- [x] 3.3 Verify Firebase bearer token and require `SYSTEM_ADMINISTRATOR`.
- [x] 3.4 Reject reserved RFCs, missing institution documents, invalid payloads, and invalid date ranges.
- [x] 3.5 Update only `plan`, `planStatus`, `planStartAt`, `planFinishAt`, `updatedAt`, and the institution update history.
- [x] 3.6 Write an `INSTITUTION_PLAN_UPDATE` log for successful plan updates.
- [x] 3.7 Update `firebase/functions/specs/hono-emulator-api.md` and any API live specs that enumerate endpoints or audit categories.

## 4. Web Data And Routes

- [x] 4.1 Normalize admin route helpers to `/admin/:rfc/requests`, `/admin/:rfc/plan`, and `/admin/:rfc/contacts`.
- [x] 4.2 Update route records, related actions, and sidebar/navigation links to use canonical admin tenant routes.
- [x] 4.3 Add or reuse Firestore read helpers for tenant requests and tenant contacts by RFC.
- [x] 4.4 Add web gateway/store/controller support for the plan update API.

## 5. Web Pages

- [x] 5.1 Replace `AdminInstitutionRequestsPage` placeholder with a read-only tenant request table.
- [x] 5.2 Replace `AdminInstitutionContactsPage` placeholder with a read-only tenant contact table.
- [x] 5.3 Replace `AdminInstitutionPlanPage` placeholder with an editable plan form.
- [x] 5.4 Implement loading, empty, validation, error, retry, and success states using existing UI patterns.

## 6. Live Specs And Completed Context

- [x] 6.1 Update `openspec/specs/admin-institution-inspection/spec.md` during implementation.
- [x] 6.2 Update `openspec/specs/api-domain-write-boundary/spec.md` during implementation.
- [x] 6.3 Update web live specs if route/navigation behavior is enumerated there.
- [x] 6.4 Move `/app/institutions` to `/account/institutions` without redoing implementation.
- [x] 6.5 Add `/admin/:rfc/permissions` read-only route without redoing implementation.

## 7. Quality Gates

- [x] 7.1 Run `pnpm -r typecheck`.
- [x] 7.2 Run `pnpm -r lint`.
- [x] 7.3 Run `pnpm -r test`.

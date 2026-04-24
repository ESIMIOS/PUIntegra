## Context

The repo already defines the admin route for creating a new institution, the system-administrator role gate for that route, Firestore rules that deny client writes to `institutions`, and shared log categories for institution creation and permission creation. The current gap is architectural: `packages/web/src/gateways/firebaseDataGateway.ts` still exposes direct mutation helpers, while the persisted Firestore rule posture only permits client reads.

The onboarding workflow must therefore establish the intended production boundary:

- reads may continue through Firebase SDK clients where rules already authorize them
- provider-managed mutations must be performed by authenticated HTTP services in `packages/api`

The current shared institution contract also blocks deferred secret setup because `InstitutionSchema` requires `sharedSecret`. This change documents the need for a schema change proposal but does not grant implementation approval for editing `packages/shared/src/schemas/`.

## Goals / Non-Goals

**Goals:**

- Replace the placeholder admin page with a real onboarding flow.
- Define a server-owned API mutation for institution creation.
- Create the institution and bootstrap admin permission in a single server-side workflow.
- Enforce role, permission, RFC pre-existence, and duplicate bootstrap-permission validation on the server.
- Record audit logs for the onboarding operation using existing shared log categories.
- Update live specs to make the read-vs-write boundary explicit.

**Non-Goals:**

- No contact bootstrap.
- No secret setup workflow.
- No changes to Firestore security rules.
- No changes to route or role definitions.
- No new log categories.
- No unapproved shared-schema implementation in this change proposal itself.

## Decisions

1. Use an authenticated Hono `POST` endpoint for institution onboarding.
   - Rationale: Firestore rules already deny client writes, and onboarding requires centralized authorization and validation.

2. Keep browser reads on the Firebase SDK.
   - Rationale: Live specs already allow SDK reads for authorized data, and this change only needs to move the mutation boundary.

3. Bootstrap exactly one initial institution-admin permission during onboarding.
   - Rationale: This gives the new institution an operational admin entry point without expanding scope into contacts or broader seed records.

4. Defer operational secret setup to a later change.
   - Rationale: The product decision is to avoid collecting or generating the institution secret in this onboarding workflow.
   - Consequence: implementation will require a separately approved change to the shared institution contract.

5. Treat onboarding as a server-owned audited workflow, not a generic document write.
   - Rationale: the workflow must validate actor role, reject duplicate RFCs, reject duplicate granted admin permissions, and emit auditable domain logs.

## Proposed Flow

1. A `SYSTEM_ADMINISTRATOR` opens `/admin/new-institution`.
2. The web page renders a form that collects:
   - `RFC`
   - `name`
   - `plan`
   - `planStatus`
   - `planStartAt`
   - `planFinishAt`
   - `adminEmail`
3. The page submits the payload through a dedicated HTTP gateway in `packages/web`, not through direct Firestore writes.
4. The API endpoint verifies authentication, resolves the caller context, and validates the request payload with Zod.
5. The API service rejects:
   - non-system-administrator callers
   - `SYSTEM_RFC`
   - `DEFAULT_RFC`
   - malformed or duplicate RFCs
   - malformed admin emails
   - duplicate granted bootstrap permission for the same `RFC + email`
   - incoherent plan dates
6. The API service persists:
   - the institution document
   - the bootstrap permission document
   - the institution creation log
   - the permission creation log
7. The API responds with an envelope containing the created institution summary and permission summary.
8. The web page shows a success state and navigates to the created institution detail page.

## API Contract

### Request

`POST /api/admin/institutions`

Payload:

- `RFC`
- `name`
- `plan`
- `planStatus`
- `planStartAt`
- `planFinishAt`
- `adminEmail`

### Response

Successful response envelope returns:

- created institution summary
- created bootstrap permission summary
- server-generated identifiers needed by the UI

The endpoint does not return any secret value in this change.

## Validation Rules

- caller must be authenticated
- caller must be `SYSTEM_ADMINISTRATOR`
- payload must pass Zod validation before service logic
- `RFC` must be normalized and valid
- `RFC` must not equal `SYSTEM_RFC`
- `RFC` must not equal `DEFAULT_RFC`
- institution RFC must not already exist
- `adminEmail` must be normalized and valid
- no duplicate granted bootstrap permission may exist for the same `RFC + email`
- `plan` and `planStatus` must be valid enum values
- `planStartAt` must be less than or equal to `planFinishAt`
- audit log payloads must conform to shared log contracts

## Risks / Trade-offs

- The current shared institution contract and deferred-secret product decision are incompatible. The implementation must stop for explicit approval before modifying shared schemas.
- The repo still contains direct web mutation helpers for other domain actions. This change documents the intended boundary for onboarding and should update live specs so future changes do not repeat the mismatch.
- Transactional persistence may require Firestore transaction/batch handling in the API service layer. The implementation should choose the narrowest mechanism that guarantees no partial onboarding writes.

## Why

The provider backoffice already reserves `/admin/new-institution` for system administrators, but the page is still a placeholder and the current web data layer contains direct Firestore mutation helpers that conflict with the persisted Firestore rule posture. Live specs and rules already allow client reads for authorized data, while domain writes remain denied from the client and must move to server-owned HTTP services when authorization, pre-existence checks, and audit logging are required.

Institution onboarding is the first provider-side workflow that needs this server boundary. The flow must let a `SYSTEM_ADMINISTRATOR` create a new tenant institution and bootstrap its first admin permission without exposing direct write capability to the browser.

## What Changes

- Add a provider backoffice institution-onboarding workflow for `/admin/new-institution`.
- Add a server-owned Hono HTTP endpoint in `packages/api` for institution creation.
- Define transactional persistence for:
  - `institutions/{RFC}`
  - one bootstrap `permissions/{permissionId}` record for the institution administrator
  - audit logs for institution creation and bootstrap permission creation
- Keep browser reads on the Firebase SDK where current specs already allow them.
- Update live specs so the data-boundary rule is explicit: reads may remain SDK-backed, but domain writes that require policy enforcement or audit must go through `packages/api`.
- Explicitly propose a shared-contract change because the current `InstitutionSchema` requires `sharedSecret`, while this onboarding flow defers secret setup.

## Capabilities

### New Capabilities

- `create-institution-onboarding`: Covers admin institution creation, bootstrap admin permission creation, API-backed validation, and audit logging.

### Modified Capabilities

- `firebase-emulator-foundation`: Clarify that direct web writes are not the long-term mutation boundary for provider-managed domain actions.

## Impact

- Affected web areas: admin new-institution page, controller/gateway boundary, data error mapping, and route-level success flow.
- Affected API areas: Hono router, authenticated HTTP mutation handling, Firestore service layer, and audit-log composition.
- Shared Zod schemas affected: yes, proposal only. The onboarding flow needs an approved schema adjustment so institution creation can be defined without an operational `sharedSecret` at creation time.
- Firebase security rules affected: no.
- Route definitions affected: no. Existing route and role definitions are reused.
- Log category taxonomy affected: no. Existing institution log categories remain the source of truth.

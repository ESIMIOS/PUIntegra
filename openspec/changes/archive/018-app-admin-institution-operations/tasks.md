## 1. Shared Contract Approval Gate

- [x] 1.1 Review existing shared contracts in contact, permission, and institution schemas before any implementation work.
- [x] 1.2 Obtain explicit human approval to modify `packages/shared/src/schemas/institution.schema.ts`.
- [x] 1.3 Add `SHA256SharedSecret` to `InstitutionSchema` as nullable string.
- [x] 1.4 Redefine `InstitutionSchema.sharedSecret` semantics as encrypted payload only, never plaintext.
- [x] 1.5 Preserve `InstitutionUpdateSchema` SHA256 delta fields and ensure implementation uses them without generating synthetic creation-history rows.
- [x] 1.6 Export any new inferred institution types from Zod only; do not add manual interfaces.

## 2. Tests First

- [x] 2.1 Add web routing and page tests for `/app/:rfc/admin/plan`, `/app/:rfc/admin/contacts`, `/app/:rfc/admin/settings`, and `/app/:rfc/admin/permissions`.
- [x] 2.2 Add web tests for contact slot placeholders and modal upsert behavior.
- [x] 2.3 Add web tests for shared-secret settings page, including no plaintext rendering, warning and confirmation on rotation, and fingerprint display.
- [x] 2.4 Add web tests for permission filters, create flow, and edit restriction to role and status.
- [x] 2.5 Add API tests for contact upsert authorization, validation, creation and update audit logging, and RFC-context mismatch.
- [x] 2.6 Add API tests for shared-secret first set, rotation, encryption persistence shape, SHA256 persistence, authorization, and audit logging.
- [x] 2.7 Add API tests for permission create, duplicate rejection, permission edit restrictions, authorization, and audit logging.
- [x] 2.8 Add shared schema tests covering encrypted institution secret payload acceptance and SHA256 field validation.
- [x] 2.9 Add emulator-backed integration coverage for at least one happy path per new route family.

## 3. API App-Domain Write Boundary

- [x] 3.1 Add authenticated app-domain routes for contacts, shared secret, and permissions in the Hono router.
- [x] 3.2 Require Firebase bearer token verification on every new route.
- [x] 3.3 Require `ROLE.INSTITUTION_ADMIN` and active RFC equal to route RFC on every new route.
- [x] 3.4 Reject reserved and system RFC misuse plus malformed route or payload inputs with safe API errors.
- [x] 3.5 Implement contact slot upsert service logic with one canonical record per contact type.
- [x] 3.6 Implement shared-secret service logic with SHA256 generation, HKDF derivation, AES-256-GCM encryption, version metadata, and institution update history mutation.
- [x] 3.7 Implement permission create service logic with normalized email and deterministic `permissionId`.
- [x] 3.8 Implement permission edit service logic limited to `role` and `status`.
- [x] 3.9 Write the correct audit log entry for each successful mutation.
- [x] 3.10 Update `firebase/functions/specs/hono-emulator-api.md` during implementation.

## 4. Web Data Layer

- [x] 4.1 Reuse existing Firestore read helpers for institution, contacts, and permissions where safe.
- [x] 4.2 Add app-admin mutation gateways for contacts, shared secret, and permissions with Zod-validated API responses.
- [x] 4.3 Extend stores, controllers, and composables for app-admin mutation loading, saving, and error state.
- [x] 4.4 Keep browser reads on current Firestore read paths; do not add an app-admin summary read endpoint.

## 5. Web Pages

- [x] 5.1 Replace `AppAdminPlanPage.vue` placeholder with readonly plan view.
- [x] 5.2 Replace `AppAdminContactsPage.vue` placeholder with fixed three-slot contact management UI.
- [x] 5.3 Replace `AppAdminSettingsPage.vue` placeholder with shared-secret settings UI.
- [x] 5.4 Replace `AppAdminPermissionsPage.vue` placeholder with permission list, filter, create, and edit UI.
- [x] 5.5 Implement modal UX patterns consistent with existing Vuestic modal usage.
- [x] 5.6 Implement loading, empty, success, validation, retry, and backend error states with existing UI conventions.
- [x] 5.7 Ensure no plaintext secret is ever shown, logged, or persisted in frontend state beyond the immediate submit action.

## 6. Documentation And Permanent Specs

- [x] 6.1 Update the live spec or create the live spec for `app-admin-institution-operations` during implementation.
- [x] 6.2 Update `openspec/specs/api-domain-write-boundary/spec.md` during implementation.
- [x] 6.3 Update web live specs if app-admin route behavior is documented there.
- [x] 6.4 Add clear key-management documentation covering master key ownership, HKDF derivation inputs, AES-256-GCM usage, versioning metadata, rotation expectations, and the rule that derived keys are never stored.
- [x] 6.5 Update current environment documentation to define the new backend master-key variable or secret, which runtimes require it, and emulator or deployment setup expectations.
- [x] 6.6 Ensure all documentation uses one canonical master-key name and one canonical derivation context string.

## 7. Quality Gates

- [x] 7.1 Run `pnpm -r typecheck`.
- [x] 7.2 Run `pnpm -r lint`.
- [x] 7.3 Run `pnpm -r test`.

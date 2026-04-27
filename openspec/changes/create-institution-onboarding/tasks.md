## 1. OpenSpec And Contracts

- [x] 1.1 Create the institution onboarding OpenSpec change.
- [x] 1.2 Document that the current `InstitutionSchema` blocks deferred secret setup and that implementation needs explicit approval before editing shared schemas.
- [x] 1.3 Define onboarding requirements, API mutation boundary requirements, and bootstrap audit requirements in OpenSpec specs.
- [x] 1.4 Update live specs after implementation to document the HTTP-write / SDK-read boundary.

## 2. Shared Contract Approval Gate

- [x] 2.1 Confirm the approved shared-schema change that allows institution onboarding without an operational `sharedSecret`.
- [x] 2.2 Add shared schema tests first for the approved deferred-secret contract change.
- [x] 2.3 Apply the approved shared schema change only after explicit human authorization.

## 3. API Institution Onboarding

- [x] 3.1 Add authenticated Hono route for provider-managed institution creation.
- [x] 3.2 Add request/response validation using shared Zod contracts and API envelopes.
- [x] 3.3 Implement server-side authorization for `SYSTEM_ADMINISTRATOR`.
- [x] 3.4 Implement Firestore service-layer validation for duplicate RFC and duplicate granted bootstrap permission.
- [x] 3.5 Persist institution, bootstrap permission, and audit logs through `packages/api/src/services/`.
- [x] 3.6 Ensure the onboarding write path succeeds or fails as one workflow without partial records.
- [x] 3.7 Add API tests for validation, authorization, duplicate RFC rejection, reserved RFC rejection for `SYSTEM_RFC` and `DEFAULT_RFC`, duplicate permission rejection, and successful onboarding.
- [x] 3.8 Add authorization coverage proving every defined role is rejected except `SYSTEM_ADMINISTRATOR`.

## 4. Web Admin Onboarding Flow

- [x] 4.1 Replace `AdminNewInstitutionPage.vue` placeholder with a form-driven onboarding flow.
- [x] 4.2 Add a dedicated HTTP gateway/controller in `packages/web` for institution onboarding.
- [x] 4.3 Keep institution reads on the Firebase SDK-backed read path where current specs already allow them.
- [x] 4.4 Show safe validation/policy errors in the onboarding UI.
- [x] 4.5 Navigate to the created institution detail page after successful creation.
- [x] 4.6 Add web tests for valid submission, reserved RFC validation rendering for `SYSTEM_RFC` and `DEFAULT_RFC`, API validation failure rendering, and HTTP mutation usage.

## 5. Architecture Cleanup And Gates

- [x] 5.1 Update web/API live specs to state that domain writes requiring policy enforcement or audit must go through `packages/api`.
- [x] 5.2 Review current direct web mutation helpers and document which remaining ones are transitional versus out of scope for this change.
- [x] 5.3 Run package and monorepo gates required by the repo after implementation.

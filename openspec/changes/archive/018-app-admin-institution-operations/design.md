## Context

App admin routes exist today but still render placeholders rather than institution-admin workflows.

Reads already happen through Firestore SDK access patterns validated by shared Zod schemas, and the current request is to preserve that read posture for safe fields while moving all new mutations through authenticated API endpoints.

Relevant current-state facts that constrain this change:
- The existing institution-admin role constant is `ROLE.INSTITUTION_ADMIN`.
- The existing canonical route is `/app/:rfc/admin/contacts` using the plural path segment.
- Existing audit taxonomy already includes:
  - `INSTITUTION_CONTACT_CREATION`
  - `INSTITUTION_CONTACT_UPDATE`
  - `INSTITUTION_SHARED_SECRET_UPDATE`
  - `INSTITUTION_PERMISSION_CREATION`
  - `INSTITUTION_PERMISSION_UPDATE`

## Goals / Non-Goals

**Goals:**
- Provide a readonly plan view at `/app/:rfc/admin/plan`.
- Provide three-slot contact management at `/app/:rfc/admin/contacts`.
- Provide encrypted shared-secret management at `/app/:rfc/admin/settings`.
- Provide permission list, filter, create, and edit workflows at `/app/:rfc/admin/permissions`.
- Add an app-domain API write boundary for contacts, shared secret, and permissions.
- Include explicit documentation deliverables for key management and environment/master-key setup.

**Non-Goals:**
- Provider `/admin/:rfc/*` parity or backoffice feature changes.
- Firestore rules changes.
- Auth provider, MFA, or broader security-posture changes.
- A new account-claiming workflow for invited users.
- PUI integration implementation details beyond documenting shared-secret usage constraints.
- Storage of derived per-institution keys.

## Decisions

1. Scope app domain only.
   - `/admin/:rfc/*` provider pages are out of scope for this change.

2. Keep safe reads on the current Firestore read path.
   - No `GET /api/app/institutions/:rfc/admin-summary` route is added.
   - Pages read safe fields from Firestore using existing schema-validated gateways.
   - Only mutations move through authenticated API routes.

3. `/app/:rfc/admin/plan` is readonly.
   - The page shows institution name, plan, plan status, plan dates, timestamps, and optionally safe secret-status summary if useful.
   - No plan editing is included in the app-domain admin surface.

4. Contacts are exactly one record per required type.
   - The page renders fixed slots for `LEGAL`, `TECHNICAL`, and `IMMEDIATE_SEARCH`.
   - A missing slot shows a highlighted placeholder state.
   - Upsert is performed per slot through a modal.
   - `type` is implicit from the selected slot and is not editable inside the modal.

5. Shared secret uses encrypted-at-rest storage in `institutions`.
   - `sharedSecret` stores encrypted payload only.
   - `SHA256SharedSecret` stores the SHA256 digest of the raw submitted value.
   - No plaintext secret is ever returned to the browser.
   - The UI shows status plus SHA256 fingerprint.
   - First set and later rotation use the same API route.
   - Rotation requires warning and explicit confirmation in the UI before submit.

6. Derived per-institution keys are not stored.
   - Use one backend master key.
   - Derive a per-institution key on demand using HKDF.
   - HKDF inputs are:
     - the master key,
     - normalized institution RFC,
     - a fixed context string such as `puintegra/shared-secret/v1`.
   - Use the derived key with AES-256-GCM.
   - Persist only ciphertext payload, IV or nonce, and version metadata.
   - Do not persist derived keys in Firestore or anywhere else.

7. Permission creation is invitation-by-email.
   - `userId` stays optional.
   - Create is allowed even if the user has not created a Firebase account yet.
   - If an account already exists, later enrichment may be added in another change; it is not part of this one.

8. Permission editing is constrained.
   - Only `role` and `status` may be edited.
   - `email`, `permissionId`, and `RFC` are immutable from the edit flow.

9. Documentation is a first-class deliverable.
   - The change must include implementation tasks to update:
     - key-management documentation,
     - environment documentation for master-key configuration.

## Data / API Design

### `PUT /api/app/institutions/:rfc/contacts/:type`

- Authentication and authorization:
  - requires authenticated Firebase bearer token,
  - requires `ROLE.INSTITUTION_ADMIN`,
  - requires the active RFC context to match the route RFC.
- Behavior:
  - create the record if the slot is currently missing,
  - replace or update the canonical record if the slot already exists,
  - preserve exactly one canonical record per contact type.
- Audit behavior:
  - creation writes `INSTITUTION_CONTACT_CREATION`,
  - update writes `INSTITUTION_CONTACT_UPDATE`.

### `PUT /api/app/institutions/:rfc/shared-secret`

- Authentication and authorization:
  - requires authenticated Firebase bearer token,
  - requires `ROLE.INSTITUTION_ADMIN`,
  - requires the active RFC context to match the route RFC.
- Request payload:
  - contains the raw secret input submitted by the institution administrator.
- Server responsibilities:
  - normalize the input,
  - compute SHA256 of the normalized raw value,
  - derive the per-institution key,
  - encrypt the raw value,
  - persist the encrypted payload in `institutions.sharedSecret`,
  - persist the SHA256 digest in `institutions.SHA256SharedSecret`,
  - append institution update history using only SHA256 delta fields,
  - write `INSTITUTION_SHARED_SECRET_UPDATE`.

### `POST /api/app/institutions/:rfc/permissions`

- Authentication and authorization:
  - requires authenticated Firebase bearer token,
  - requires `ROLE.INSTITUTION_ADMIN`,
  - requires the active RFC context to match the route RFC.
- Request payload:
  - `email`
  - `role`
  - `status`
- Server responsibilities:
  - normalize the email,
  - build deterministic `permissionId` from normalized `email + RFC`,
  - reject duplicate existing permission records for the same normalized key,
  - persist the permission,
  - write `INSTITUTION_PERMISSION_CREATION`.

### `PATCH /api/app/institutions/:rfc/permissions/:permissionId`

- Authentication and authorization:
  - requires authenticated Firebase bearer token,
  - requires `ROLE.INSTITUTION_ADMIN`,
  - requires the active RFC context to match the route RFC.
- Request payload:
  - `role`
  - `status`
- Server responsibilities:
  - validate that the target permission belongs to the route RFC,
  - update only the allowed fields,
  - append permission update history,
  - write `INSTITUTION_PERMISSION_UPDATE`.

## Risks / Trade-offs

- Shared-schema approval dependency:
  - the implementation cannot begin modifying `packages/shared/src/schemas/institution.schema.ts` until explicit human approval is granted.
- Ciphertext in the institution document remains client-readable in principle:
  - this is acceptable within the proposed design because the browser receives ciphertext only and has no decrypt capability.
- SHA256 fingerprint visibility leaks a verifier artifact:
  - this must be documented as an operationally acceptable disclosure, not as a secret.
- Key rotation and versioning must be documented clearly:
  - otherwise future encrypt/decrypt flows may diverge and create incompatible secret payloads.

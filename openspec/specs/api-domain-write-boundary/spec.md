## Requirements

### Requirement: Provider-managed institution writes use the API boundary

The system SHALL perform institution onboarding writes through authenticated HTTP services in `packages/api`, not through direct client Firestore writes.

#### Scenario: Browser initiates onboarding

- **WHEN** the admin onboarding page submits a new institution request
- **THEN** the browser sends the payload to an authenticated HTTP endpoint
- **AND** the browser does not write `institutions` or bootstrap `permissions` directly through the Firebase SDK

#### Scenario: Server validates before writes

- **WHEN** the API receives an onboarding request
- **THEN** the request payload is validated with shared Zod contracts before service logic runs
- **AND** Firestore writes occur only from the API service layer

#### Scenario: Onboarding writes plan creation audit

- **WHEN** the API successfully creates an institution during onboarding
- **THEN** it writes `INSTITUTION_CREATION`, `INSTITUTION_PERMISSION_CREATION`, and `INSTITUTION_PLAN_CREATION` logs in the same server-side batch

### Requirement: Provider-managed institution plan updates use the API boundary

The system SHALL perform institution plan updates through authenticated HTTP services in `packages/api`, not through direct client Firestore writes.

#### Scenario: Browser initiates plan update

- **WHEN** the admin tenant plan page submits plan, plan status, plan start, and plan finish values
- **THEN** the browser sends the payload to `PATCH /api/admin/institutions/:rfc/plan`
- **AND** the browser does not write the institution document directly through the Firebase SDK

#### Scenario: Server audits plan update

- **WHEN** the API successfully updates a tenant institution plan
- **THEN** it updates only plan, plan status, plan start, plan finish, `updatedAt`, and institution update history
- **AND** it writes an `INSTITUTION_PLAN_UPDATE` log in the same server-side batch

### Requirement: Existing read path remains SDK-backed where authorized

The system SHALL keep institution reads on the Firebase SDK path where current persisted rules and specs already authorize them.

#### Scenario: Institution read after onboarding

- **WHEN** the UI loads institution listings or institution detail after successful onboarding
- **THEN** those reads may continue through the existing authorized Firebase SDK read path
- **AND** the onboarding change does not require new client write permissions

### Requirement: Auth lifecycle policy operations use the API boundary

The system SHALL route auth lifecycle operations that require PUIntegra policy, abuse controls, or audit logging through HTTP services in `packages/api`.

#### Scenario: Browser requests account creation policy

- **WHEN** the account creation page needs to validate PUIntegra registration eligibility
- **THEN** the browser sends the policy request to a public auth lifecycle API endpoint
- **AND** the API validates normalized email eligibility against existing shared contracts before account creation proceeds

#### Scenario: Browser requests password recovery

- **WHEN** the forgot password page submits a recovery request
- **THEN** the browser sends the request to a public auth lifecycle API endpoint
- **AND** the API applies abuse controls before the browser requests Firebase reset email delivery
- **AND** the response uses the shared API response envelope with neutral user-facing copy

#### Scenario: Browser records lifecycle events

- **WHEN** password reset, email verification, MFA enrollment, or throttling events require durable audit or policy tracking
- **THEN** the browser sends only sanitized metadata to the auth lifecycle API
- **AND** the API writes logs server-side with `RFC: null`

#### Scenario: Administrator resets lost MFA access

- **WHEN** an authorized administrator submits an approved MFA reset for a user who lost authenticator access
- **THEN** the browser sends the request to an authenticated admin API endpoint
- **AND** the API removes or resets the Firebase TOTP enrollment through a server-owned path
- **AND** the API writes a sanitized `USER_ACCOUNT_MFA_UNENROLL` account-level audit log

### Requirement: Account settings profile writes use the API boundary

The system SHALL route authenticated self-profile settings writes through HTTP services in `packages/api`.

#### Scenario: Browser updates account settings

- **WHEN** an authenticated user submits `/account/settings` changes
- **THEN** the browser sends the payload to an authenticated account profile API endpoint
- **AND** the browser does not write `users/{uid}` profile fields directly through the Firebase SDK

#### Scenario: Server synchronizes and audits account profile updates

- **WHEN** the API receives a valid authenticated self-profile update request
- **THEN** the API validates and normalizes `name`, `emojiIcon`, and `phone` before persistence
- **AND** the API synchronizes Firebase Auth `displayName` when `name` changes
- **AND** the API appends user update history deltas in `users/{uid}.updates`
- **AND** the API records a `USER_ACCOUNT_SETTINGS_UPDATE` account-level log with `RFC: null`

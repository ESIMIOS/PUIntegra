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

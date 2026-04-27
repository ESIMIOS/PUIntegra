## ADDED Requirements

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

### Requirement: Existing read path remains SDK-backed where authorized

The system SHALL keep institution reads on the Firebase SDK path where current persisted rules and specs already authorize them.

#### Scenario: Institution read after onboarding

- **WHEN** the UI loads institution listings or institution detail after successful onboarding
- **THEN** those reads may continue through the existing authorized Firebase SDK read path
- **AND** the onboarding change does not require new client write permissions

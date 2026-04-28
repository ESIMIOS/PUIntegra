## MODIFIED Requirements

### Requirement: Provider-managed institution writes use the API boundary

The system SHALL perform institution onboarding and institution plan update writes through authenticated HTTP services in `packages/api`, not through direct client Firestore writes.

#### Scenario: Browser initiates onboarding

- **WHEN** the admin onboarding page submits a new institution request
- **THEN** the browser sends the payload to an authenticated HTTP endpoint
- **AND** the browser does not write `institutions` or bootstrap `permissions` directly through the Firebase SDK

#### Scenario: Browser initiates plan update

- **WHEN** the admin tenant plan page submits a plan update for `/admin/:rfc/plan`
- **THEN** the browser sends the payload to an authenticated HTTP endpoint
- **AND** the browser does not write `institutions/{RFC}` directly through the Firebase SDK

#### Scenario: Server validates before writes

- **WHEN** the API receives an onboarding or plan update request
- **THEN** the request payload is validated with shared Zod contracts before service logic runs
- **AND** Firestore writes occur only from the API service layer

#### Scenario: Onboarding records plan creation audit

- **WHEN** the API creates an institution during onboarding
- **THEN** the API writes an `INSTITUTION_PLAN_CREATION` log entry for the created institution RFC

#### Scenario: Plan update records plan update audit

- **WHEN** the API successfully updates an institution plan
- **THEN** the API writes an `INSTITUTION_PLAN_UPDATE` log entry for the updated institution RFC

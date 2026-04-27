## Requirements

### Requirement: Provider backoffice can onboard a new institution

The system SHALL allow a `SYSTEM_ADMINISTRATOR` to create a new institution from `/admin/new-institution` through a server-owned HTTP workflow.

#### Scenario: Valid institution onboarding request

- **GIVEN** the current caller is authenticated as `SYSTEM_ADMINISTRATOR`
- **WHEN** the caller submits a valid onboarding form with institution data and bootstrap admin email
- **THEN** the system creates the institution through an HTTP API
- **AND** the system creates the bootstrap institution-admin permission in the same workflow
- **AND** the page navigates to the created institution detail view after success

#### Scenario: Unauthorized caller

- **GIVEN** the current caller is authenticated with any role other than `SYSTEM_ADMINISTRATOR`
- **WHEN** the caller attempts institution onboarding
- **THEN** the system rejects the request
- **AND** no institution, permission, or onboarding audit records are created

#### Scenario: Only system administrator role is accepted

- **WHEN** each defined application role attempts institution onboarding
- **THEN** only `SYSTEM_ADMINISTRATOR` is accepted
- **AND** every other role is rejected before records are written

#### Scenario: Deferred secret setup

- **WHEN** a new institution is onboarded
- **THEN** the onboarding workflow does not require the institution operational secret to be collected or returned in this flow
- **AND** secret setup remains a later workflow governed by the shared contract approved for implementation

### Requirement: Onboarding validates institution and bootstrap-admin inputs

The system SHALL validate institution onboarding inputs before any records are persisted.

#### Scenario: Duplicate RFC

- **WHEN** the onboarding payload uses an RFC that already exists as an institution document
- **THEN** the system rejects the request with a safe validation or conflict response

#### Scenario: Reserved system RFC

- **WHEN** the onboarding payload uses `SYSTEM_RFC`
- **THEN** the system rejects the request before any records are written

#### Scenario: Reserved default tenant RFC

- **WHEN** the onboarding payload uses `DEFAULT_RFC`
- **THEN** the system rejects the request before any records are written

#### Scenario: Duplicate bootstrap permission

- **WHEN** the onboarding payload uses an admin email that already has a granted bootstrap permission for the same institution RFC
- **THEN** the system rejects the request with a safe validation or conflict response

#### Scenario: Invalid plan dates

- **WHEN** the onboarding payload includes `planStartAt` later than `planFinishAt`
- **THEN** the system rejects the request before any records are written

## ADDED Requirements

### Requirement: Institution onboarding writes bootstrap records atomically

The system SHALL treat institution onboarding as one server-owned workflow that creates the institution and its initial admin permission without leaving partial bootstrap state.

#### Scenario: Successful bootstrap write set

- **WHEN** the onboarding workflow succeeds
- **THEN** the system creates:
  - the institution document at `institutions/{RFC}`
  - one bootstrap permission document for the institution admin
  - one audit log for institution creation
  - one audit log for bootstrap permission creation

#### Scenario: Partial-write prevention

- **WHEN** any validation or persistence step in the onboarding workflow fails
- **THEN** the workflow does not leave a partially created institution bootstrap set behind

### Requirement: Institution onboarding uses existing audit categories

The system SHALL audit onboarding using existing shared log categories.

#### Scenario: Institution creation audit

- **WHEN** an institution is created successfully
- **THEN** the system writes an audit log using `INSTITUTION_CREATION`

#### Scenario: Bootstrap permission audit

- **WHEN** the bootstrap institution-admin permission is created successfully
- **THEN** the system writes an audit log using `INSTITUTION_PERMISSION_CREATION`

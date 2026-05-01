## ADDED Requirements

### Requirement: Account profile settings writes use the API boundary
The system SHALL perform authenticated self-profile settings writes through HTTP services in `packages/api`, not through direct client Firestore writes.

#### Scenario: Browser submits account settings
- **WHEN** the account settings page submits a profile update request
- **THEN** the browser sends the payload to an authenticated account profile API endpoint
- **AND** the browser does not write `users/{uid}` directly through the Firebase SDK

#### Scenario: Server validates and synchronizes profile settings
- **WHEN** the API receives an authenticated self-profile update request
- **THEN** the request payload is validated before service logic runs
- **AND** the API normalizes the account settings fields
- **AND** the API updates Firebase Auth `displayName` only when the account name changed
- **AND** the API writes the Firestore profile update history and audit log server-side

## ADDED Requirements

### Requirement: App admin institution plan inspection

The system SHALL allow institution administrators to inspect the current commercial plan from `/app/:rfc/admin/plan` through a readonly page backed by the institution read model.

#### Scenario: Plan page displays current plan fields

- **WHEN** an institution administrator opens `/app/:rfc/admin/plan` for the active institution RFC
- **THEN** the page displays the institution name, current commercial plan, plan status, plan dates, and relevant timestamps
- **AND** the page does not expose plan editing controls

#### Scenario: Plan page load failure is recoverable

- **WHEN** the institution read fails or the requested record cannot be validated
- **THEN** the page displays a recoverable error state
- **AND** the page allows retry without mutating data

#### Scenario: Non-admin or wrong RFC context is rejected

- **WHEN** a user without institution-admin role or with a different active RFC context attempts to open `/app/:rfc/admin/plan`
- **THEN** route guards reject the navigation
- **AND** the page does not load protected institution data

### Requirement: App admin institution contacts management

The system SHALL present exactly three required institutional contact slots at `/app/:rfc/admin/contacts`: legal, technical, and immediate-search.

#### Scenario: Missing slot shows placeholder and highlight

- **WHEN** one of the canonical contact slots has no stored record
- **THEN** the page shows a highlighted placeholder state for that slot
- **AND** the placeholder communicates that the contact information has not been provided yet

#### Scenario: Existing slot shows current safe contact fields

- **WHEN** a canonical contact slot already has a stored record
- **THEN** the page displays the current safe contact fields for that slot
- **AND** the page does not expose unrelated contact types

#### Scenario: Institution admin creates a missing slot from a modal

- **WHEN** an institution administrator submits contact information for a missing canonical slot
- **THEN** the system creates the corresponding contact record through the authenticated API route
- **AND** the page refreshes to show the stored slot data

#### Scenario: Institution admin updates an existing slot from a modal

- **WHEN** an institution administrator edits an existing canonical slot and submits valid changes
- **THEN** the system updates the corresponding contact record through the authenticated API route
- **AND** the page refreshes to show the updated slot data

#### Scenario: Successful contact mutations write audit logs

- **WHEN** a canonical contact slot is successfully created or updated
- **THEN** the system writes the corresponding institution contact audit log category

#### Scenario: Browser never offers arbitrary contact-type creation

- **WHEN** the contacts page is displayed
- **THEN** the browser offers mutation entry points only for the three canonical slots
- **AND** it does not offer arbitrary contact-type creation outside those slots

### Requirement: App admin institution shared-secret settings

The system SHALL allow institution administrators to set and rotate the institution shared secret from `/app/:rfc/admin/settings` without ever exposing the plaintext stored value.

#### Scenario: Settings page shows whether the secret exists

- **WHEN** an institution administrator opens `/app/:rfc/admin/settings`
- **THEN** the page shows whether a shared secret is currently configured for the active institution

#### Scenario: Settings page shows SHA256 fingerprint

- **WHEN** a shared secret has been configured
- **THEN** the page shows the SHA256 fingerprint derived from the raw secret value
- **AND** the fingerprint is shown as operational metadata rather than as a plaintext secret

#### Scenario: Settings page never renders plaintext secret

- **WHEN** the settings page loads or refreshes
- **THEN** no stored plaintext shared secret is rendered in the DOM
- **AND** the browser receives no plaintext stored secret value from the backend

#### Scenario: First secret creation stores encrypted payload and SHA256

- **WHEN** an institution administrator sets a shared secret for the first time
- **THEN** the system stores encrypted payload in the institution record
- **AND** the system stores the SHA256 digest of the raw submitted value

#### Scenario: Secret rotation requires warning and explicit confirmation

- **WHEN** an institution administrator attempts to replace an existing shared secret
- **THEN** the UI shows a warning describing the critical nature of the operation
- **AND** the rotation requires explicit user confirmation before submit

#### Scenario: Successful secret mutation writes shared-secret audit log

- **WHEN** a shared-secret create or rotation operation succeeds
- **THEN** the system writes `INSTITUTION_SHARED_SECRET_UPDATE`

#### Scenario: Only backend services may decrypt and use the secret

- **WHEN** the system needs to use the shared secret for operational purposes
- **THEN** only backend services may decrypt and consume the secret value
- **AND** the browser never receives decrypt capability

### Requirement: App admin institution permissions management

The system SHALL allow institution administrators to inspect, filter, create, and edit institution permissions from `/app/:rfc/admin/permissions`.

#### Scenario: Permissions list displays RFC permission records

- **WHEN** an institution administrator opens `/app/:rfc/admin/permissions`
- **THEN** the page lists permissions that belong to the active institution RFC

#### Scenario: Filters apply to email, role, and status

- **WHEN** an institution administrator applies filter criteria on the permissions page
- **THEN** the list filters by email, role, and status using the current RFC-scoped permission records

#### Scenario: Permission creation uses invitation-by-email

- **WHEN** an institution administrator creates a permission for an email that does not yet have a Firebase account
- **THEN** the system allows creation using invitation-by-email semantics
- **AND** the absence of an existing Firebase account does not block creation

#### Scenario: Permission edit allows only role and status changes

- **WHEN** an institution administrator edits an existing permission
- **THEN** the editable fields are limited to role and status
- **AND** email, permission identifier, and RFC remain immutable

#### Scenario: Successful permission create writes creation log

- **WHEN** a permission is successfully created
- **THEN** the system writes `INSTITUTION_PERMISSION_CREATION`

#### Scenario: Successful permission edit writes update log

- **WHEN** a permission is successfully updated
- **THEN** the system writes `INSTITUTION_PERMISSION_UPDATE`

#### Scenario: Duplicate permission creation is rejected

- **WHEN** a permission creation request targets the same normalized email and RFC as an existing permission record
- **THEN** the system rejects the duplicate creation request
- **AND** it does not create a second permission record for that normalized key

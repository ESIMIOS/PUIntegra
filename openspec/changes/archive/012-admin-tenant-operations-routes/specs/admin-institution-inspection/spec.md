## MODIFIED Requirements

### Requirement: Admin institution detail
The system SHALL allow system administrators to inspect one tenant institution from `/admin/institutions/:rfc` through a read-only detail page backed by the existing `InstitutionSchema`.

#### Scenario: Institution detail is displayed
- **WHEN** a system administrator opens `/admin/institutions/:rfc` for an existing tenant institution
- **THEN** the page displays identity, commercial plan, plan status, plan dates, timestamps, update count, and safe secret setup status

#### Scenario: Related admin routes are available
- **WHEN** a system administrator views an institution detail page
- **THEN** the page offers navigation to `/admin/:rfc/requests`, `/admin/:rfc/plan`, `/admin/:rfc/contacts`, and `/admin/:rfc/permissions`

#### Scenario: Institution cannot be loaded
- **WHEN** the requested RFC is reserved, missing, or fails validation
- **THEN** the page displays a recoverable error state and does not expose secret values

## ADDED Requirements

### Requirement: Admin tenant requests
The system SHALL allow system administrators to inspect tenant requests from `/admin/:rfc/requests` through a read-only list backed by validated request records.

#### Scenario: Tenant requests are listed
- **WHEN** a system administrator opens `/admin/:rfc/requests` for an existing tenant institution
- **THEN** the page displays request rows for that RFC with request identity, status, and operational summary fields

#### Scenario: Tenant requests empty state
- **WHEN** the tenant has no request records
- **THEN** the page displays an empty state without creating or mutating data

#### Scenario: Tenant request read failure
- **WHEN** request records cannot be loaded or fail validation
- **THEN** the page displays a recoverable error state and does not mutate data

### Requirement: Admin tenant contacts
The system SHALL allow system administrators to inspect tenant contacts from `/admin/:rfc/contacts` through a read-only list backed by validated contact records.

#### Scenario: Tenant contacts are listed
- **WHEN** a system administrator opens `/admin/:rfc/contacts` for an existing tenant institution
- **THEN** the page displays contact rows for that RFC with contact identity, role/category, and safe contact fields

#### Scenario: Tenant contacts empty state
- **WHEN** the tenant has no contact records
- **THEN** the page displays an empty state without creating or mutating data

#### Scenario: Tenant contact read failure
- **WHEN** contact records cannot be loaded or fail validation
- **THEN** the page displays a recoverable error state and does not mutate data

### Requirement: Admin tenant permissions
The system SHALL allow system administrators to inspect tenant permissions from `/admin/:rfc/permissions` through a read-only list backed by validated permission records.

#### Scenario: Tenant permissions are listed
- **WHEN** a system administrator opens `/admin/:rfc/permissions` for an existing tenant institution
- **THEN** the page displays permission rows for that RFC with permission email, role, and status

#### Scenario: Tenant permissions remain read-only
- **WHEN** the permissions page is displayed
- **THEN** the page does not expose create, update, revoke, or delete controls

### Requirement: Admin tenant plan editing
The system SHALL allow system administrators to edit a tenant institution plan from `/admin/:rfc/plan` using a server-owned write workflow.

#### Scenario: Tenant plan form is displayed
- **WHEN** a system administrator opens `/admin/:rfc/plan` for an existing tenant institution
- **THEN** the page displays editable controls for plan, plan status, plan start date, and plan finish date

#### Scenario: Tenant plan update succeeds
- **WHEN** a system administrator submits a valid tenant plan update
- **THEN** the system persists the new plan fields through the API and shows the updated institution data
- **AND** the system records an `INSTITUTION_PLAN_UPDATE` log entry for the tenant RFC

#### Scenario: Tenant plan update validation fails
- **WHEN** the submitted plan payload is invalid or the start date is after the finish date
- **THEN** the system rejects the update and displays a recoverable validation error without changing the institution document

#### Scenario: Tenant plan update is unauthorized
- **WHEN** a non-system administrator attempts to update a tenant plan
- **THEN** the system rejects the operation without changing the institution document

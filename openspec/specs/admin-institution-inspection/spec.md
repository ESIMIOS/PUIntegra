## Requirements

### Requirement: Admin institution list
The system SHALL allow system administrators to inspect tenant institutions from `/admin/institutions` through a read-only list backed by validated institution records.

#### Scenario: Institutions are listed
- **WHEN** a system administrator opens `/admin/institutions` and institution records are available
- **THEN** the page displays each institution RFC, name, plan, plan status, and plan date range

#### Scenario: Institutions can be searched
- **WHEN** a system administrator enters a search term matching an institution RFC, name, plan, or plan status
- **THEN** the page displays only matching institution rows

#### Scenario: No institutions match
- **WHEN** a system administrator searches for a term with no matches
- **THEN** the page displays an empty state without creating or mutating data

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

### Requirement: Read-only data boundary
The system SHALL implement admin institution inspection using authorized read helpers only and MUST NOT add provider-managed write behavior.

#### Scenario: Detail read uses existing contract
- **WHEN** the detail page loads an institution by RFC
- **THEN** the gateway validates the Firestore document with `InstitutionSchema` before returning it to the UI

#### Scenario: Reserved provider context is excluded
- **WHEN** the institution list or detail helper reads institution data
- **THEN** `SYSTEM_RFC` is excluded from tenant institution results

### Requirement: Admin tenant operations
The system SHALL allow system administrators to inspect tenant requests and contacts by RFC and edit only the tenant commercial plan fields through the API boundary.

#### Scenario: Tenant requests are displayed read-only
- **WHEN** a system administrator opens `/admin/:rfc/requests`
- **THEN** the page displays request FUB, CURP, status, phase statuses, and missing date for that tenant
- **AND** the page does not expose client-side write controls for requests

#### Scenario: Tenant contacts are displayed read-only
- **WHEN** a system administrator opens `/admin/:rfc/contacts`
- **THEN** the page displays contact type, name, phone, CURP, and contact RFC for that tenant
- **AND** the page does not expose client-side write controls for contacts

#### Scenario: Tenant plan is edited through API
- **WHEN** a system administrator submits `/admin/:rfc/plan` with plan, plan status, plan start, and plan finish values
- **THEN** the browser calls the authenticated API plan update endpoint
- **AND** the API writes institution update history and an `INSTITUTION_PLAN_UPDATE` audit log

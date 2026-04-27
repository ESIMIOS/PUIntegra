## ADDED Requirements

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
- **THEN** the page offers navigation to that institution's requests, plan, and contacts admin routes

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

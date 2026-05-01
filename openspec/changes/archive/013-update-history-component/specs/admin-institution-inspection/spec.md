## ADDED Requirements

### Requirement: Admin update history inspection
The system SHALL allow system administrators to inspect update histories for tenant institution records and tenant operation records from admin pages that already load those entities.

#### Scenario: Institution detail shows inline update history
- **WHEN** a system administrator opens `/admin/institutions/:rfc` for an existing tenant institution
- **THEN** the page displays the institution update history inline using the reusable update-history component

#### Scenario: Tenant contacts expose history details
- **WHEN** a system administrator opens `/admin/:rfc/contacts` and contact records include updates
- **THEN** each contact row exposes an icon control that opens update-history details for that contact

#### Scenario: Tenant permissions expose history details
- **WHEN** a system administrator opens `/admin/:rfc/permissions` and permission records include updates
- **THEN** each permission row exposes an icon control that opens update-history details for that permission

#### Scenario: Tenant requests expose history details
- **WHEN** a system administrator opens `/admin/:rfc/requests` and request records include updates
- **THEN** each request row exposes an icon control that opens update-history details for that request

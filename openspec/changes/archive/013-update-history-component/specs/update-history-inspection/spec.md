## ADDED Requirements

### Requirement: Reusable update history display
The system SHALL provide a reusable web component that renders update-history arrays from existing non-log entity schemas without requiring shared schema changes.

#### Scenario: Inline history is displayed
- **WHEN** a page renders the component with `mode` set to `inline` and one or more update records
- **THEN** the component displays the update history directly in the page content

#### Scenario: Icon history opens a modal
- **WHEN** a page renders the component with `mode` set to `icon` and the user activates the history control
- **THEN** the component opens a modal showing the same update-history details

#### Scenario: Empty history is displayed
- **WHEN** the component receives an empty update array
- **THEN** the component displays a clear empty state and does not render misleading change rows

### Requirement: Timeline and table views
The system SHALL allow users to switch update history between a timeline view and a table view.

#### Scenario: Timeline view shows chronological events
- **WHEN** the component renders in timeline view
- **THEN** it displays update events in descending `updatedAt` order with relative time, origin, actor metadata, and changed properties

#### Scenario: Table view shows traceability rows
- **WHEN** the component renders in table view
- **THEN** it displays one row per changed property with date, origin, actor, field label, previous value, and updated value

#### Scenario: Timeline is the default view
- **WHEN** the caller does not provide a default view
- **THEN** the component opens in timeline view

### Requirement: Existing update schemas are normalized for display
The system SHALL derive display rows from existing `previous*` and `updated*` field pairs on update records.

#### Scenario: Field pairs are matched
- **WHEN** an update record includes keys such as `previousPlanStatus` and `updatedPlanStatus`
- **THEN** the component treats the pair as one changed field named by the configured field definitions

#### Scenario: Metadata fields are excluded from changed fields
- **WHEN** an update record includes `updatedAt`, `updateOrigin`, `updatedByUserId`, `updatedByUserRole`, or `updatedByUserEmail`
- **THEN** those metadata fields are displayed as event context and not as changed properties

#### Scenario: Raw values are visible
- **WHEN** a changed field contains a raw string, number, enum value, null, or undefined-like missing value
- **THEN** the component renders the value directly using the configured formatter or fallback display text

### Requirement: Account domain integrations
The system SHALL expose update history in account domain pages that already load update-bearing user, institution, or permission records.

#### Scenario: Account settings shows user profile updates
- **WHEN** an authenticated user opens account settings and the user profile loads with update history
- **THEN** the page displays the user profile update history inline

#### Scenario: Account institutions shows row history actions
- **WHEN** an authenticated user opens account institutions and rows are backed by institution and permission records with update history
- **THEN** each relevant row exposes icon-modal access to available institution and permission update histories

#### Scenario: Account logs are excluded
- **WHEN** an authenticated user opens account logs
- **THEN** the logs page continues using the existing log inspection UI and does not use the update-history component

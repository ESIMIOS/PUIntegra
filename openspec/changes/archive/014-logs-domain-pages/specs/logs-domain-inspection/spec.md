## ADDED Requirements

### Requirement: Domain-scoped logs pages
The system SHALL provide read-only audit log inspection pages scoped to the active domain and authenticated profile.

#### Scenario: Admin logs are global
- **WHEN** a `SYSTEM_ADMINISTRATOR` opens `/admin/logs`
- **THEN** the page displays logs across the whole system, including tenant logs and account logs

#### Scenario: Tenant logs are RFC-scoped
- **WHEN** an institution role opens `/app/:rfc/logs`
- **THEN** the page displays only logs whose `RFC` equals the route RFC

#### Scenario: Account logs are user-scoped
- **WHEN** an authenticated user opens `/account/logs`
- **THEN** the page displays only logs whose `userId` equals the authenticated user id and whose `RFC` is `null`

### Requirement: Logs security boundary
The system MUST enforce logs visibility in both route guards and Firestore rules.

#### Scenario: System administrator reads all logs
- **WHEN** a system administrator reads logs
- **THEN** Firestore permits reading any log document and denies client writes

#### Scenario: Tenant role reads granted RFC logs
- **WHEN** an institution role reads a log for a granted RFC
- **THEN** Firestore permits the read

#### Scenario: Tenant role is blocked from cross-tenant logs
- **WHEN** an institution role reads a log for another RFC
- **THEN** Firestore denies the read

#### Scenario: User reads own account logs
- **WHEN** an authenticated user reads a log with `RFC: null` and their own `userId`
- **THEN** Firestore permits the read

#### Scenario: User is blocked from another account logs
- **WHEN** an authenticated user reads a log with `RFC: null` and a different `userId`
- **THEN** Firestore denies the read

### Requirement: Logs filters and ordering
The system SHALL provide domain-appropriate log filtering without exposing categories outside the page scope.

#### Scenario: Date preset filters
- **WHEN** a user selects a date preset
- **THEN** the page applies the defined local-time timestamp range for that preset
- **AND** the preset labels are shown in Spanish as complete words

#### Scenario: Unbounded date preset
- **WHEN** a user leaves the date preset as `TODO`
- **THEN** the page omits date constraints from the log query
- **AND** the page loads additional records through pagination or incremental loading when more records exist

#### Scenario: Custom date filter
- **WHEN** a user selects custom start and end dates
- **THEN** the query uses the start date at `00:00:00.000` and the end date at `23:59:59.999`

#### Scenario: Incomplete custom date range
- **WHEN** a user selects custom range without both start and end dates
- **THEN** the page clears current results
- **AND** the page does not fetch logs until both dates are set and valid

#### Scenario: Invalid custom date range
- **WHEN** a user selects an end date before the start date
- **THEN** the page shows a validation error and does not run the invalid query

#### Scenario: Category options are domain-scoped
- **WHEN** a user opens a logs page
- **THEN** category filter options are limited to `USER_ACCOUNT_*` for account, `INSTITUTION_*` and `PUI_*` for app, and all categories for admin
- **AND** the first unfiltered option is labeled `TODO`

#### Scenario: Sort order can be changed
- **WHEN** a user selects `ASC` or `DESC`
- **THEN** logs are queried and displayed in the selected `createdAt` order

### Requirement: Logs table personalization
The system SHALL allow users to personalize visible log columns without changing export content.

#### Scenario: Default visible columns
- **WHEN** a user opens a logs page without saved preferences
- **THEN** the table shows date, RFC, category, origin, execution email, and execution role by default

#### Scenario: Column preferences persist
- **WHEN** a user changes visible columns
- **THEN** the preference is persisted in browser storage for that logs page scope

#### Scenario: Required columns remain visible
- **WHEN** a user changes visible columns
- **THEN** `Fecha` and `Categoría` remain selected and cannot be disabled

#### Scenario: App logs hide userId column
- **WHEN** a user opens `/app/:rfc/logs`
- **THEN** the `userId` column is not available for display personalization

#### Scenario: Account logs hide domain-only columns
- **WHEN** a user opens `/account/logs`
- **THEN** execution role, permission-impact, and search-request columns are not available for display personalization

### Requirement: Emulator logs seed data
The local emulator seed SHALL include enough deterministic tenant logs to validate filters and pagination manually.

#### Scenario: Default RFC logs are seeded
- **WHEN** emulator seed data is loaded
- **THEN** at least 100 logs exist for `DEFAULT_RFC`
- **AND** seeded logs include both `INSTITUTION_*` and `PUI_*` categories

### Requirement: Institution creation audit payload
Institution onboarding audit logs SHALL keep institution creation and permission creation impacts distinct.

#### Scenario: Institution creation has no permission impact
- **WHEN** institution onboarding creates its audit logs
- **THEN** the `INSTITUTION_CREATION` log has empty impact data
- **AND** the `INSTITUTION_PERMISSION_CREATION` log contains the created admin permission impact data

### Requirement: Logs pagination and export
The system SHALL support large log result sets through pagination, incremental loading, and bounded CSV export.

#### Scenario: Paged result mode
- **WHEN** page size is `20`, `50`, or `100`
- **THEN** the page uses cursor-backed pagination for logs

#### Scenario: All records mode
- **WHEN** page size is `All`
- **THEN** the page hides pagination and loads records in batches of 100 as the user scrolls

#### Scenario: CSV export includes all fields
- **WHEN** a user exports CSV
- **THEN** the CSV includes all planned log fields even if some columns are hidden in the table

#### Scenario: CSV export is capped
- **WHEN** more than 1000 records match the current filters
- **THEN** the export includes only the first 1000 records in selected order and warns the user

### Requirement: Admin tenant log filtering
The system SHALL allow system administrators to filter logs by tenant using institution records.

#### Scenario: Tenant filter options are listed
- **WHEN** a system administrator opens `/admin/logs`
- **THEN** the tenant filter includes institution collection records plus `DEFAULT_RFC`, labeled with institution name and RFC

#### Scenario: Tenant filter options are sorted
- **WHEN** tenant filter options are shown
- **THEN** they are sorted alphabetically by institution name and then RFC

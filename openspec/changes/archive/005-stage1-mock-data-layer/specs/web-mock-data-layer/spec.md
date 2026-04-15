## ADDED Requirements

### Requirement: Mock data models one tenant institution and one provider context
The web mock data layer SHALL seed one tenant institution for `DEFAULT_RFC` and one reserved provider context for `SYSTEM_RFC`, where `SYSTEM_RFC` is not included in tenant institution lists.

#### Scenario: Institution list excludes provider context
- **WHEN** the mock institution repository lists tenant institutions
- **THEN** the result contains the `DEFAULT_RFC` institution and does not contain a `SYSTEM_RFC` institution

#### Scenario: System administrator permission exists
- **WHEN** the mock permission repository lists permissions for the mock user
- **THEN** the result includes a `SYSTEM_RFC` permission with role `SYSTEM_ADMINISTRATOR`

#### Scenario: Institution administrator permission exists
- **WHEN** the mock permission repository lists permissions for the mock user
- **THEN** the result includes a `DEFAULT_RFC` permission with role `INSTITUTION_ADMIN`

### Requirement: Mock data operations are asynchronous
The web mock data layer SHALL expose all repository and service data operations as asynchronous operations returning promises.

#### Scenario: Mock repository operation
- **WHEN** a page controller requests the current mock institution
- **THEN** the repository returns the result through a promise

#### Scenario: Mock mutation operation
- **WHEN** a page controller submits a mock permission update
- **THEN** the service exposes the mutation as an awaited asynchronous operation

### Requirement: Mock controllers simulate API response delay
The web mock data layer SHALL define `MOCK_MILLISECONDS_RESPONSE_DELAY` as the centralized mock response delay constant and SHALL apply that delay in data controllers or composables that load, save, reset, or mutate mock-backed page data.

#### Scenario: Page load delay
- **WHEN** a mock-backed page controller loads data
- **THEN** it waits for `MOCK_MILLISECONDS_RESPONSE_DELAY` before resolving the page loading operation

#### Scenario: Page save delay
- **WHEN** a mock-backed page controller saves or mutates data
- **THEN** it waits for `MOCK_MILLISECONDS_RESPONSE_DELAY` while the page saving state is active

#### Scenario: Repository tests remain fast
- **WHEN** mock repository and service tests run
- **THEN** they can exercise data behavior without waiting for controller-level response delay

### Requirement: Mock CRUD persists locally and can reset
The web mock data layer SHALL persist mock CRUD changes to LocalStorage and SHALL provide a reset operation that restores canonical seed data.

#### Scenario: Persisted mock change
- **WHEN** a mock service updates a supported entity
- **THEN** the updated mock state is written to LocalStorage

#### Scenario: Reset mock state
- **WHEN** the user triggers mock data reset
- **THEN** LocalStorage-backed mock state is cleared and canonical seed data is restored

#### Scenario: Invalid persisted state
- **WHEN** LocalStorage contains invalid mock state
- **THEN** the mock storage layer falls back to canonical seed data and emits a system message

### Requirement: Controllers prepare future page data access
The web mock data layer SHALL provide page-oriented controllers or composables for mock-backed data loading and mutations, while business view implementation remains out of scope for this change.

#### Scenario: Controller loads data
- **WHEN** a future mock-backed page needs data
- **THEN** the corresponding controller or composable exposes an async loading operation

#### Scenario: Controller submits mutation
- **WHEN** a future mock-backed page needs to submit a mutation
- **THEN** the corresponding controller or composable exposes an async mutation operation

#### Scenario: Existing placeholders remain
- **WHEN** this change is applied
- **THEN** existing placeholder pages are not replaced by business views

### Requirement: Data operation errors are typed and safe
The web mock data layer SHALL represent data operation failures with typed web errors, log technical diagnostics through system messages, and expose safe user-facing messages to pages.

#### Scenario: Validation failure
- **WHEN** a mock service rejects invalid input
- **THEN** the controller receives a validation error with safe field information and logs a data validation system message

#### Scenario: Missing entity
- **WHEN** a repository cannot find a requested entity
- **THEN** it reports a not-found data error and the page can render a safe not-found message

#### Scenario: Storage failure
- **WHEN** mock state cannot be persisted
- **THEN** the storage layer reports a storage error and logs a system message without exposing sensitive values

### Requirement: Data layer operations have success and error coverage
The web mock data layer SHALL include tests for successful and failing paths of repositories, services, stores, and controllers before follow-up UI/UX changes consume those operations.

#### Scenario: Repository success coverage
- **WHEN** a repository operation is implemented
- **THEN** tests cover its successful result shape and relevant filtering behavior

#### Scenario: Repository error coverage
- **WHEN** a repository operation can fail because an entity is missing or persisted state is invalid
- **THEN** tests cover the typed error or fallback behavior

#### Scenario: Service success coverage
- **WHEN** a service mutation succeeds
- **THEN** tests cover the returned entity, persisted state, update history, and log side effects where applicable

#### Scenario: Service error coverage
- **WHEN** a service mutation receives invalid, forbidden, conflicting, or missing data
- **THEN** tests cover the typed error and verify that invalid mutations do not corrupt mock state

#### Scenario: Controller state coverage
- **WHEN** a controller load or mutation succeeds or fails
- **THEN** tests cover loading, saving, error, and reset state transitions without mounting business views

### Requirement: Route context preserves provider and tenant separation
The mock data layer SHALL preserve the existing route context rule where `/admin` operates with active `SYSTEM_RFC` context while inspecting the `DEFAULT_RFC` tenant, and `/app` operates with active `DEFAULT_RFC` tenant context.

#### Scenario: System administrator accesses admin
- **WHEN** the active role is `SYSTEM_ADMINISTRATOR` and the active context is `SYSTEM_RFC`
- **THEN** `/admin` routes are allowed and tenant inspection links target `DEFAULT_RFC`

#### Scenario: System administrator uses tenant context
- **WHEN** the active role is `SYSTEM_ADMINISTRATOR` and the active context is `DEFAULT_RFC`
- **THEN** guarded admin navigation is rejected

#### Scenario: Institution administrator uses provider context
- **WHEN** the active role is `INSTITUTION_ADMIN` and the active context is `SYSTEM_RFC`
- **THEN** guarded app navigation is rejected

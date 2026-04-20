### Requirement: Firebase Auth Emulator owns local authentication

The system SHALL authenticate local development users through Firebase Auth Emulator using email/password and SHALL NOT use a web runtime mock auth service.

#### Scenario: Valid emulator login
- **WHEN** a seeded emulator user signs in with valid credentials
- **THEN** Firebase Auth returns an authenticated user
- **AND** the application resolves the user's available PUIntegra contexts from Firestore data

#### Scenario: Invalid emulator login
- **WHEN** sign-in fails through Firebase Auth
- **THEN** the login page shows safe auth error copy
- **AND** no mock auth error contract is used

### Requirement: App context is derived from Firestore permissions

The system SHALL derive available role/RFC contexts from Firestore-backed permission records tied to the authenticated Firebase user.

#### Scenario: Multiple contexts require selection
- **WHEN** the authenticated user has multiple granted permission contexts
- **THEN** the application requires explicit context selection before navigating into protected domains

#### Scenario: Invalid saved context is cleared
- **WHEN** a saved app context is no longer present in granted permissions
- **THEN** the saved context is cleared
- **AND** the user must select a valid context or logout

### Requirement: Firestore Emulator owns local domain data

The system SHALL read local users, institutions, permissions, contacts, requests, findings, and logs from Firestore Emulator using existing shared Zod schemas for validation.

#### Scenario: Firestore reads validate shared contracts
- **WHEN** domain data is read from Firestore Emulator
- **THEN** each record is validated with the corresponding shared Zod schema before entering Pinia state

#### Scenario: Auth-created user profile
- **WHEN** the Auth Emulator creates a local user
- **THEN** the API Auth `onCreate` trigger creates the matching `users/{uid}` Firestore profile
- **AND** the Firestore seed script does not write the `users` collection directly
- **AND** the `USER_ACCOUNT_CREATION` log leaves execution actor fields empty because the backend trigger is the executor
- **AND** the created account is recorded as the impacted user

#### Scenario: Login and logout audit logs
- **WHEN** an authenticated web session is established or closed
- **THEN** the web app reports the event to the API with the Firebase ID token
- **AND** the API writes the corresponding `USER_ACCOUNT_LOGIN` or `USER_ACCOUNT_LOGOUT` log after verifying the token
- **AND** the log uses a server-generated Firestore document ID
- **AND** the log uses `RFC: null` because login and logout are account-level actions
- **AND** `originTraceId` is populated from an available execution/trace identifier or a server-generated fallback

#### Scenario: Auth API and trigger failures are logged safely
- **WHEN** an Auth audit route or Auth trigger fails
- **THEN** the backend writes a structured Firebase Functions error log with sanitized context
- **AND** HTTP callers receive the shared API error envelope without internal exception details
- **AND** trigger failures are rethrown so Firebase marks the invocation as failed

#### Scenario: API responses use a standard envelope
- **WHEN** an API endpoint returns success or failure
- **THEN** the response validates against the shared API response schema
- **AND** failures include a stable machine error code
- **AND** failures may include UI message keys, parameters, and safe server-authored fallback copy when server-owned policy or timing requires it

#### Scenario: Function implementations are isolated
- **WHEN** the API package exports Firebase functions
- **THEN** deployed function implementations live under `packages/api/src/functions`
- **AND** `packages/api/src/index.ts` only re-exports deployed functions

### Requirement: Runtime mock layer is removed from web

The web package SHALL NOT contain runtime mock backend modules, mock stores, mock composables, or app-facing `MOCK_*` contracts after this change.

#### Scenario: Web package imports
- **WHEN** searching `packages/web/src`
- **THEN** there are no imports from `@/mock`
- **AND** `packages/web/src/bom.ts` does not export mock runtime internals

### Requirement: Emulator seed data is deterministic

The system SHALL provide scripts that seed Firebase Auth Emulator and Firestore Emulator with deterministic local development data.

#### Scenario: Seeded emulator state
- **WHEN** the seed script completes against running emulators
- **THEN** the Auth Emulator contains the development users
- **AND** the seeded Auth Emulator password is deterministic local-only data
- **AND** Firestore Emulator contains records accepted by shared domain schemas
- **AND** account-level `users` and `logs` records are created by Auth/API functions instead of direct seed writes

### Requirement: MFA is deferred

The system SHALL NOT require MFA in the Firebase Emulator implementation.

#### Scenario: Login without MFA
- **WHEN** a seeded user logs in locally
- **THEN** email/password authentication is sufficient
- **AND** no MFA enrollment or challenge is required

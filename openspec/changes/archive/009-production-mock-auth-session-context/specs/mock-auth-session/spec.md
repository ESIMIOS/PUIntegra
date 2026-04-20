## ADDED Requirements

### Requirement: Mock auth backend boundary validates credentials
The system SHALL authenticate users through a web mock auth service that validates an existing user email, a valid mock password, and at least one granted permission before an authenticated session can be created.

#### Scenario: Valid credentials with permissions
- **WHEN** a user submits a known email and valid password for a user with granted permissions
- **THEN** the mock auth service returns the user profile and available permission contexts without selecting a context implicitly

#### Scenario: Unknown email
- **WHEN** a user submits an email that does not match a mock credential and user record
- **THEN** the mock auth service rejects the login with a safe invalid-credentials response

#### Scenario: Invalid password
- **WHEN** a user submits a known email with an invalid password
- **THEN** the mock auth service rejects the login with a safe invalid-credentials response

#### Scenario: No granted permissions
- **WHEN** a user submits valid credentials but has no granted permissions
- **THEN** the mock auth service rejects the login with a safe no-access response

### Requirement: Mock auth throttles repeated failures
The system SHALL lock login attempts for an email for 60 seconds after 5 failed credential attempts.

#### Scenario: Lockout starts after repeated failures
- **WHEN** the same email reaches 5 failed credential attempts
- **THEN** the mock auth service rejects further attempts for that email until the 60-second lockout expires

#### Scenario: Lockout message can show remaining time
- **WHEN** the login page receives a lockout response
- **THEN** the page shows an accessible user-facing message with remaining lockout time

### Requirement: Auth session persists until logout
The system SHALL persist authenticated session state in localStorage separately from the mock dataset and hydrate it across page reloads until explicit logout.

#### Scenario: Session hydrates from valid storage
- **WHEN** the application starts with a valid persisted mock auth session
- **THEN** the auth store is populated with user identity, active role, active RFC, and available contexts

#### Scenario: Invalid persisted session is cleared
- **WHEN** the application starts with a persisted session that no longer matches the current mock dataset or granted permissions
- **THEN** the auth session is cleared and the user is treated as anonymous

#### Scenario: Logout clears persisted auth session
- **WHEN** logout is completed
- **THEN** the persisted auth session is removed and the auth store returns to anonymous state

### Requirement: Login requires explicit context selection
The system SHALL require a user to select a role/RFC context after successful credential validation when multiple valid permissions are available.

#### Scenario: Multiple permissions require selection
- **WHEN** a valid login returns more than one granted permission context
- **THEN** the login page shows a context selection step and does not navigate until a context is selected

#### Scenario: Institution context selection
- **WHEN** a user selects an institution role context
- **THEN** the system sets the active role and RFC and navigates to the selected institution dashboard

#### Scenario: System context selection
- **WHEN** a user selects the system administrator context
- **THEN** the system sets the active role to system administrator, uses the reserved system RFC, and navigates to the admin institutions page

### Requirement: Logout route completes logout with timed redirect
The system SHALL make `/auth/logout` clear the current auth session, show a completion message with progress, and redirect to `/auth/login` after 15 seconds.

#### Scenario: Direct logout route
- **WHEN** an authenticated or anonymous user opens `/auth/logout`
- **THEN** the route clears any persisted session and displays a logout completion state

#### Scenario: Timed redirect completes
- **WHEN** the logout completion state has been visible for 15 seconds
- **THEN** the system redirects to `/auth/login`

#### Scenario: Immediate login action
- **WHEN** the user activates the immediate login action on the logout page
- **THEN** the system navigates to `/auth/login` without waiting for the timer

### Requirement: Header session context is standalone
The system SHALL render authenticated user identity and active context in `HeaderSessionContext.vue` from session stores/services without requiring identity props from layouts.

#### Scenario: Header renders real identity
- **WHEN** an authenticated shell renders the header
- **THEN** the header shows the current user's name, email or icon fallback, active role, and active RFC from session state

#### Scenario: Account menu opens from identity trigger
- **WHEN** the user activates the name/icon trigger
- **THEN** the header opens a Vuestic menu with Account domain links and a logout action

#### Scenario: Header logout requires confirmation
- **WHEN** the user chooses logout from the header menu
- **THEN** the header shows a confirmation modal before routing to `/auth/logout`

#### Scenario: Context modal opens from role RFC trigger
- **WHEN** the user activates the role/RFC trigger
- **THEN** the header opens a modal listing all available role/RFC contexts based on granted permissions

#### Scenario: Header context switch navigates safely
- **WHEN** the user selects a different available context from the header modal
- **THEN** the system updates active role/RFC and navigates to the safe landing page for that context

### Requirement: Auth actions are audited through existing logging contracts
The system SHALL log successful login and logout actions through the mock backend layer using existing auth log categories and `SYSTEM_AUTH_TRIGGER`.

#### Scenario: Successful login log
- **WHEN** a user completes login and context selection
- **THEN** the mock backend layer appends a `USER_ACCOUNT_LOGIN` log entry for the authenticated user

#### Scenario: Successful logout log
- **WHEN** a user completes logout
- **THEN** the mock backend layer appends a `USER_ACCOUNT_LOGOUT` log entry for the authenticated user when a user was active

#### Scenario: Failed attempt technical logging
- **WHEN** invalid credentials or lockout prevent login
- **THEN** the system records a technical system message without adding unsupported domain log categories

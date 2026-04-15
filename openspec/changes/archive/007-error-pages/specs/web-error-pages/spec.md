## Requirements

### Requirement: Documented error routes render user-facing pages

The web app SHALL render production-ready pages for `/error/403`, `/error/404`, and `/error/500`.

#### Scenario: Forbidden error

- **WHEN** the user visits `/error/403`
- **THEN** the page explains in Spanish that the current account or context cannot access that area
- **AND** the page renders a distinct humorous blocked-access graphic.

#### Scenario: Not found error

- **WHEN** the user visits `/error/404`
- **THEN** the page explains in Spanish that the requested page is unavailable or does not exist
- **AND** the page renders a distinct humorous lost/search graphic.

#### Scenario: System error

- **WHEN** the user visits `/error/500`
- **THEN** the page explains in Spanish that the product could not complete the operation
- **AND** the page renders a distinct humorous system-failure graphic.

### Requirement: Error pages provide context-aware recovery

The web app SHALL derive the primary recovery action from the current auth role and active institution context.

#### Scenario: Anonymous user recovery

- **GIVEN** the current user is anonymous
- **WHEN** an error page is rendered
- **THEN** the primary action points to `/auth/login`.

#### Scenario: Institutional user recovery

- **GIVEN** the current user has an institutional role
- **AND** an active RFC exists
- **WHEN** an error page is rendered
- **THEN** the primary action points to `/app/{RFC}/dashboard`.

#### Scenario: System administrator recovery

- **GIVEN** the current user is `SYSTEM_ADMINISTRATOR`
- **WHEN** an error page is rendered
- **THEN** the primary action points to `/admin/institutions`.

#### Scenario: Incomplete authenticated context

- **GIVEN** the current user is authenticated
- **AND** no valid operational recovery target can be derived
- **WHEN** an error page is rendered
- **THEN** the primary action points to `/account/settings`.

### Requirement: Login recovery redirects automatically

The web app SHALL automatically redirect to login after 15 seconds only when the derived primary recovery action is `/auth/login`.

#### Scenario: Login countdown starts

- **GIVEN** the primary recovery action is `/auth/login`
- **WHEN** an error page is mounted
- **THEN** a visible countdown bar is shown
- **AND** the app redirects to `/auth/login` after 15 seconds.

#### Scenario: Non-login targets do not auto-redirect

- **GIVEN** the primary recovery action is not `/auth/login`
- **WHEN** an error page is mounted
- **THEN** no automatic redirect runs.

#### Scenario: Recovery target changes

- **GIVEN** an error page is mounted
- **WHEN** auth, role, or active RFC state changes the derived target away from `/auth/login`
- **THEN** the login countdown is cancelled.

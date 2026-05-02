## Requirements

### Requirement: Environment deploys publish web and API together

The system SHALL deploy Firebase Hosting and Firebase Functions together for the stage and production environments.

#### Scenario: Staging branch deploys staging project

- **WHEN** a qualifying commit is pushed to `stage`
- **THEN** CI deploys Hosting and Functions to Firebase project `puintegra-staging`

#### Scenario: Main branch deploys production project

- **WHEN** a qualifying commit is pushed to `main`
- **THEN** CI deploys Hosting and Functions to Firebase project `puintegra-production`

### Requirement: Deploys run repository quality gates

The system SHALL run dependency installation, typecheck, lint, tests, web build, and API build before deploying an environment.

#### Scenario: Quality gate fails

- **WHEN** any required validation or build step fails
- **THEN** CI MUST stop before deploying to Firebase

### Requirement: Public runtime configuration comes from mode files

The system SHALL keep non-secret public `VITE_*` runtime configuration in committed mode files and keep deploy credentials outside source control.

#### Scenario: CI builds an environment

- **WHEN** CI builds staging or production
- **THEN** Vite receives Firebase and Sentry public runtime values from `.env.staging` or `.env.production`

#### Scenario: CI deploys an environment

- **WHEN** CI deploys staging or production
- **THEN** Firebase CLI resolves the target project from `VITE_FIREBASE_PROJECT_ID` in the matching mode file
- **AND** Firebase service account JSON remains in GitHub repository secrets

### Requirement: Deploys bootstrap system administrator permission

The system SHALL idempotently ensure a configured email has a granted `SYSTEM_ADMINISTRATOR` permission on `SYSTEM_RFC` after stage and production deploys.

#### Scenario: Bootstrap email is configured

- **WHEN** a stage or production deploy completes
- **THEN** CI writes or preserves the deterministic system administrator permission for the configured bootstrap email

#### Scenario: Real user credentials are needed

- **WHEN** the bootstrap person needs to access staging or production
- **THEN** the person MUST create or recover their Firebase Auth account through the user-facing auth flow rather than receiving a password from seed data

### Requirement: Production is exposed through the PUIntegra application hostname

The system SHALL expose production through Firebase Hosting custom domain `app.puintegra.com`, with DNS managed in the Cloudflare `puintegra.com` zone.

#### Scenario: Production domain is configured

- **WHEN** Firebase Hosting has verified `app.puintegra.com` and provisioned its certificate
- **THEN** Cloudflare may proxy the hostname and enforce public WAF protections

### Requirement: Government API egress is backend-owned

The system SHALL treat fixed IPv4 egress for future government PUI API calls as a backend integration concern separate from user-facing web ingress.

#### Scenario: Backend notifies government PUI API

- **WHEN** a backend action calls the government PUI API
- **THEN** the call MUST originate from backend infrastructure routed through a reserved static IPv4 egress path

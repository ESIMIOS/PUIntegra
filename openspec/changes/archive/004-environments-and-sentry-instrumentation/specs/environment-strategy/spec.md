## ADDED Requirements

### Requirement: Three named environments
The system SHALL define exactly three environments: `development`, `staging`, and `production`. Each environment SHALL map to a dedicated Firebase project.

- `development` is **local only** — used by developers on feature branches via `vite dev`. It is NOT deployed automatically by CI.
- `staging` and `production` are deployed automatically by GitHub Actions.

#### Scenario: Developer identifies current environment
- **WHEN** code reads `import.meta.env.VITE_APP_ENV`
- **THEN** the value is one of `development`, `staging`, or `production`

---

### Requirement: Per-environment Vite mode files
The frontend build system SHALL use Vite mode files to supply environment-specific variables without requiring manual developer configuration.

| File | Loaded when |
|---|---|
| `.env.development` | `vite dev` or `vite build --mode development` |
| `.env.staging` | `vite build --mode staging` |
| `.env.production` | `vite build` or `vite build --mode production` |

#### Scenario: Staging build
- **WHEN** CI runs `vite build --mode staging`
- **THEN** `VITE_APP_ENV` resolves to `staging` without any manual override

#### Scenario: Production build
- **WHEN** CI runs `vite build --mode production`
- **THEN** `VITE_APP_ENV` resolves to `production` without any manual override

---

### Requirement: Firebase project aliases
The repository SHALL contain a `.firebaserc` file mapping project aliases to Firebase project IDs so that `firebase deploy --project <alias>` targets the correct project.

#### Scenario: Staging deployment
- **WHEN** CI runs `firebase deploy --project staging`
- **THEN** the command targets the staging Firebase project

#### Scenario: Production deployment
- **WHEN** CI runs `firebase deploy --project production`
- **THEN** the command targets the production Firebase project

---

### Requirement: Branch-based automated deployment
The CI pipeline SHALL automatically deploy to the corresponding Firebase environment based on the Git branch that received a push.

| Branch | Deploys to |
|---|---|
| `stage` | staging |
| `main` | production |

#### Scenario: Push to stage
- **WHEN** a commit is pushed to the `stage` branch
- **THEN** the CI pipeline builds with `--mode staging` and deploys to the staging Firebase project

#### Scenario: Push to main
- **WHEN** a commit is pushed to the `main` branch
- **THEN** the CI pipeline builds with `--mode production` and deploys to the production Firebase project

---

### Requirement: VITE_APP_ENV as canonical environment identifier
All tooling (Sentry, future feature flags, logging) SHALL read the environment from `VITE_APP_ENV`. The variable `VITE_SENTRY_ENVIRONMENT` SHALL NOT be used.

#### Scenario: Sentry event tagged with environment
- **WHEN** a Sentry event is captured in any environment
- **THEN** the event's `environment` field matches the value of `VITE_APP_ENV`

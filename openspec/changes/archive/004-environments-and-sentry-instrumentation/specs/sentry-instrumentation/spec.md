## ADDED Requirements

### Requirement: Sentry initialisation gated on DSN env var
The system SHALL initialise the Sentry SDK only when `VITE_SENTRY_DSN` is a non-empty string. When the variable is absent or empty the plugin SHALL exit silently without calling `Sentry.init`, leaving all monitoring no-ops.

#### Scenario: DSN present at app startup
- **WHEN** `VITE_SENTRY_DSN` is set and non-empty
- **THEN** `Sentry.init` is called with the provided DSN, the configured environment, release, and Vue Router integration

#### Scenario: DSN absent at app startup
- **WHEN** `VITE_SENTRY_DSN` is undefined or an empty string
- **THEN** `Sentry.init` is NOT called and no Sentry SDK methods are invoked during the session

---

### Requirement: Enriched event scope
Every Sentry event SHALL carry the following context fields, populated from the active auth state:

| Field | Sentry mapping | Source |
|---|---|---|
| `userId` | `Sentry.setUser({ id })` | `authStore.uid` |
| `tenantRfc` | `Sentry.setTag('tenantRfc', ...)` | `authStore.currentRfc` |
| `route` | automatic via router integration | Vue Router |
| `role` | `Sentry.setTag('role', ...)` | `authStore.role` |

#### Scenario: User authenticates
- **WHEN** `authStore.isAuthenticated` becomes `true`
- **THEN** `Sentry.setUser` is called with the current `uid` and `Sentry.setTag` is called with `tenantRfc` and `role`

#### Scenario: User logs out
- **WHEN** `authStore.isAuthenticated` becomes `false`
- **THEN** `Sentry.setUser(null)` is called to clear the user context

---

### Requirement: Vue Router transaction tracking
The Sentry plugin SHALL integrate with Vue Router so that every route navigation creates a Sentry transaction named after the route's `name` field.

#### Scenario: Route navigation occurs
- **WHEN** the user navigates to any named route
- **THEN** a Sentry transaction is created with the route name as its transaction name

---

### Requirement: PII scrubbing before event submission
The system SHALL strip the query parameters `token`, `password`, and `code` from event URLs before they are sent to Sentry.

#### Scenario: Event URL contains sensitive query params
- **WHEN** an error event URL includes query parameters named `token`, `password`, or `code`
- **THEN** those parameter values SHALL be replaced with `[Filtered]` in the event payload via a `beforeSend` hook

---

### Requirement: Sentry sampling rates
The Sentry initialisation SHALL use the following default sampling rates to prevent quota exhaustion:
- `tracesSampleRate`: `0.1` (10 % of performance transactions)
- `replaysSessionSampleRate`: `0` (session replay disabled)

#### Scenario: App runs in production
- **WHEN** the app is initialised with a valid DSN in `production` environment
- **THEN** only 10 % of transactions are sent to Sentry and session replay data is never captured

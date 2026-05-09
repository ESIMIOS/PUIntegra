## ADDED Requirements

### Requirement: Protected API-boundary writes enforce throttling before mutation
The system SHALL evaluate server-owned throttling before executing protected auth lifecycle and RFC-scoped API mutations that require the API boundary.

#### Scenario: Auth lifecycle route is throttled
- **WHEN** a protected auth route receives a request
- **THEN** the API resolves the route endpoint key, evaluates every configured throttle dimension, and only continues to business logic when all dimensions remain under quota

#### Scenario: RFC-scoped mutation route is throttled
- **WHEN** an RFC-scoped protected mutation route receives a request
- **THEN** the API includes the normalized RFC in the applicable throttle subjects before executing the mutation

## ADDED Requirements

### Requirement: Distributed API throttling uses shared runtime state
The system SHALL enforce protected API throttling with Firestore-backed runtime configuration and counter state that is shared across API instances.

#### Scenario: Endpoint config exists
- **WHEN** a throttled endpoint receives a request and a matching `apiThrottleConfigs/{endpointKey}` document exists
- **THEN** the API loads the document, validates it with the shared throttle config schema, and uses its dimension policies for enforcement

#### Scenario: Endpoint config is missing
- **WHEN** a throttled endpoint receives a request and no matching config document exists
- **THEN** the API uses shared fallback throttle defaults exported from `packages/shared`

### Requirement: Throttling is enforced by simple applied dimensions
The system SHALL reject a request when any configured throttle dimension that applies to the request exceeds quota within its configured fixed window.

#### Scenario: One dimension exceeds quota
- **WHEN** a request remains under quota for some applied dimensions but exceeds quota for one applied dimension
- **THEN** the API rejects the request with a safe over-quota response

#### Scenario: All dimensions remain under quota
- **WHEN** a request remains under quota for every configured endpoint dimension
- **THEN** the API allows the request to continue to business logic

### Requirement: Counter records are normalized and TTL-managed
The system SHALL persist counter records with normalized readable subjects and TTL metadata so expired windows can be ignored immediately and deleted later by Firestore TTL.

#### Scenario: Counter is created for a dimension
- **WHEN** the API records a counter increment for an endpoint dimension
- **THEN** it writes `endpointKey`, `dimensionKey`, `subjectKey`, structured `subject`, `count`, `windowStart`, `windowMs`, `createdAt`, `updatedAt`, and `expiresAt`

#### Scenario: Counter document ID stays stable across windows
- **WHEN** the API increments counters for the same `endpointKey`, `dimensionKey`, and `subjectKey` in different fixed windows
- **THEN** it reuses the same document ID
- **AND** resets the stored counter state when the persisted window no longer matches the current fixed window

#### Scenario: Counter window has expired logically
- **WHEN** the API evaluates a counter document whose `windowStart + windowMs` is older than the current request time
- **THEN** the API treats the counter as expired even if Firestore TTL has not deleted the document yet

### Requirement: Over-quota responses are safe and generic
The system SHALL return one generic API throttle error contract for over-quota requests without exposing sensitive request data.

#### Scenario: Request is over quota
- **WHEN** any configured throttle dimension rejects a request
- **THEN** the API responds with HTTP `422`
- **AND** includes only safe details for `endpointKey`, `dimensionKey`, `maxRequests`, `windowMs`, and `retryAfterSeconds`

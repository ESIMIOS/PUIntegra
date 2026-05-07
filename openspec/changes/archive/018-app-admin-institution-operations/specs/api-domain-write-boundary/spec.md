## MODIFIED Requirements

### Requirement: App-domain institution-admin writes use the API boundary

The system SHALL perform institution-admin app-domain writes for contacts, shared secret, and permissions through authenticated HTTP services in `packages/api`, not through direct client Firestore writes.

#### Scenario: Browser submits contact slot mutation

- **WHEN** the app admin contacts page submits a create or update action for a canonical contact slot
- **THEN** the browser sends the mutation through an authenticated HTTP endpoint
- **AND** the browser does not write the contact record directly through the Firebase SDK

#### Scenario: Browser submits shared-secret mutation

- **WHEN** the app admin settings page submits a shared-secret create or rotation action
- **THEN** the browser sends the mutation through an authenticated HTTP endpoint
- **AND** the browser does not write institution secret fields directly through the Firebase SDK

#### Scenario: Browser submits permission creation

- **WHEN** the app admin permissions page submits a permission creation request
- **THEN** the browser sends the mutation through an authenticated HTTP endpoint
- **AND** the browser does not create permission records directly through the Firebase SDK

#### Scenario: Browser submits permission edit

- **WHEN** the app admin permissions page submits a permission role or status update
- **THEN** the browser sends the mutation through an authenticated HTTP endpoint
- **AND** the browser does not update permission records directly through the Firebase SDK

#### Scenario: Server validates actor role and RFC context before writes

- **WHEN** the API receives an institution-admin app-domain mutation request
- **THEN** the server validates the authenticated actor role and RFC context before any write occurs

#### Scenario: Server validates payloads with shared Zod contracts

- **WHEN** the API receives a contact, shared-secret, or permission mutation payload
- **THEN** the server validates the request payload with shared Zod contracts before service logic runs

#### Scenario: Successful mutations emit the correct audit log categories

- **WHEN** an institution-admin app-domain mutation succeeds
- **THEN** the server writes the correct audit log category for the mutation type

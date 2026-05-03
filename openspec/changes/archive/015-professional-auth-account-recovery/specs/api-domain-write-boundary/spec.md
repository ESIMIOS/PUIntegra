## ADDED Requirements

### Requirement: Auth lifecycle policy operations use the API boundary
The system SHALL route auth lifecycle operations that require PUIntegra policy, abuse controls, or audit logging through HTTP services in `packages/api`.

#### Scenario: Browser requests account creation policy
- **WHEN** the account creation page needs to validate PUIntegra registration eligibility
- **THEN** the browser sends the policy request to a public auth lifecycle API endpoint
- **AND** the API validates normalized email eligibility against existing shared contracts before account creation proceeds

#### Scenario: Browser requests password recovery
- **WHEN** the forgot password page submits a recovery request
- **THEN** the browser sends the request to a public auth lifecycle API endpoint
- **AND** the API applies abuse controls before requesting Firebase reset email delivery
- **AND** the response uses the shared API response envelope with neutral user-facing copy

#### Scenario: Browser completes password reset audit
- **WHEN** the reset password page successfully confirms a Firebase password reset
- **THEN** the browser or API records the account-level password update through a server-owned audit path
- **AND** the audit path does not include passwords, action codes, or full action URLs

#### Scenario: Browser records verification and MFA policy events
- **WHEN** email verification, verification resend, MFA enrollment, or throttling events require durable audit or policy tracking
- **THEN** the browser sends only sanitized metadata to the auth lifecycle API
- **AND** the API writes logs server-side with `RFC: null`

#### Scenario: Administrator resets lost MFA access
- **WHEN** an authorized administrator submits an approved MFA reset for a user who lost authenticator access
- **THEN** the browser sends the request to an authenticated admin API endpoint
- **AND** the API removes or resets the Firebase TOTP enrollment through a server-owned path
- **AND** the API writes a sanitized `USER_ACCOUNT_MFA_UNENROLL` account-level audit log

#### Scenario: API responses are safe
- **WHEN** an auth lifecycle API endpoint rejects a request
- **THEN** the response omits internal Firebase errors, account existence details, permission inventory details, and secret-bearing values

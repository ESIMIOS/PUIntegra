## ADDED Requirements

### Requirement: Permission-gated account creation
The system SHALL allow public account creation only for normalized email addresses that have at least one granted PUIntegra permission and no existing Firebase Auth account conflict.

#### Scenario: Granted email creates account
- **WHEN** a user submits `/auth/create-account` with a valid email, compliant password, and matching confirmation for an email with at least one `GRANTED` permission
- **THEN** the system creates the Firebase Auth account
- **AND** sends an email verification action
- **AND** does not establish a PUIntegra application session until the email is verified

#### Scenario: Email has no granted permission
- **WHEN** a user submits `/auth/create-account` with an email that has no `GRANTED` permission
- **THEN** the system rejects account creation
- **AND** shows a safe user-facing response that does not expose permission inventory details

#### Scenario: Account already exists
- **WHEN** a user submits `/auth/create-account` for an email that already has a Firebase Auth account
- **THEN** the system does not create a duplicate account
- **AND** guides the user toward login or password recovery without exposing internal account state beyond the recovery path

#### Scenario: Direct provider signup is not enough
- **WHEN** a caller attempts to create a Firebase Auth account outside the PUIntegra web flow
- **THEN** provider-side policy denies unauthorized account creation when production registration gating is approved and enabled

### Requirement: Verified-email access gate
The system MUST require Firebase email verification before resolving PUIntegra permission contexts or entering protected domains.

#### Scenario: Unverified user signs in
- **WHEN** a Firebase Auth user with `emailVerified` equal to `false` signs in successfully with email and password
- **THEN** the system prevents PUIntegra session establishment
- **AND** routes the user to `/auth/verify-email`

#### Scenario: Verified user signs in
- **WHEN** a Firebase Auth user with `emailVerified` equal to `true` signs in successfully
- **THEN** the system resolves the domain user and granted permission contexts
- **AND** continues the existing context-selection and route-guard flow

#### Scenario: Verification link is opened
- **WHEN** a user opens `/auth/verify-email` with a valid Firebase verification `oobCode`
- **THEN** the system applies the Firebase action code
- **AND** shows a verification-complete state with a path back to login

#### Scenario: Verification code is invalid or expired
- **WHEN** a user opens `/auth/verify-email` with an invalid or expired `oobCode`
- **THEN** the system shows a recoverable error state
- **AND** does not establish a PUIntegra session

#### Scenario: Verification resend is requested
- **WHEN** a signed-in unverified user requests another verification email
- **THEN** the system sends the action email only when resend throttles allow it
- **AND** records only sanitized resend metadata

### Requirement: Password recovery request
The system SHALL provide a password recovery request page that uses Firebase Auth reset email delivery and neutral user-facing responses.

#### Scenario: Recovery request is accepted
- **WHEN** a user submits `/auth/forgot-password` with a syntactically valid email
- **THEN** the system attempts the password reset email flow subject to abuse controls
- **AND** shows neutral success copy that does not reveal whether the account exists

#### Scenario: Recovery email is unknown
- **WHEN** a user submits `/auth/forgot-password` with an email that has no account or no eligible permission
- **THEN** the system shows the same neutral success copy
- **AND** does not reveal account, permission, verification, or disabled status

#### Scenario: Recovery request is throttled
- **WHEN** a user exceeds the allowed recovery request rate for an IP and normalized email
- **THEN** the system does not send another reset email
- **AND** shows a safe retry-later response

### Requirement: Password reset completion
The system SHALL allow users to set a new password only through a valid Firebase password reset action code.

#### Scenario: Reset code is valid
- **WHEN** a user opens `/auth/reset-password` with a valid Firebase reset `oobCode`
- **THEN** the system validates the code
- **AND** allows the user to submit a compliant new password and matching confirmation

#### Scenario: New password is confirmed
- **WHEN** the user submits a compliant new password for a valid reset code
- **THEN** the system confirms the Firebase password reset
- **AND** records a sanitized account-level password update audit event
- **AND** routes the user to login without automatically signing them in

#### Scenario: Reset code is invalid or expired
- **WHEN** a user opens `/auth/reset-password` with an invalid or expired `oobCode`
- **THEN** the system shows a recoverable error state
- **AND** directs the user back to `/auth/forgot-password`

#### Scenario: Reset password is weak
- **WHEN** a user submits a new password that violates Firebase password policy
- **THEN** the system rejects the reset attempt
- **AND** shows a field-level validation response without revealing action-code internals

### Requirement: TOTP security setup
The system SHALL provide TOTP MFA setup for authenticated, email-verified users when Firebase TOTP MFA is approved and enabled, with no more than one active TOTP factor per user.

#### Scenario: TOTP setup is required
- **WHEN** an authenticated, email-verified user requires security setup
- **THEN** protected route guards redirect the user to `/auth/security-setup`

#### Scenario: TOTP provider is available
- **WHEN** Firebase TOTP MFA is enabled and the user opens `/auth/security-setup`
- **THEN** the system starts Firebase TOTP enrollment
- **AND** displays enrollment material without persisting the TOTP secret in Firestore

#### Scenario: TOTP enrollment is confirmed
- **WHEN** the user submits a valid TOTP code during setup
- **THEN** the system completes Firebase MFA enrollment
- **AND** records a sanitized `USER_ACCOUNT_MFA_ENROLL` audit event
- **AND** allows the user to continue to the preferred authenticated destination

#### Scenario: User already has a TOTP factor
- **WHEN** a user with an existing active TOTP factor opens `/auth/security-setup`
- **THEN** the system does not create an additional TOTP factor
- **AND** explains that one authenticator app is already configured

#### Scenario: TOTP provider is unavailable
- **WHEN** Firebase TOTP MFA is not enabled for the active environment
- **THEN** `/auth/security-setup` shows a controlled unavailable state
- **AND** does not simulate MFA or store custom TOTP secrets

### Requirement: Admin-assisted MFA recovery
The system MUST require admin-assisted recovery when a user loses access to their only enrolled TOTP factor.

#### Scenario: User cannot self-unenroll required MFA
- **WHEN** a user has one active TOTP factor and MFA is required for PUIntegra access
- **THEN** the user cannot remove that factor through a normal self-service flow
- **AND** the UI directs the user to contact an administrator if authenticator access is lost

#### Scenario: Administrator resets lost TOTP access
- **WHEN** an authorized administrator completes the approved out-of-band user verification process
- **THEN** the system removes or resets the user's Firebase TOTP enrollment through a server-owned path
- **AND** records a sanitized `USER_ACCOUNT_MFA_UNENROLL` audit event

#### Scenario: User returns after admin reset
- **WHEN** a user whose TOTP factor was reset signs in again
- **THEN** the system routes the user to `/auth/security-setup`
- **AND** requires a new TOTP enrollment before protected domain access

#### Scenario: Production TOTP recovery is not ready
- **WHEN** admin-assisted MFA reset is not implemented, tested, documented, and approved
- **THEN** production TOTP enforcement remains disabled

### Requirement: Auth lifecycle abuse controls
The system MUST apply layered abuse controls to public and authenticated auth lifecycle operations.

#### Scenario: App Check is enforced in production
- **WHEN** production App Check enforcement is approved and enabled
- **THEN** auth lifecycle API calls require a valid App Check signal where supported

#### Scenario: Account creation is rate-limited
- **WHEN** account creation attempts exceed configured limits for an IP and normalized email
- **THEN** the system blocks additional attempts before sending more provider requests

#### Scenario: Reset code attempts are rate-limited
- **WHEN** password reset attempts exceed configured limits for an IP and action code
- **THEN** the system blocks additional reset attempts and shows a safe retry-later response

#### Scenario: Secrets are redacted
- **WHEN** auth lifecycle operations are logged, audited, or reported to observability
- **THEN** passwords, reset codes, verification codes, TOTP secrets, bearer tokens, action URLs, and raw credential payloads are omitted or redacted

### Requirement: Auth lifecycle auditability
The system SHALL record sanitized account-level audit events for completed and policy-relevant auth lifecycle operations.

#### Scenario: Account lifecycle event is audited
- **WHEN** account creation, email verification, password recovery request, password update, MFA enrollment, or admin-assisted MFA unenrollment completes
- **THEN** the system writes an account-level log with `RFC: null`
- **AND** uses the existing shared log categories for the event type

#### Scenario: Throttling event is classified
- **WHEN** an auth lifecycle operation is blocked by abuse controls
- **THEN** the system records sanitized policy metadata for operational review
- **AND** does not record secrets or full action URLs

### Requirement: Auth lifecycle user guidance
The system SHALL provide professional, friendly, and contextual guidance throughout auth lifecycle pages.

#### Scenario: User starts account creation
- **WHEN** a user opens `/auth/create-account`
- **THEN** the page explains that account creation requires a prior institutional permission
- **AND** provides clear field-level guidance for email, password, and confirmation without exposing permission inventory details

#### Scenario: User waits for email verification
- **WHEN** a signed-in unverified user opens `/auth/verify-email`
- **THEN** the page explains why verification is required
- **AND** provides clear next steps to check email, resend when allowed, or return to login

#### Scenario: User recovers a password
- **WHEN** a user completes `/auth/forgot-password` or `/auth/reset-password`
- **THEN** the page explains the next step in calm Spanish copy
- **AND** avoids alarming or ambiguous language while preserving neutral account-enumeration behavior

#### Scenario: User sets up TOTP
- **WHEN** a user opens `/auth/security-setup`
- **THEN** the page explains why an authenticator app is required
- **AND** provides contextual help for scanning the QR code, entering the manual key, confirming the current code, and contacting an administrator if authenticator access is lost

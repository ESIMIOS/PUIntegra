## ADDED Requirements

### Requirement: Authenticated users can manage account profile settings
The system SHALL provide an authenticated `/account/settings` page where a user can review their account email and update their account emoji icon, display name, and phone number.

#### Scenario: User opens account settings
- **WHEN** an authenticated user navigates to `/account/settings`
- **THEN** the page displays the current account `email`, `name`, `emojiIcon`, and `phone`
- **AND** the email is shown as read-only identity data

#### Scenario: User saves profile settings
- **WHEN** an authenticated user submits valid account settings changes
- **THEN** the system persists the changes through the server-owned account profile update boundary
- **AND** the page shows a success state without requiring logout or re-login

### Requirement: Name changes synchronize account identity
The system SHALL synchronize successful account name changes to both Firestore `users/{uid}.name` and Firebase Auth `displayName`.

#### Scenario: User changes name
- **WHEN** an authenticated user saves a new valid `name`
- **THEN** the system updates the Firestore user profile
- **AND** the system updates Firebase Auth `displayName`
- **AND** the visible session identity reflects the new name immediately after success

### Requirement: Phone is a domain profile field
The system SHALL treat phone number editing in account settings as a Firestore-domain profile update, not a Firebase Auth phone-auth update.

#### Scenario: User changes phone
- **WHEN** an authenticated user saves a valid phone number from `/account/settings`
- **THEN** the system updates `users/{uid}.phone`
- **AND** the system does not require SMS verification or Firebase Auth `phoneNumber` enrollment in this change

#### Scenario: User clears phone
- **WHEN** an authenticated user removes the phone value and submits the form
- **THEN** the system clears the stored Firestore `phone` field
- **AND** the save is still recorded as an account settings update

### Requirement: Account settings validate phone with country-code-first UX
The system SHALL provide a country-code-first phone input experience with `+52` as the default starting value and reject incomplete or malformed numbers.

#### Scenario: Empty phone field starts with Mexico default
- **WHEN** the account settings page initializes without a stored phone number
- **THEN** the phone input starts from `+52`
- **AND** the user can replace or complete that value before saving

#### Scenario: Incomplete Mexico prefix is rejected
- **WHEN** a user attempts to save a bare `+52` value
- **THEN** the system rejects the submission as an incomplete phone number
- **AND** the user receives field-level guidance to complete or clear the value

### Requirement: Account settings record profile update history
The system SHALL append account profile change history in `users/{uid}.updates` for successful account settings edits.

#### Scenario: Name, emoji, or phone changes are tracked
- **WHEN** an authenticated user successfully changes one or more of `name`, `emojiIcon`, or `phone`
- **THEN** the system appends one new entry to `users/{uid}.updates`
- **AND** that entry records only the delta fields that changed
- **AND** phone deltas use `previousPhone` and `updatedPhone`

### Requirement: Account settings updates are audited
The system SHALL record successful account settings updates as account-level logs using the existing shared log taxonomy.

#### Scenario: Successful settings update writes account log
- **WHEN** an authenticated user successfully saves account settings changes
- **THEN** the system writes a `USER_ACCOUNT_SETTINGS_UPDATE` log entry
- **AND** the log uses `RFC: null`
- **AND** the log omits secrets or unrelated sensitive payload data

### Requirement: Account settings provides curated emoji selection UX
The system SHALL provide a built-in curated emoji selection experience with a large preview rather than relying on a new third-party emoji picker dependency in the first version.

#### Scenario: User selects a new emoji
- **WHEN** an authenticated user opens the emoji selector and chooses a different emoji
- **THEN** the page updates the large preview immediately
- **AND** the chosen emoji is included in the next successful save

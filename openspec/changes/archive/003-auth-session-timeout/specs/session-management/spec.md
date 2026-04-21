## ADDED Requirements

### Requirement: Inactivity Timeout Configuration
The system SHALL have a configurable inactivity timeout period.
- The default value SHALL be defined in a centralized configuration or constant accessible by the frontend.

#### Scenario: Configuration availability
- **WHEN** the system starts
- **THEN** the inactivity timeout constant `SECONDS_TO_CLOSE_SESSION_FOR_INACTIVITY` is available.

### Requirement: Inactivity Monitoring
The frontend SHALL monitor user interaction to determine if the session is active.
- User interaction SHALL be defined as: mouse movement, keyboard input, clicks, or touch events.
- Each interaction SHALL reset the inactivity timer.

#### Scenario: Timer reset on activity
- **WHEN** a user is logged in
- **AND** the user moves the mouse or presses a key
- **THEN** the inactivity timer is reset to the configured timeout value.

### Requirement: Automatic Session Termination
The system SHALL automatically terminate the user session when the inactivity timer reaches zero.
- The user MUST be logged out from the application state.
- The system MUST redirect the user to the landing page or login page.
- The active role/context MUST be cleared.

#### Scenario: Session timeout reached
- **WHEN** a user is logged in and idle for more than `SECONDS_TO_CLOSE_SESSION_FOR_INACTIVITY`
- **THEN** the system automatically logs out the user
- **AND** redirects them to the public application state.

### Requirement: Inactivity Warning Alert
The system SHALL display a warning modal to the user before the session is terminated.
- The modal SHALL appear when the remaining time is less than or equal to `SECONDS_TO_SHOW_INACTIVITY_ALERT`.
- The modal SHALL inform the user that their session is about to expire.
- The modal SHALL provide an option to "Stay Logged In", which resets the inactivity timer.

#### Scenario: Warning alert appears
- **WHEN** the inactivity timer has `SECONDS_TO_SHOW_INACTIVITY_ALERT` remaining
- **THEN** the system displays the `InactivityWarningModal`.

#### Scenario: Reset from warning alert
- **WHEN** the warning modal is visible
- **AND** the user clicks "Stay Logged In"
- **THEN** the inactivity timer is reset
- **AND** the warning modal is closed.

### Requirement: Debug Timer Display
The system SHALL provide a way to monitor the remaining session time for debugging purposes.
- The `MockSessionSwitcher` component SHALL display the current `secondsRemaining` from the inactivity tracker.

#### Scenario: Debug timer visibility
- **WHEN** the `MockSessionSwitcher` is visible
- **THEN** it displays the current countdown value of the inactivity timer.

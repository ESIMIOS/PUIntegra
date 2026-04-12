## Why

Standard security requirement to protect sensitive institutional data by closing inactive sessions. This prevents unauthorized access when a user leaves their station unattended.

## What Changes

- Introduction of shared constants `SECONDS_TO_CLOSE_SESSION_FOR_INACTIVITY` and `SECONDS_TO_SHOW_INACTIVITY_ALERT`.
- Implementation of an inactivity monitoring system in the web frontend.
- Implementation of a **Warning Modal** that appears when `SECONDS_TO_SHOW_INACTIVITY_ALERT` is reached.
- Automatic logout and redirection to the landing page upon timeout expiration.
- Debug display of "session time left" in `MockSessionSwitcher` component.

## Capabilities

### New Capabilities
- `session-management`: Defines the rules for inactivity tracking, warning alerts, and session termination.

### Modified Capabilities
- None.

## Impact

- **packages/shared**: New session constants in `packages/shared/src/constants/access.ts`.
- **packages/web**:
    - Update to `authStore` to expose timer state.
    - New `InactivityWarningModal` component.
    - Update to `MockSessionSwitcher` for real-time timer debugging.
    - Global integration in `App.vue`.
- **Verification**: New integration tests to ensure the timer resets on activity and triggers logout on idle.

## Context

Currently, the application session (managed by `authStore.ts`) is persistent until the user manually switches roles or logs out. Given the sensitive nature of the PUI integration, an automatic session termination for idle users is required to mitigate risks of unattended access.

## Goals / Non-Goals

**Goals:**
- Implement a configurable inactivity timeout.
- Implement an inactivity warning modal that appears prior to session closure.
- Detect user interaction across the entire browser window.
- Automatically clear the session state and redirect the user when the timeout is reached.
- Provide a debug display of the remaining time in `MockSessionSwitcher`.
- Ensure the mechanism is testable in a mocked environment.

**Non-Goals:**
- Server-side session invalidation (client-side MVP focus).
- Advanced inactivity detection (e.g., webcam-based).

## Decisions

### 1. Centralized Configuration
**Rationale:** The timeout and alert thresholds are business rules that should be shared.
**Choice:** Add `SECONDS_TO_CLOSE_SESSION_FOR_INACTIVITY` and `SECONDS_TO_SHOW_INACTIVITY_ALERT` to `packages/shared/src/constants/access.ts`.

### 2. Vue Composable for Inactivity Tracking
**Rationale:** Encapsulating logic in a composable allows for clean lifecycle management.
**Choice:** `useSessionInactivity` in `packages/web/src/composables/`.
**Mechanism:** 
- Listens to: `mousedown`, `mousemove`, `keydown`, `scroll`, `touchstart`.
- Exposes `isAlerting` (boolean) and `secondsRemaining` (number).

### 3. Warning Modal Component
**Rationale:** A dedicated component simplifies the UI for expiration warning.
**Choice:** `InactivityWarningModal.vue`. It appears when `isAlerting` is true and offers a "Stay Logged In" button that resets the timer.

### 4. Debug Display in MockSessionSwitcher
**Rationale:** Developers need to verify the timer without waiting 3 minutes.
**Choice:** Integrate `secondsRemaining` from the tracker into the `MockSessionSwitcher` component.

### 3. Global Integration via App.vue
**Rationale:** The inactivity monitor must run regardless of the current page.
**Choice:** Initialize the composable in `packages/web/src/App.vue`.

## Risks / Trade-offs

- **[Risk] High Resource Usage** → [Mitigation] Throttling the event listeners (specifically `mousemove`) to avoid excessive timer resets.
- **[Risk] False Logouts** → [Mitigation] Ensuring all common interaction types are captured.

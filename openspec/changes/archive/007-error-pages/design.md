## Context

The web app already has an `/error` layout and routes for `/error/403`, `/error/404`, and `/error/500`. Each page currently delegates to `PagePlaceholder`, so the documented error domain exists but is not yet useful to users.

## Goals / Non-Goals

**Goals:**
- Render user-facing Spanish error pages for the three documented error states.
- Keep recovery actions consistent with current session state.
- Automatically redirect anonymous users to login after 15 seconds with a visible countdown bar.
- Keep timer behavior local to mounted error pages.
- Use existing Vue, Pinia, vue-router, Vuestic, and route constants.

**Non-Goals:**
- Add new error states beyond 403, 404, and 500.
- Change router guard decisions or global auth watching.
- Expose technical diagnostics to users.
- Modify shared schemas, Firebase rules, auth posture, or backend behavior.

## Decisions

### 1. Reusable Error Presentation

**Choice:** Create a reusable error page component that receives status-specific content and owns the recovery action behavior.

**Rationale:** The three pages share layout, action, countdown, and icon treatment while preserving distinct copy and status codes.

### 2. Context-Aware Recovery Target

**Choice:** Derive the primary action from existing stores:
- anonymous user -> `/auth/login`
- `SYSTEM_ADMINISTRATOR` -> `/admin/institutions`
- authenticated institutional user with active RFC -> `/app/{RFC}/dashboard`
- authenticated user with incomplete context -> `/account/settings`

**Rationale:** This keeps recovery tied to current state without adding new global watchers or changing guard behavior.

### 3. Local Countdown for Login Only

**Choice:** Start a 15-second countdown only when the derived target is `/auth/login`. Cancel the countdown when the target changes away from login or when the component unmounts.

**Rationale:** Automatic navigation is useful for anonymous users, but authenticated users should choose their next operational destination explicitly.

### 4. Absurd Icon Graphics

**Choice:** Use existing icon/Vuestic capabilities for playful oversized icon graphics on each page.

**Rationale:** It avoids new assets and dependencies while meeting the requested humorous visual direction.

## Risks / Trade-offs

- **Timer drift in tests or background tabs** -> Mitigate by computing remaining time from elapsed countdown ticks and testing with fake timers.
- **Navigation loops from error pages** -> Mitigate by not changing global guards and by only auto-routing to `/auth/login`.
- **Overexposed implementation detail** -> Mitigate by keeping copy user-safe and avoiding raw route, role, or stack information.

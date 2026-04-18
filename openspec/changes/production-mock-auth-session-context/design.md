## Context

The web app currently has placeholder login/logout pages and authenticated shells that pass hardcoded identity props into `HeaderSessionContext.vue`. The existing mock dataset already persists to localStorage and includes users, permissions, institutions, and logs. Shared contracts in `packages/shared/src/schemas/user.schema.ts`, `packages/shared/src/schemas/permission.schema.ts`, `packages/shared/src/schemas/access.schema.ts`, and `packages/shared/src/schemas/log.schema.ts` are sufficient for this change.

This design introduces a web-only mock auth boundary that mimics the future Firebase Authentication integration point. UI components and stores should call auth/session services instead of directly deriving session behavior from mock data internals.

Permanent specs referenced:
- `packages/shared/src/schemas/user.schema.ts`
- `packages/shared/src/schemas/permission.schema.ts`
- `packages/shared/src/schemas/access.schema.ts`
- `packages/shared/src/schemas/log.schema.ts`
- `packages/web/specs/frontend-foundations.md`

## Goals / Non-Goals

**Goals:**

- Provide production-ready login, logout, and authenticated session context UI backed by deterministic mock services.
- Keep mock auth replaceable by future Firebase Auth by isolating credential validation, session persistence, and auth event logging behind a mock auth service/controller.
- Persist session state in localStorage until logout and hydrate authenticated state across reloads.
- Require valid credentials and explicit context selection when multiple permissions are available.
- Make `HeaderSessionContext.vue` standalone and powered by real store/session state.
- Record successful auth actions in domain logs where existing `LogSchema` and categories support the event.

**Non-Goals:**

- No real Firebase Auth integration.
- No changes to Firebase security rules, production auth providers, MFA policy, or blocking functions.
- No changes to shared Zod schemas.
- No password recovery, account creation, email verification, or MFA implementation beyond preserving existing route placeholders.

## Decisions

1. Use a web-only mock auth service as the backend boundary.
   - Rationale: The service can later be replaced with Firebase Auth calls without requiring page and header rewrites.
   - Alternative considered: put login logic directly inside pages/stores. Rejected because it would couple UI to mock implementation details.

2. Keep mock passwords outside `UserSchema`.
   - Rationale: `UserSchema` describes user profile data, not authentication secrets. Adding password fields would be a shared contract change and a poor future Firebase model.
   - Alternative considered: extend mock users with a password field. Rejected to avoid blurring domain user records and auth credentials.

3. Persist auth session separately from the mock dataset.
   - Rationale: Mock dataset persistence and auth persistence have different lifecycles. Firebase Auth replacement should map cleanly to the auth-session key without altering mock business data storage.
   - Alternative considered: store session fields inside the existing mock dataset. Rejected because logout/hydration would become entangled with data fixtures.

4. Put display identity in `authStore`.
   - Rationale: `HeaderSessionContext.vue` and future authenticated UI need name, email, emoji, role, and active RFC without passing props through every shell.
   - Alternative considered: have the header call repositories directly. Rejected because components should not own data orchestration.

5. Require context selection after login when more than one granted permission exists.
   - Rationale: The seed user has multiple valid contexts, and silent defaulting can place the user into the wrong domain.
   - Alternative considered: default to institution admin or system administrator. Rejected per product decision.

6. Use `/auth/logout` as the actual logout completion route.
   - Rationale: Header logout needs confirmation, but direct logout route should perform logout, show the outcome, and redirect to login.
   - Alternative considered: confirmation on `/auth/logout`. Rejected per product decision.

## Risks / Trade-offs

- Mock lockout state may differ from Firebase Auth throttling behavior -> Keep lockout implementation inside the mock auth service so it is replaceable.
- Auth logs may not represent every desired event with current categories -> Log successful login/logout using existing auth categories and use technical system messages for failed attempts/lockout unless a shared log category is approved later.
- Persisting session in localStorage can leave stale state if mock data is reset -> Hydration MUST validate the persisted session against the current mock dataset and clear invalid sessions.
- Header self-sufficiency can make component tests heavier -> Keep orchestration in composables/controllers and let the component consume simple reactive state/actions.

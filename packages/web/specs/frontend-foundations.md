# Frontend Foundations (Live Spec)

## Purpose

Define the baseline webapp architecture for local development and navigable skeleton behavior in `packages/web`.

## Scope in current state

- Vue 3 webapp with `vue-router`, Pinia, Vuetify 3.
- Minimal PWA baseline (manifest + service worker registration).
- Contextual layout domains: `/site`, `/auth`, `/app`, `/admin`, `/account`, `/error`.
- Full documented route skeleton with placeholders and default redirects.
- Guard pipeline with mock-mode control for local browsing.

## Route and guard contract

- First-level paths act as layout domains.
- Internal routes represent views.
- Layout shell presentation strings (title/color/chip labels) must be centralized in `src/shared/constants/domains.ts` by domain key.
- Route metadata keys used by guards:
  - `allowedRoles`
  - `requiresAuth`
  - `requiresInstitutionContext`
  - `requiresSecuritySetup`
  - `defaultChildRedirect`
- Error mapping:
  - missing route -> `/error/404`
  - route/role/context mismatch -> `/error/403`
  - unexpected guard failure -> `/error/500`

## Engineering standards reference

- Global project-wide engineering standards live in [`openspec/specs/engineering-standards.md`](../../../openspec/specs/engineering-standards.md).
- This includes JSDoc format, changelog format, language rules, and shared conventions.
- `packages/web/specs/*` should only define web-specific behavior and explicit overrides.

## BoM strategy

- Create and maintain `src/bom.ts` in `packages/web` to centralize shared dependencies.
- Follow the detailed contract in [`bill-of-materials.md`](./bill-of-materials.md).
- Import shared dependencies through `bom.ts` and keep local dependencies as direct imports.
- Local-internal module imports must use explicit relative paths (`./` and `../`), not `@/` alias.
- Consolidate imports so each module path appears once per file.

## Dependencies policy

- Keep dependency versions pinned (exact versions, no `^` or `~`) in `package.json` files.
- Preserve `save-exact=true` and `save-prefix=` in root `.npmrc` so new dependencies are pinned by default.

## Shared contract policy

- System-wide constants/enums must live in `packages/shared` and be imported in web through `@shared`.
- Do not create local pass-through wrappers that only re-export `@shared` contracts (for example role constants). Import from `@shared` directly.
- Avoid unnecessary local type aliases when a type can be directly derived from shared constants/schemas.
- Avoid arbitrary primitive types for constrained domains (`role`, `domain`, etc.); use schema/enum-derived types in store actions, composables, and route metadata.
- Product-only mock defaults remain in `packages/web` (`DEFAULT_RFC`, `DEFAULT_FUB`).

## Navigation source of truth

- Navigation labels and route-target mapping must be defined in a shared navigation catalog constant under `src/shared/constants`.
- Navigation consumers (mock panel, composables, future real navigation UI) must consume this catalog instead of redefining string labels or duplicated route-link arrays.
- Avoid duplicated navigation strings in components and composables.
- Placeholder page title/description content must also be centralized in the same navigation catalog module.
- Route records must copy title/description from the catalog into `route.meta` so placeholders can render directly from route data.


## Mock mode

- The project keeps a mock mode for local browsing without backend integration.
- The detailed mock behavior contract lives in [`mock-mode.md`](./mock-mode.md).
- This file only preserves the architectural relationship: guards and routes depend on mock state to enable local browsable navigation.

## Shared state and testing patterns
### Shared composable state (Singletons)
- By default, Vue 3 `ref()` defined inside a composable function scope is unique to each component instance.
- **Requirement**: For global state (for example session timers or global notifications), define the state variables **outside** the exported function scope to ensure a singleton instance across the application.

### Testing composables with lifecycle hooks
- Composables using `onMounted` or `onUnmounted` require an active component context to be tested reliably.
- **Requirement**: Use a `withSetup` helper or a dummy test component to provide the necessary Vue application context for lifecycle hooks during Vitest execution.

## Non-goals in this phase

- No real Firebase/Auth/API data operations.
- No business workflows.
- No changes to shared schema contracts.

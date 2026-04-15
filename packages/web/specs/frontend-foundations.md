# Frontend Foundations (Live Spec)

## Purpose

Define the baseline webapp architecture for local development and navigable skeleton behavior in `packages/web`.

## Scope in current state

- Vue 3 webapp with `vue-router`, Pinia, Vuestic UI.
- Minimal PWA baseline (manifest + service worker registration).
- Contextual layout domains: `/site`, `/auth`, `/app`, `/admin`, `/account`, `/error`.
- Design system and theme behavior live in [`design-system.md`](./design-system.md).
- Vuestic implementation guidelines live in [`vuestic-usage.md`](./vuestic-usage.md).
- Product CSS utility class rules live in [`css-utilities.md`](./css-utilities.md).
- Error observability (Sentry) lives in [`error-observability.md`](./error-observability.md).
- Deployment environments live in [`environments.md`](./environments.md).
- Full documented route skeleton with placeholders and default redirects.
- Guard pipeline with mock-mode control for local browsing.

## Route and guard contract

- First-level paths act as layout domains.
- Internal routes represent views.
- Layout shell presentation strings (title/accent color/chip labels) must be centralized in `src/shared/constants/domains.ts` by domain key.
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
### Spanish UI copy quality
- User-facing copy in Spanish must preserve correct accents and orthography (for example: `sesión`, `acción`, `ocurrió`).
- Shared message catalogs (`src/shared/constants/*Messages.ts`) are the source of truth and must be reviewed for orthographic consistency before merge.

### Shared composable state (Singletons)
- By default, Vue 3 `ref()` defined inside a composable function scope is unique to each component instance.
- **Requirement**: For global state (for example session timers or global notifications), define the state variables **outside** the exported function scope to ensure a singleton instance across the application.

### Async computed setter safety
- Vue computed setters are consumed as fire-and-forget by UI bindings (`v-model`, direct assignment), so returned promises are not awaited by callers.
- **Requirement**: Computed setters that trigger async work MUST catch errors internally and route failures to store error state and system logging (or explicitly swallow with documented reason). They must not leak unhandled promise rejections.

### Async lifecycle hook safety
- Vue lifecycle hooks (`onMounted`, `onUnmounted`, etc.) do not await async callback completion for caller-level error handling.
- **Requirement**: Async work triggered from lifecycle hooks MUST be wrapped in `try/catch` and route failures to store error state plus system logging (or a documented safe fallback such as reset), to prevent unhandled promise rejections.

### Browser global references
- **Requirement**: Use `globalThis` when code needs to reference the JavaScript global object, such as for timers or other cross-runtime global capabilities.
- Treat DOM-specific APIs (for example `document`, `window`, or `addEventListener`) as browser-only capabilities: use them only when `globalThis` is a browser `Window`-like global and guard their availability before access.
- Avoid direct `window` references for global object access so composables and tests remain compatible with Vitest, SSR-like execution, and non-browser test environments.
- Direct browser-specific globals may be used only when the API is inherently tied to that object and the code guards its availability.

### Testing composables with lifecycle hooks
- Composables using `onMounted` or `onUnmounted` require an active component context to be tested reliably.
- **Requirement**: Use a `withSetup` helper or a dummy test component to provide the necessary Vue application context for lifecycle hooks during Vitest execution.

## Non-goals in this phase

- No real Firebase/Auth/API data operations.
- No business workflows.
- No changes to shared schema contracts.

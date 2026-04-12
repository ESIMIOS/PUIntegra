## Context

PUIntegra is a government-adjacent SaaS (identity-platform integration) built on Vue 3 + Vite + TypeScript in a pnpm monorepo. The frontend (`packages/web`) currently uses Vuetify 3.8.0 with a minimal configuration—light theme only, no brand colors, no dark mode, and six identical skeleton layouts that differ only by app-bar color.

The project has an established brand identity (Azul PUIntegra `#0B1F4C`, Verde acento `#3BB54A`, Inter/Montserrat fonts) and a complete route skeleton with 30 placeholder pages across 6 domains. No business logic exists in the frontend yet—this is the ideal moment to establish the visual foundation.

### Constraints
- Must follow SDD workflow — permanent specs updated alongside implementation.
- No Zod schema changes — this is a pure presentation-layer change.
- No Firebase security rule changes.
- Router structure, guards, stores, and domain constants remain structurally intact.
- Existing `bom.ts` barrel-file pattern must be preserved.
- Prior Vuestic experience on the team reduces migration risk.

## Goals / Non-Goals

**Goals:**
- Replace Vuetify with Vuestic UI as the component framework.
- Establish a design token system (colors, spacing, elevation) aligned with the PUIntegra brand.
- Implement all 6 layouts with production-ready structure using Vuestic's layout system.
- Implement dark/light theme toggle with system preference + user override + `localStorage` persistence.
- Create a `/site/demo` showcase page as a living design reference.
- Persist design guidelines as `packages/web/specs/design-system.md` live spec.

**Non-Goals:**
- Business logic implementation in any page.
- Custom typography — use Vuestic's default font stack.
- Tailwind CSS integration (future consideration, not in this scope).
- E2E testing or visual regression testing.
- Logo SVG asset creation (will use placeholder or existing PNG until SVGs are provided).

## Decisions

### Decision 1: Vuestic UI over Vuetify 3

**Choice**: Replace Vuetify 3 with Vuestic UI.

**Rationale**: Vuestic is design-agnostic (no forced Material Design), lighter, fully TypeScript-native, and has a CSS Grid-based layout system (`VaLayout`) with purpose-built sidebar/navbar/footer slots. Vuetify would require fighting Material Design conventions to achieve the PUIntegra brand identity. The team also has prior Vuestic experience.

**Alternatives considered**:
- *Stay with Vuetify + Materio template*: Lower migration cost but Material Design lock-in and constant style overrides.
- *Vuero (CSSNinja)*: Bulma-based, incompatible with Vuetify, and the official site returns HTTP 410 (discontinued).
- *PrimeVue*: Strong component library but less layout system maturity and no prior team experience.

### Decision 2: Shared DashboardShell for App and Admin

**Choice**: Create a reusable `DashboardShell.vue` component used by both `AppLayout` and `AdminLayout`.

**Rationale**: Both domains require the same structural pattern — collapsible sidebar + top bar + breadcrumb area + main content. They differ only by accent color and navigation items. A shared shell component avoids duplication and ensures consistent UX. Domain-specific configuration (menu items, accent color) is passed as props driven by the existing `domainShell` constants.

**Alternatives considered**:
- *Fully independent layouts*: More flexible but duplicates ~80% of code and risks drift.
- *Single layout with domain prop*: Too coupled — harder to extend independently if needs diverge later.

### Decision 3: Vuestic Global Config for Theming

**Choice**: Use Vuestic's `GlobalConfig` preset system with CSS custom properties for theme tokens.

**Rationale**: Vuestic provides a `createVuesticEssential()` and `createVuestic()` plugin with a `config.colors` API that maps directly to CSS variables. This allows defining the brand palette once and having all components inherit it. Theme switching (light/dark) is natively supported through preset swapping.

**Alternatives considered**:
- *Manual CSS variables only*: More control but loses integration with Vuestic component theming.
- *SCSS variables*: Static, no runtime theme switching capability.

### Decision 4: Theme Preference Composable

**Choice**: Create a `useThemePreference` singleton composable that manages theme state.

**Rationale**: Following the project's established singleton composable pattern (as documented in `packages/web/specs/frontend-foundations.md`), the theme preference state is shared outside the function scope. This composable: (1) reads `localStorage` for saved preference, (2) falls back to `prefers-color-scheme` media query, (3) applies the selected theme via Vuestic's `useColors()` API, and (4) persists changes to `localStorage`.

### Decision 5: Domain Accent System Replaces Per-Domain Colors

**Choice**: Replace the current `domainShell.appBarColor` Vuetify color strings with a semantic accent system using Vuestic color presets.

**Rationale**: The current `domainShell` uses Vuetify-specific color names (`'teal'`, `'deep-purple'`, etc.) that were conceptual only. With Vuestic, each domain gets a semantic accent CSS variable (e.g., `--va-domain-accent`) set at the layout level, while the base palette remains consistent. This creates visual cohesion with subtle domain differentiation.

### Decision 6: Logo Handling Strategy

**Choice**: Copy the brand logo PNG to `packages/web/public/img/` and use it directly. Create an `AppLogo.vue` component that renders the appropriate logo variant based on theme (light/dark) and context (full/icon-only).

**Rationale**: SVG assets are not yet available. The `AppLogo` component abstracts the logo source, so when SVGs arrive they can be swapped in one place. In the meantime, the PNG from the brand guide works for development.

## Risks / Trade-offs

**[Risk: Vuestic component coverage]** — Vuestic has fewer components (~60) than Vuetify (~80). Some specialized components may not exist.
→ **Mitigation**: At skeleton stage, only basic components are needed (Card, Button, Alert, Sidebar, Navbar, Form inputs). Advanced needs can be addressed when business pages are built.

**[Risk: Ecosystem size]** — Vuestic has a smaller community and fewer Stack Overflow answers.
→ **Mitigation**: Official documentation is comprehensive. Team has prior experience. Core maintainers (Epicmax) provide professional support.

**[Risk: Breaking existing tests]** — Any test that mounts components with Vuetify wrappers will break.
→ **Mitigation**: Current test count is minimal (mostly skeleton/guard tests). Mount configuration updates are mechanical.

**[Risk: Placeholder component remapping]** — `PagePlaceholder.vue` and `MockSessionSwitcher.vue` use Vuetify components.
→ **Mitigation**: These are simple components with 1:1 Vuestic equivalents. Mechanical mapping.

**[Trade-off: No Tailwind in this scope]** — Vuestic is compatible with Tailwind, but we defer Tailwind integration.
→ **Rationale**: Adding Tailwind simultaneously increases scope and config complexity. It can be added in a follow-up change if needed.

## Why

The PUIntegra web application currently uses Vuetify 3.8.0 with a minimal default configuration (light theme only, no custom design tokens, generic app-bar-only layouts). The product needs to convey **security, modernity, and world-class quality** as a government-adjacent SaaS for identity-platform integration. The current skeleton has no sidebar navigation, no dark mode, no brand-aligned color palette, and layouts are identical scaffolds varying only by app-bar color.

Additionally, **Vuestic UI** is a better fit than Vuetify for this project because:
- It is **design-agnostic** (no Material Design lock-in), making it easier to apply the PUIntegra brand identity (#0B1F4C / #3BB54A) without fighting framework defaults.
- It has a **native CSS Grid layout system** (`VaLayout`) with sidebar, navbar, and footer slots — exactly what the 6 domain layouts require.
- It is **lighter, fully tree-shakeable**, and built with TypeScript natively.
- The project is in an early stage (skeleton layouts + placeholder pages), making migration cost minimal.
- The team has prior experience with Vuestic.

This is the right moment to establish a professional design foundation before business logic is implemented.

## What Changes

- **BREAKING**: Remove `vuetify` dependency and replace with `vuestic-ui`.
- Replace Vuetify plugin (`plugins/vuetify.ts`) with Vuestic configuration (`plugins/vuestic.ts`).
- Define a complete **design token system**: brand color palette (light + dark themes), spacing scale, elevation levels, border radii — all mapped to Vuestic's CSS variables and global config.
- Rewrite all **6 layouts** using Vuestic components (`VaLayout`, `VaSidebar`, `VaNavbar`, `VaFooter`):
  - **SiteLayout**: Public-facing with navbar + footer, no sidebar.
  - **AuthLayout**: Centered, minimal, logo-prominent, split-screen or card-based.
  - **AppLayout**: Dashboard shell with collapsible sidebar + top app bar + breadcrumb area.
  - **AdminLayout**: Same shell structure as App (shared `DashboardShell` base component) with distinct accent color.
  - **AccountLayout**: Independent authenticated layout with simple sub-navigation (no sidebar or minimal sidebar).
  - **ErrorLayout**: Centered, minimal, brand-consistent error display.
- Implement **dark/light theme toggle** with system-preference detection and `localStorage` persistence.
- Update `bom.ts` to export Vuestic instead of Vuetify imports.
- Update `main.css` / `main.ts` to use Vuestic styles.
- Remap all placeholder page components from Vuetify components (`v-container`, `v-card`, `v-alert`, etc.) to Vuestic equivalents (`VaCard`, `VaAlert`, etc.).
- Prepare **SVG logo assets** for use in layouts (horizontal logo, icon-only variant).
- Create a **design system showcase page** at `/site/demo` demonstrating tokens, components, and layout patterns.
- Persist design guidelines as a **live spec** at `packages/web/specs/design-system.md`.

## Capabilities

### New Capabilities
- `design-tokens`: Brand color palette, theme configuration (light/dark), spacing, elevation, and border-radius tokens integrated with Vuestic's global config and CSS custom properties.
- `vuestic-layouts`: Six domain-specific layout implementations using Vuestic UI's layout system, including shared `DashboardShell` for App/Admin and responsive sidebar behavior.
- `theme-toggle`: Dark/light theme switching with system-preference detection, user override, and `localStorage` persistence.
- `design-showcase`: Demo page at `/site/demo` rendering the design system tokens and component patterns as a living reference.

### Modified Capabilities
_(none — no existing spec-level requirements are changing; the route structure, guards, domain constants, and authentication behavior remain identical)_

## Impact

- **Dependencies**: Remove `vuetify` (3.8.0), add `vuestic-ui` (latest). Vuetify CSS import in `main.ts` is removed.
- **`packages/web/src/plugins/`**: `vuetify.ts` replaced by `vuestic.ts`.
- **`packages/web/src/bom.ts`**: All Vuetify re-exports replaced by Vuestic equivalents.
- **`packages/web/src/layouts/*.vue`**: All 6 files rewritten.
- **`packages/web/src/components/shared/PagePlaceholder.vue`**: Component markup remapped to Vuestic.
- **`packages/web/src/components/dev/MockSessionSwitcher.vue`**: Component markup remapped to Vuestic.
- **`packages/web/src/styles/main.css`**: Replaced with Vuestic-based theming and brand tokens.
- **`packages/web/src/shared/constants/domains.ts`**: `domainShell` updated — per-domain Vuetify colors replaced by Vuestic-compatible theme/accent tokens.
- **`packages/web/src/main.ts`**: Import path updated from Vuetify CSS to Vuestic CSS.
- **`packages/web/package.json`**: Dependency swap.
- **Zod schemas**: No changes — this is a pure frontend presentation layer change.
- **Firebase security rules**: No impact.
- **Router / guards**: No structural changes. One new route added (`/site/demo`).
- **Existing tests**: Tests referencing Vuetify component wrappers may need mounting config updates.

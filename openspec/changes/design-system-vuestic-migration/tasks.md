## 1. Tests and Test Infrastructure

- [ ] 1.1 Update Vitest mount config helper to use Vuestic plugin instead of Vuetify
- [ ] 1.2 Write unit test for `useThemePreference` composable (system detection, toggle, localStorage persistence, singleton behavior)
- [ ] 1.3 Write unit test for `ThemeToggle.vue` component (renders correct icon per theme, calls toggle on click)
- [ ] 1.4 Write unit test for `AppLogo.vue` component (renders correct variant for light/dark theme and full/icon-only mode)
- [ ] 1.5 Write unit test for `DashboardShell.vue` (renders sidebar with menu items, renders top bar with domain title, sidebar collapse toggle works)

## 2. Dependency Swap and Plugin Configuration

- [ ] 2.1 Remove `vuetify` from `packages/web/package.json` and add `vuestic-ui` (latest)
- [ ] 2.2 Run `pnpm install` and resolve any peer dependency issues
- [ ] 2.3 Replace `plugins/vuetify.ts` with `plugins/vuestic.ts` — configure `createVuestic()` with brand color palette (light + dark presets), global component defaults
- [ ] 2.4 Update `main.ts` — replace Vuetify CSS import with Vuestic CSS import, use new plugin
- [ ] 2.5 Update `bom.ts` — replace all Vuetify re-exports with Vuestic equivalents
- [ ] 2.6 Update `main.css` — remove Vuetify-specific rules, add brand token CSS custom properties if needed beyond Vuestic defaults

## 3. Design Token System

- [ ] 3.1 Define complete light theme color preset in `plugins/vuestic.ts` (primary: #0B1F4C, success/accent: #3BB54A, secondary, info, warning, danger, surfaces)
- [ ] 3.2 Define complete dark theme color preset mirroring all tokens for dark backgrounds
- [ ] 3.3 Update `domainShell` in `domains.ts` — replace Vuetify color strings with semantic accent hex values compatible with Vuestic

## 4. Theme Toggle

- [ ] 4.1 Implement `useThemePreference` singleton composable (`composables/useThemePreference.ts`) — system detection, localStorage persistence, Vuestic `useColors()` integration
- [ ] 4.2 Create `ThemeToggle.vue` component (`components/shared/ThemeToggle.vue`) — icon toggle button using the composable

## 5. Shared Components

- [ ] 5.1 Create `AppLogo.vue` component (`components/shared/AppLogo.vue`) — renders brand logo with light/dark and full/icon-only variants
- [ ] 5.2 Create `DashboardShell.vue` component (`components/shared/DashboardShell.vue`) — VaLayout + VaSidebar + top bar, accepting menu items, accent color, domain title, chip label/value as props
- [ ] 5.3 Remap `PagePlaceholder.vue` from Vuetify to Vuestic components (VaCard, VaAlert, etc.)
- [ ] 5.4 Remap `MockSessionSwitcher.vue` from Vuetify to Vuestic components

## 6. Layout Implementations

- [ ] 6.1 Rewrite `SiteLayout.vue` — VaLayout + VaNavbar (with logo, nav links, theme toggle) + VaFooter + router-view
- [ ] 6.2 Rewrite `AuthLayout.vue` — VaLayout centered, logo prominent, router-view centered
- [ ] 6.3 Rewrite `AppLayout.vue` — uses DashboardShell with app-domain config
- [ ] 6.4 Rewrite `AdminLayout.vue` — uses DashboardShell with admin-domain config
- [ ] 6.5 Rewrite `AccountLayout.vue` — independent layout with top bar, logo, sub-navigation, no sidebar
- [ ] 6.6 Rewrite `ErrorLayout.vue` — centered minimal layout with logo and home link

## 7. Demo Route and Showcase Page

- [ ] 7.1 Add `/site/demo` route to `routes.ts` with lazy-loaded `SiteDemoPage.vue`
- [ ] 7.2 Create `SiteDemoPage.vue` (`pages/site/SiteDemoPage.vue`) — color palette swatches, typography scale, component samples, layout domain reference table
- [ ] 7.3 Add `site-demo` entry to `navigationCatalog.ts`

## 8. Logo Assets

- [ ] 8.1 Copy brand logo PNG to `packages/web/public/img/` (light and dark variants if available, or generate placeholder)

## 9. Live Spec Persistence

- [ ] 9.1 Create `packages/web/specs/design-system.md` — document design tokens, color palette (hex values), domain accent mapping, theme toggle behavior, layout structure per domain, and component usage guidelines for future AI agents
- [ ] 9.2 Update `packages/web/specs/frontend-foundations.md` — add reference to design-system.md, update scope section to reflect Vuestic migration (replace all Vuetify references)
- [ ] 9.3 Update `README.md` — replace Vuetify reference in stack description with Vuestic UI
- [ ] 9.4 Update `packages/web/specs/bill-of-materials.md` — replace `vuetify` example with `vuestic-ui`
- [ ] 9.5 Update `openspec/changes/webapp-foundations-skeleton/proposal.md` and `tasks.md` — replace Vuetify references with Vuestic UI

## 10. Quality Gates

- [ ] 10.1 Run `pnpm -r typecheck` — must pass with zero errors
- [ ] 10.2 Run `pnpm -r lint` — must pass with zero warnings
- [ ] 10.3 Run `pnpm -r test` — must pass with zero failures
- [ ] 10.4 Manual verification — start dev server, navigate all 6 domains, verify layouts render correctly in both light and dark themes, verify sidebar collapse, verify responsive behavior at mobile/tablet breakpoints

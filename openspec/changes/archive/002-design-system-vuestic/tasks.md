## 1. Tests and Test Infrastructure

- [x] 1.1 Update Vitest mount config helper to use Vuestic plugin instead of Vuetify
- [x] 1.2 Write unit test for `useThemePreference` composable (system detection, toggle, localStorage persistence, singleton behavior)
- [x] 1.3 Write unit test for `ThemeToggle.vue` component (renders correct icon per theme, calls toggle on click)
- [x] 1.4 Write unit test for `AppLogo.vue` component (renders correct variant for light/dark theme and full/icon-only mode)
- [x] 1.5 Write unit test for `DashboardShell.vue` (renders sidebar with menu items, renders graphic identity, preserves icon + text sidebar)

## 2. Dependency Swap and Plugin Configuration

- [x] 2.1 Remove `vuetify` from `packages/web/package.json` and add `vuestic-ui` (latest)
- [x] 2.2 Run `pnpm install` and resolve any peer dependency issues
- [x] 2.3 Replace `plugins/vuetify.ts` with `plugins/vuestic.ts` — configure `createVuestic()` with brand color palette (light + dark presets), global component defaults
- [x] 2.4 Update `main.ts` — replace Vuetify CSS import with Vuestic CSS import, use new plugin
- [x] 2.5 Update `bom.ts` — replace all Vuetify re-exports with Vuestic equivalents
- [x] 2.6 Update `main.css` — remove Vuetify-specific rules, add brand token CSS custom properties if needed beyond Vuestic defaults

## 3. Design Token System

- [x] 3.1 Define complete light theme color preset in `plugins/vuestic.ts` (primary: #0B1F4C, success/accent: #3BB54A, secondary, info, warning, danger, surfaces)
- [x] 3.2 Define complete dark theme color preset mirroring all tokens for dark backgrounds
- [x] 3.3 Update `domainShell` in `domains.ts` — replace Vuetify color strings with semantic accent hex values compatible with Vuestic

## 4. Theme Toggle

- [x] 4.1 Implement `useThemePreference` singleton composable (`composables/useThemePreference.ts`) — system detection, localStorage persistence, Vuestic `useColors()` integration
- [x] 4.2 Create `ThemeToggle.vue` component (`components/shared/ThemeToggle.vue`) — icon toggle button using the composable

## 5. Shared Components

- [x] 5.1 Create `AppLogo.vue` component (`components/shared/AppLogo.vue`) — renders brand logo with light/dark and full/icon-only variants
- [x] 5.2 Create `DashboardShell.vue` component (`components/shared/DashboardShell.vue`) — VaLayout + VaSidebar + top bar, accepting menu items, accent color, domain title, chip label/value as props
- [x] 5.3 Remap `PagePlaceholder.vue` from Vuetify to Vuestic components (VaCard, VaAlert, etc.)
- [x] 5.4 Remap `MockSessionSwitcher.vue` from Vuetify to Vuestic components

## 6. Layout Implementations

- [x] 6.1 Rewrite `SiteLayout.vue` — VaLayout + VaNavbar (with logo, nav links, theme toggle) + VaFooter + router-view
- [x] 6.2 Rewrite `AuthLayout.vue` — VaLayout centered, logo prominent, router-view centered
- [x] 6.3 Rewrite `AppLayout.vue` — uses DashboardShell with app-domain config
- [x] 6.4 Rewrite `AdminLayout.vue` — uses DashboardShell with admin-domain config
- [x] 6.5 Rewrite `AccountLayout.vue` — connected account shell with top bar, account sidebar, and return navigation
- [x] 6.6 Rewrite `ErrorLayout.vue` — centered minimal layout with logo and home link

## 7. Demo Route and Showcase Page

- [x] 7.1 Add `/site/demo` route to `routes.ts` with lazy-loaded `SiteDemoPage.vue`
- [x] 7.2 Create `SiteDemoPage.vue` (`pages/site/SiteDemoPage.vue`) — color palette swatches, typography scale, component samples, layout domain reference table
- [x] 7.3 Add `site-demo` entry to `navigationCatalog.ts`

## 8. Logo Assets

- [x] 8.1 Copy brand logo PNG to `packages/web/public/img/` (light and dark variants if available, or generate placeholder)

## 9. Live Spec Persistence

- [x] 9.1 Create `packages/web/specs/design-system.md` — document design tokens, color palette (hex values), domain accent mapping, theme toggle behavior, layout structure per domain, and component usage guidelines for future AI agents
- [x] 9.2 Update `packages/web/specs/frontend-foundations.md` — add reference to design-system.md, update scope section to reflect Vuestic migration (replace all Vuetify references)
- [x] 9.3 Update `README.md` — replace Vuetify reference in stack description with Vuestic UI
- [x] 9.4 Update `packages/web/specs/bill-of-materials.md` — replace `vuetify` example with `vuestic-ui`
- [x] 9.5 Update `openspec/changes/webapp-foundations-skeleton/proposal.md` and `tasks.md` — replace Vuetify references with Vuestic UI

## 10. Quality Gates

- [x] 10.1 Run `pnpm -r typecheck` — must pass with zero errors
- [x] 10.2 Run `pnpm -r lint` — must pass with zero warnings
- [x] 10.3 Run `pnpm -r test` — must pass with zero failures
- [ ] 10.4 Manual verification — start dev server, navigate all 6 domains, verify layouts render correctly in both light and dark themes, verify dashboard sidebar preserves icon + text, verify responsive behavior at mobile/tablet breakpoints
  - Dev server started at `http://127.0.0.1:5175/`; HTTP checks returned 200 for `/site/home`, `/site/demo`, `/auth/login`, `/app/XAXX010101000/dashboard`, `/admin/institutions`, `/account/settings`, and `/error/404`. Visual browser verification remains open.

## 11. Alignment With Persisted UI Guidelines

- [x] 11.1 Add icon metadata to navigation links used by dashboard sidebars
- [x] 11.2 Update `DashboardShell.vue` so desktop sidebars never collapse and every item renders icon + text
- [x] 11.3 Keep dashboard sidebar responsive without icon-only desktop navigation
- [x] 11.4 Make navigation headers sticky and structure identity/navigation/session/actions zones
- [x] 11.5 Ensure header/body and body/footer contrast is visible through backgrounds, borders, or shadows
- [x] 11.6 Align icon-only buttons with `preset="primary"`, `round`, `VaIcon`, and accessible labels
- [x] 11.7 Use compact switch/checkbox sizing where visual space is constrained
- [x] 11.8 Run quality gates after guideline alignment

## 12. Alignment With Layout Observations

- [x] 12.1 Persist graphic identity definition as a brand image containing logo mark and product text
- [x] 12.2 Persist minimal layout branding guidance for prominent Auth and Error graphic identity
- [x] 12.3 Persist authenticated shell guidance for dashboard header identity, right-side session context, and footer boundary
- [x] 12.4 Persist neutral navigation color semantics and semantic status color reservation
- [x] 12.5 Persist Account layout guidance as a connected authenticated shell with sidebar and return paths
- [x] 12.6 Update active migration specs to remove conflicting sidebar collapse and Account no-sidebar requirements
- [x] 12.7 Update layouts and tests to match clarified layout guidance
- [x] 12.8 Run quality gates after layout observation alignment

## 13. Layout Checklist Review Follow-up

- [x] 13.1 Review SiteLayout against persisted header, identity, action, sticky, and footer contrast specs
- [x] 13.2 Remove duplicated graphic identity image from App/Admin dashboard sidebar
- [x] 13.3 Separate App/Admin header session-state zone from header actions
- [x] 13.4 Make Role and RFC session values visually clear without treating them as navigation or actions
- [x] 13.5 Run quality gates after checklist follow-up

## 14. Site Navbar Slot Regression

- [x] 14.1 Identify why SiteLayout showed center links but not graphic identity or actions
- [x] 14.2 Move public navigation from default VaNavbar slot to the `center` slot
- [x] 14.3 Add regression coverage for SiteLayout header zones
- [x] 14.4 Run quality gates after SiteLayout navbar fix

## 15. Fixed Navbar Follow-up

- [x] 15.1 Confirm SiteLayout header still disappeared on page scroll
- [x] 15.2 Use Vuestic `VaNavbar fixed` for SiteLayout instead of relying only on sticky CSS
- [x] 15.3 Apply the same fixed navbar behavior to AccountLayout and DashboardShell headers
- [x] 15.4 Add regression assertions for fixed SiteLayout and DashboardShell headers
- [x] 15.5 Run quality gates after fixed navbar follow-up

## 16. Site Fixed Header Spacing Follow-up

- [x] 16.1 Add explicit fixed-header offset to SiteLayout content
- [x] 16.2 Reserve viewport height so SiteLayout footer reaches bottom on short pages
- [x] 16.3 Run quality gates after SiteLayout spacing fix

## 17. Authenticated Fixed Header Spacing Follow-up

- [x] 17.1 Add explicit fixed-header offset to App/Admin DashboardShell content
- [x] 17.2 Add explicit fixed-header offset to App/Admin DashboardShell sidebar navigation
- [x] 17.3 Reserve viewport height so App/Admin footer reaches bottom on short pages
- [x] 17.4 Add explicit fixed-header offset to AccountLayout content and sidebar navigation
- [x] 17.5 Reserve viewport height so Account footer reaches bottom on short pages
- [x] 17.6 Run quality gates after authenticated layout spacing fix

## 18. Placeholder Theme Contrast Follow-up

- [x] 18.1 Identify placeholder alert text contrast regression after theme toggle
- [x] 18.2 Force PagePlaceholder card and alert content to use current theme text token
- [x] 18.3 Run quality gates after placeholder contrast fix

## 19. Site Header Active Route Follow-up

- [x] 19.1 Add active-route underline styling to SiteLayout header links
- [x] 19.2 Add regression coverage for active route class on SiteLayout navigation
- [x] 19.3 Run quality gates after active route underline fix

## 20. Mock Session Switcher Route Context Follow-up

- [x] 20.1 Add a visible border and shadow to the mock session panel
- [x] 20.2 Add active Layout and Page tags to the mock session panel
- [x] 20.3 Highlight the active page in contextual page links
- [x] 20.4 Add a bordered visual surface around the security setup switch
- [x] 20.5 Run quality gates after mock session panel update

## 21. Mock Session Switcher Section Label Follow-up

- [x] 21.1 Remove separate route-context chips from the mock session panel
- [x] 21.2 Add `Layout` text label to the layout button section
- [x] 21.3 Add `Page` text label to the page button section
- [x] 21.4 Run quality gates after mock session section label update

## 22. Footer Consistency Follow-up

- [x] 22.1 Review footer text across Site, App/Admin, and Account layouts
- [x] 22.2 Align DashboardShell footer copy with SiteLayout copyright copy
- [x] 22.3 Align AccountLayout footer copy with SiteLayout copyright copy
- [x] 22.4 Run quality gates after footer consistency update

## 23. Shared Footer Follow-up

- [x] 23.1 Extract duplicated layout footer markup and styling into a shared web component
- [x] 23.2 Replace Site, Dashboard, and Account layout footer markup with the shared component
- [x] 23.3 Run quality gates after shared footer extraction

## 24. Header Session Context Follow-up

- [x] 24.1 Add regression coverage for authenticated header account/session context
- [x] 24.2 Render account identity plus session details in DashboardShell header
- [x] 24.3 Render account identity plus session details in AccountLayout header
- [x] 24.4 Run quality gates after header session context update

# Design System (Live Spec)

## Purpose

Define the current visual foundation for `packages/web` after the Vuestic UI migration.

## Framework

- Component framework: Vuestic UI.
- Plugin configuration: `src/plugins/vuestic.ts`.
- App styles: `src/styles/main.css`.
- Reusable shell components: `src/components/shared`.
- Usage rules and implementation gotchas: [`vuestic-usage.md`](./vuestic-usage.md).

## Theme Presets

The app defines two Vuestic color presets:

- `puintegraLight`
- `puintegraDark`

Theme switching is handled by `src/composables/useThemePreference.ts`.

## Brand Tokens

Light theme:

| Token | Value |
| --- | --- |
| `primary` | `#0B1F4C` |
| `secondary` | `#1A3A6B` |
| `success` / `accent` | `#3BB54A` |
| `info` | `#2C88D9` |
| `warning` | `#F2A900` |
| `danger` | `#D3455B` |
| `backgroundPrimary` | `#F6F8FB` |
| `backgroundSecondary` | `#FFFFFF` |
| `backgroundCardPrimary` | `#FFFFFF` |
| `textPrimary` | `#172033` |
| `textInverted` | `#FFFFFF` |

Dark theme:

| Token | Value |
| --- | --- |
| `primary` | `#7EA6E0` |
| `secondary` | `#A8C3EA` |
| `success` / `accent` | `#6FD27A` |
| `info` | `#6BB7F0` |
| `warning` | `#FFD166` |
| `danger` | `#FF7D8E` |
| `backgroundPrimary` | `#07101F` |
| `backgroundSecondary` | `#0F1B2D` |
| `backgroundCardPrimary` | `#121F33` |
| `textPrimary` | `#EEF4FF` |
| `textInverted` | `#07101F` |

## Domain Accents

Domain shell metadata lives in `src/shared/constants/domains.ts`.

| Domain | Accent | Structure |
| --- | --- | --- |
| `site` | `#0B1F4C` | navbar + footer |
| `auth` | `#1A3A6B` | centered auth surface |
| `app` | `#3BB54A` | sidebar + top bar |
| `admin` | `#7E57C2` | sidebar + top bar |
| `account` | `#2C88D9` | header + account sidebar |
| `error` | `#D3455B` | centered error display |

## Theme Behavior

- The first load checks `localStorage` key `puintegra-theme-preference`.
- Valid persisted values are `light` and `dark`.
- Without a saved value, the app falls back to `prefers-color-scheme`.
- Manual toggles persist the selected value and apply the matching Vuestic preset.
- Theme state is singleton state; refs are defined outside the composable function.

## Layout Components

- `SiteLayout`: `VaLayout` root, `VaNavbar`, content area, native footer.
- `AuthLayout`: `VaLayout` root, centered logo and route content.
- `AppLayout`: delegates to `DashboardShell` with app navigation and active RFC chip.
- `AdminLayout`: delegates to `DashboardShell` with admin navigation and reference RFC chip.
- `AccountLayout`: authenticated account shell with top navigation, account sidebar, and return paths to product areas.
- `ErrorLayout`: `VaLayout` root, centered logo, error content, home link.

## Graphic Identity

- Graphic identity means a brand image that contains the product logo mark and product text.
- Layout headers SHOULD include graphic identity in the left identity zone when a brand asset is available.
- A domain title, page title, or plain text product name MAY accompany the brand image when useful, but SHOULD NOT replace the graphic identity.
- Dashboard-style authenticated headers SHOULD prefer the graphic identity image over a plain domain title in the header identity zone.
- Minimal layouts such as authentication and error pages SHOULD use a prominent standalone graphic identity image that is visually larger than compact header branding.

## Navigation Header Contract

- Layouts with navigation headers MUST keep the header fixed or sticky at the top so navigation remains available while scrolling.
- Navigation headers SHOULD be split into three or four clear zones:
  - `identity`: graphic identity image and optional supporting title.
  - `primary-navigation`: main route links for the current layout domain.
  - `session-context`: for session-based layouts, user name, icons, session state, selectors, RFC, or other active context.
  - `actions`: primary actions such as login, theme toggle, and account controls.
- In session-based layouts, `session-context` SHOULD sit near `actions` on the right side.
- Session-based layouts SHOULD NOT replace session context with only a static domain title.
- Navigation header and body MUST have light-to-medium visible contrast.
- Body and footer MUST have high visible contrast.
- Contrast MAY be created through background color, borders, shadows, or a combination of these.

`DashboardShell` owns the shared authenticated dashboard structure:

- left `VaSidebar`
- top `VaNavbar`
- theme toggle
- context chip
- router content
- footer or clear terminal page boundary

## Navigation Color Semantics

- Neutral navigation structure, sidebar icons, and persistent shell controls SHOULD use the primary brand color.
- Semantic colors SHOULD be reserved for state and feedback: success, info, warning, danger, disabled, selected, or validation states.
- Domain accent colors MAY be used as subtle highlights, but SHOULD NOT make routine navigation look like status feedback.

## Footer Contract

- Full-page layouts SHOULD provide a footer or clear terminal boundary for scrollable pages.
- Dashboard and account shells MAY place the footer inside the main content region, but body/footer contrast rules still apply.
- Footer contrast MUST be stronger than header/body contrast.

## Account Shell Contract

- Account pages SHOULD feel connected to the authenticated product shell.
- Account layouts SHOULD include a header and account sidebar when there is more than one account route.
- Account sidebars SHOULD be limited to account navigation and return paths to relevant product areas, such as App or Admin.
- Account sidebars MUST follow the same icon-plus-text rule as other desktop sidebars.

## Sidebar Contract

- Desktop sidebars MUST NOT collapse automatically.
- Sidebar items MUST include an icon and a text label.
- Sidebar navigation MUST NOT become icon-only on desktop.
- On small screens, a sidebar MAY become an overlay, drawer, or alternate navigation pattern, but it MUST preserve readable text labels.
- Existing sidebar minimization behavior is technical debt if it violates the desktop icon-plus-text contract.

## Showcase

The route `/site/demo` is the living visual reference. It must stay inside `SiteLayout` and render:

- color token swatches
- typography examples
- core Vuestic component samples
- layout domain reference cards

Update this spec whenever visual tokens, shell structure, or theme behavior changes.

## ADDED Requirements

### Requirement: SiteLayout with navbar and footer
The SiteLayout SHALL render a fixed or sticky `VaNavbar` at the top with graphic identity, navigation links, right-side actions, a main content area via `router-view`, and a footer at the bottom. Graphic identity means a brand image containing both product logo mark and product text. It SHALL NOT include a sidebar.

#### Scenario: Public visitor sees navbar and footer
- **WHEN** a user navigates to any `/site/*` route
- **THEN** the page SHALL display a top navbar with PUIntegra graphic identity, a footer with copyright information, and the page content between them

#### Scenario: Navbar contains navigation links
- **WHEN** the SiteLayout renders
- **THEN** the navbar SHALL include a link/button to the login page (`/auth/login`) and the theme toggle in the right-side actions zone

### Requirement: AuthLayout centered and minimal
The AuthLayout SHALL render a centered layout with PUIntegra graphic identity prominently displayed and the page content (login form, registration, etc.) centered both horizontally and vertically. The graphic identity SHALL be visually larger than compact header branding. It SHALL NOT include sidebar or footer navigation.

#### Scenario: Auth page renders centered
- **WHEN** a user navigates to any `/auth/*` route
- **THEN** the page content SHALL be centered on the viewport with the PUIntegra logo visible above or beside the content area

### Requirement: DashboardShell shared component
A reusable `DashboardShell.vue` component SHALL be created using `VaLayout` with:
- A persistent `VaSidebar` (left slot) with navigation items
- A fixed or sticky top bar area with graphic identity, session context information, and theme toggle
- A main content area rendering `router-view`
- A footer or clear terminal page boundary

The component SHALL accept props for: sidebar menu items, domain accent color, domain title, chip label/value (for RFC context), and optional session context.

#### Scenario: Sidebar renders navigation items
- **WHEN** the DashboardShell renders with a menu items prop
- **THEN** the sidebar SHALL display all provided navigation items as clickable links using `VaSidebarItem`
- **AND** every desktop sidebar item SHALL include an icon and text label

#### Scenario: Sidebar remains readable on desktop
- **WHEN** the DashboardShell renders on desktop
- **THEN** the sidebar SHALL remain expanded with icon and text labels

#### Scenario: Sidebar adapts on small screens
- **WHEN** the viewport width is below the tablet breakpoint (< 1024px)
- **THEN** the sidebar MAY use a drawer, overlay, or alternate navigation pattern
- **AND** navigation items SHALL preserve readable text labels

### Requirement: AppLayout uses DashboardShell
The AppLayout SHALL use the `DashboardShell` component configured with:
- App-domain navigation items (dashboard, requests, logs, admin sub-items)
- App-domain accent color
- Institution RFC context chip
- Right-side session context

#### Scenario: App layout renders dashboard shell
- **WHEN** a user navigates to any `/app/*` route
- **THEN** the layout SHALL render a sidebar with app-specific navigation and display the active RFC in the top bar

### Requirement: AdminLayout uses DashboardShell
The AdminLayout SHALL use the `DashboardShell` component configured with:
- Admin-domain navigation items (institutions, logs)
- Admin-domain accent color
- Reference RFC context chip

#### Scenario: Admin layout renders dashboard shell with distinct accent
- **WHEN** a user navigates to any `/admin/*` route
- **THEN** the layout SHALL render the same shell structure as AppLayout but with a distinct accent color and admin-specific navigation items

### Requirement: AccountLayout independent authenticated shell
The AccountLayout SHALL render as a connected authenticated shell with a fixed or sticky header, account sidebar, main content area, and footer or clear terminal page boundary. It SHALL include PUIntegra graphic identity, account navigation, and return paths to relevant App or Admin areas.

#### Scenario: Account layout renders account sidebar
- **WHEN** a user navigates to any `/account/*` route
- **THEN** the layout SHALL display a top bar with graphic identity and an account sidebar with icon-plus-text links for account pages and return paths

### Requirement: ErrorLayout minimal centered display
The ErrorLayout SHALL render error page content centered on the viewport with prominent PUIntegra graphic identity and a link to return to the home page. The graphic identity SHALL be visually larger than compact header branding. It SHALL NOT include sidebar, footer, or complex navigation.

#### Scenario: Error page renders centered with logo
- **WHEN** a user navigates to any `/error/*` route
- **THEN** the error content SHALL be centered with the PUIntegra logo visible and a "Return to home" link available

### Requirement: All layouts use VaLayout
All six layouts MUST use Vuestic's `VaLayout` component as their root layout element, replacing the current Vuetify `v-layout`.

#### Scenario: Layout renders with VaLayout
- **WHEN** any layout component is mounted
- **THEN** its root element SHALL be a `VaLayout` Vuestic component

### Requirement: Responsive behavior
All layouts SHALL be responsive with a desktop-first approach. Dashboard and account sidebars MAY switch to a drawer, overlay, or alternate navigation pattern below 1024px, but SHALL NOT become icon-only navigation. All layouts SHALL remain functional and readable on mobile viewports (≥ 320px).

#### Scenario: Dashboard layout adapts to mobile
- **WHEN** the viewport is resized below 1024px on a dashboard layout
- **THEN** navigation SHALL remain readable and the content area SHALL occupy the available width

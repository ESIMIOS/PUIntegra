## ADDED Requirements

### Requirement: SiteLayout with navbar and footer
The SiteLayout SHALL render a `VaNavbar` at the top with the brand logo and navigation links, a main content area via `router-view`, and a `VaFooter` at the bottom. It SHALL NOT include a sidebar.

#### Scenario: Public visitor sees navbar and footer
- **WHEN** a user navigates to any `/site/*` route
- **THEN** the page SHALL display a top navbar with the PUIntegra logo, a footer with copyright information, and the page content between them

#### Scenario: Navbar contains navigation links
- **WHEN** the SiteLayout renders
- **THEN** the navbar SHALL include a link/button to the login page (`/auth/login`)

### Requirement: AuthLayout centered and minimal
The AuthLayout SHALL render a centered layout with the PUIntegra logo prominently displayed and the page content (login form, registration, etc.) centered both horizontally and vertically. It SHALL NOT include sidebar or footer navigation.

#### Scenario: Auth page renders centered
- **WHEN** a user navigates to any `/auth/*` route
- **THEN** the page content SHALL be centered on the viewport with the PUIntegra logo visible above or beside the content area

### Requirement: DashboardShell shared component
A reusable `DashboardShell.vue` component SHALL be created using `VaLayout` with:
- A collapsible `VaSidebar` (left slot) with navigation items
- A top bar area with domain title, user context information, and theme toggle
- A main content area rendering `router-view`

The component SHALL accept props for: sidebar menu items, domain accent color, domain title, and chip label/value (for RFC context).

#### Scenario: Sidebar renders navigation items
- **WHEN** the DashboardShell renders with a menu items prop
- **THEN** the sidebar SHALL display all provided navigation items as clickable links using `VaSidebarItem`

#### Scenario: Sidebar collapses on toggle
- **WHEN** a user clicks the sidebar collapse/expand control
- **THEN** the sidebar SHALL toggle between expanded (with labels) and minimized (icon-only) states

#### Scenario: Sidebar collapses automatically on small screens
- **WHEN** the viewport width is below the tablet breakpoint (< 1024px)
- **THEN** the sidebar SHALL automatically collapse to minimized or overlay mode

### Requirement: AppLayout uses DashboardShell
The AppLayout SHALL use the `DashboardShell` component configured with:
- App-domain navigation items (dashboard, requests, logs, admin sub-items)
- App-domain accent color
- Institution RFC context chip

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
The AccountLayout SHALL render as an independent layout for authenticated users with a simple top navigation bar (not a full sidebar). It SHALL include the PUIntegra logo, a back-to-app link, and minimal sub-navigation for account settings pages.

#### Scenario: Account layout renders without sidebar
- **WHEN** a user navigates to any `/account/*` route
- **THEN** the layout SHALL display a simple top bar with logo and navigation links (Settings, Logs) without a full sidebar

### Requirement: ErrorLayout minimal centered display
The ErrorLayout SHALL render error page content centered on the viewport with the PUIntegra logo and a link to return to the home page. It SHALL NOT include sidebar, footer, or complex navigation.

#### Scenario: Error page renders centered with logo
- **WHEN** a user navigates to any `/error/*` route
- **THEN** the error content SHALL be centered with the PUIntegra logo visible and a "Return to home" link available

### Requirement: All layouts use VaLayout
All six layouts MUST use Vuestic's `VaLayout` component as their root layout element, replacing the current Vuetify `v-layout`.

#### Scenario: Layout renders with VaLayout
- **WHEN** any layout component is mounted
- **THEN** its root element SHALL be a `VaLayout` Vuestic component

### Requirement: Responsive behavior
All layouts SHALL be responsive with a desktop-first approach. Dashboard layouts (App, Admin) SHALL have sidebars that collapse below 1024px. All layouts SHALL remain functional and readable on mobile viewports (≥ 320px).

#### Scenario: Dashboard layout adapts to mobile
- **WHEN** the viewport is resized below 1024px on a dashboard layout
- **THEN** the sidebar SHALL collapse and the content area SHALL occupy the full width

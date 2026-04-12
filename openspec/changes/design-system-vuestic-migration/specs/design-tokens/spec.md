## ADDED Requirements

### Requirement: Brand color palette definition
The system SHALL define a brand-aligned color palette mapped to Vuestic's `config.colors` API. The palette MUST include at minimum:
- `primary`: Azul PUIntegra (`#0B1F4C`)
- `secondary`: A complementary blue derived from primary (e.g., `#1A3A6B`)
- `success` / `accent`: Verde acento (`#3BB54A`)
- `info`, `warning`, `danger`: Semantic status colors
- `backgroundPrimary`, `backgroundSecondary`, `backgroundCardPrimary`: Surface colors
- `textPrimary`, `textInverted`: Text colors

All colors MUST be defined for both light and dark presets.

#### Scenario: Light theme palette renders correctly
- **WHEN** the app loads with light theme active
- **THEN** the primary color used by Vuestic components SHALL be `#0B1F4C` and success/accent SHALL be `#3BB54A`

#### Scenario: Dark theme palette renders correctly
- **WHEN** the app loads with dark theme active
- **THEN** the primary color SHALL be a lighter variant of `#0B1F4C` suitable for dark backgrounds, and surface/background colors SHALL use dark tones

### Requirement: Design tokens centralization
All design tokens (colors, spacing scale, border radii, elevation/shadow levels) SHALL be defined in a single configuration file (`plugins/vuestic.ts`) and exposed as CSS custom properties through Vuestic's theming system.

#### Scenario: Tokens are accessible as CSS custom properties
- **WHEN** a developer inspects any rendered page
- **THEN** the document root SHALL contain CSS custom properties prefixed with `--va-` for all defined color tokens

#### Scenario: Components inherit tokens automatically
- **WHEN** a Vuestic component (e.g., `VaButton`, `VaCard`) is rendered
- **THEN** it SHALL use the brand palette colors without explicit per-component color overrides

### Requirement: Domain accent tokens
Each layout domain (site, auth, app, admin, account, error) SHALL have a semantic accent value defined in the `domainShell` configuration. This accent MUST be applied at the layout level to differentiate domains visually while maintaining palette cohesion.

#### Scenario: App domain renders with its accent
- **WHEN** a user navigates to any `/app/*` route
- **THEN** the layout's primary interactive elements (sidebar highlight, app bar) SHALL reflect the App domain's accent color

#### Scenario: Admin domain renders with its accent
- **WHEN** a user navigates to any `/admin/*` route
- **THEN** the layout SHALL use the Admin domain's accent color, visually distinct from the App domain

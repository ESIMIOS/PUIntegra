## ADDED Requirements

### Requirement: Design showcase page at /site/demo
A demo page SHALL be accessible at the route `/site/demo` within the SiteLayout. This page SHALL serve as a living design system reference displaying the defined design tokens and key component patterns.

#### Scenario: Demo page is navigable
- **WHEN** a user navigates to `/site/demo`
- **THEN** the page SHALL render within the SiteLayout (navbar + footer) and display the design system showcase content

### Requirement: Color palette display
The showcase page SHALL display all defined color tokens (primary, secondary, success, info, warning, danger, and surface colors) as visual swatches with their hex values and CSS variable names.

#### Scenario: Color swatches render for current theme
- **WHEN** the demo page loads in light theme
- **THEN** it SHALL display color swatches reflecting the light theme palette with labels

#### Scenario: Color swatches update on theme change
- **WHEN** the user toggles to dark theme while on the demo page
- **THEN** the color swatches SHALL update to reflect the dark theme palette values

### Requirement: Typography showcase
The showcase page SHALL display the active font family and a typographic scale (headings h1-h6, body text, captions) using the Vuestic default typography.

#### Scenario: Typography section renders
- **WHEN** the demo page loads
- **THEN** it SHALL display labeled examples of each heading level and body text styles

### Requirement: Component patterns showcase
The showcase page SHALL display key Vuestic UI components used across the application, including at minimum: `VaButton` variants, `VaCard`, `VaAlert` types, `VaChip` variants, and form input samples.

#### Scenario: Component samples render with brand palette
- **WHEN** the demo page loads
- **THEN** all showcased components SHALL render using the defined brand color tokens (not Vuestic defaults)

### Requirement: Layout preview section
The showcase page SHALL include a section describing the 6 layout domains with their accent colors and structural descriptions, serving as a quick reference for developers and AI agents.

#### Scenario: Layout descriptions are listed
- **WHEN** the demo page loads
- **THEN** it SHALL display a table or card grid listing all 6 domains with their name, accent color swatch, and structural description (e.g., "sidebar + top bar" or "centered, no sidebar")

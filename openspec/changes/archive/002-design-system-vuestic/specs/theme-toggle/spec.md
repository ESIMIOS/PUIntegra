## ADDED Requirements

### Requirement: System preference detection
The theme system SHALL detect the user's operating system color scheme preference using the `prefers-color-scheme` media query on initial load.

#### Scenario: User with dark OS preference sees dark theme
- **WHEN** a user visits the app for the first time with OS dark mode enabled and no saved preference in `localStorage`
- **THEN** the app SHALL render in dark theme

#### Scenario: User with light OS preference sees light theme
- **WHEN** a user visits the app for the first time with OS light mode enabled and no saved preference in `localStorage`
- **THEN** the app SHALL render in light theme

### Requirement: User theme override
The user SHALL be able to manually toggle between light and dark themes using a toggle control visible in authenticated layouts (DashboardShell top bar, AccountLayout top bar) and in the SiteLayout navbar.

#### Scenario: User toggles to dark theme
- **WHEN** the user clicks the theme toggle while in light mode
- **THEN** the app SHALL immediately switch to dark theme with all Vuestic components reflecting the dark color preset

#### Scenario: User toggles to light theme
- **WHEN** the user clicks the theme toggle while in dark mode
- **THEN** the app SHALL immediately switch to light theme

### Requirement: localStorage persistence
When the user manually selects a theme, the preference SHALL be persisted to `localStorage` under a defined key (e.g., `puintegra-theme-preference`).

#### Scenario: Saved preference is restored on reload
- **WHEN** a user has previously selected dark theme and reloads the page
- **THEN** the app SHALL load in dark theme regardless of OS preference

#### Scenario: Clearing localStorage restores system preference
- **WHEN** `localStorage` does not contain a theme preference key
- **THEN** the app SHALL fall back to the OS `prefers-color-scheme` preference

### Requirement: useThemePreference singleton composable
The theme logic SHALL be encapsulated in a `useThemePreference` composable following the project's singleton pattern (state defined outside function scope). The composable SHALL expose:
- `currentTheme: Ref<'light' | 'dark'>` — reactive current theme
- `toggleTheme(): void` — switches between light/dark
- `isDark: ComputedRef<boolean>` — convenience computed

#### Scenario: Multiple components share theme state
- **WHEN** two components call `useThemePreference()`
- **THEN** both SHALL receive the same reactive `currentTheme` reference (singleton behavior)

### Requirement: Theme toggle component
A reusable `ThemeToggle.vue` component SHALL be created that renders a light/dark toggle button (icon-based: sun/moon) and calls `useThemePreference().toggleTheme()` on click.

#### Scenario: ThemeToggle renders correct icon
- **WHEN** the current theme is dark
- **THEN** the toggle button SHALL display a sun icon (indicating "switch to light")

#### Scenario: ThemeToggle renders correct icon for light
- **WHEN** the current theme is light
- **THEN** the toggle button SHALL display a moon icon (indicating "switch to dark")

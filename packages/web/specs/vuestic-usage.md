# Vuestic Usage Guidelines (Live Spec)

## Purpose

Define practical rules for using Vuestic UI in `packages/web` so pages, layouts, tests, and future AI-generated code stay consistent.

## Source Of Truth

- Vuestic plugin configuration lives in `src/plugins/vuestic.ts`.
- Global Vuestic styles are imported in `src/main.ts` with `import 'vuestic-ui/css'`.
- Font links required by Vuestic live in `index.html`.
- Design tokens and domain accents are documented in [`design-system.md`](./design-system.md).

## Installation Contract

`index.html` must keep the Vuestic-documented font links:

```html
<link
  href="https://fonts.googleapis.com/css2?family=Source+Sans+Pro:ital,wght@0,400;1,700&display=swap"
  rel="stylesheet"
/>
<link
  href="https://fonts.googleapis.com/icon?family=Material+Icons"
  rel="stylesheet"
/>
```

Do not replace these with ad hoc icon text, inline SVGs, or unrelated icon packages unless the design-system spec is updated in the same change.

Material Icons support is solved by linking the Material Icons stylesheet in `index.html`. Do not add icon font packages for this unless explicitly approved.

## Icons

- Use `VaIcon` for Material Icons.
- Use Material icon names directly, for example `dark_mode`, `light_mode`, `menu`, and `menu_open`.
- Register icon fonts and aliases in `src/plugins/vuestic.ts` using `createIconsConfig`, `VuesticIconFonts`, and `VuesticIconAliases`.
- If a `VaIcon` renders the icon name as text, check `index.html` font links first, then check `src/plugins/vuestic.ts`.
- Do not troubleshoot Material Icons by replacing `VaIcon` with inline SVGs; fix the font link/configuration instead.

Correct:

```vue
<VaIcon name="dark_mode" />
```

Avoid:

```vue
<span>dark_mode</span>
```

## Layouts

- Domain layouts must use `VaLayout` as the root layout component.
- Use `VaNavbar` for top bars and `VaSidebar` for dashboard side navigation.
- `SiteLayout`, `AccountLayout`, and `DashboardShell` must wrap navbar right-slot content in a flex action container with an explicit `gap`.
- Do not rely on Vuestic slot internals for spacing between router links, buttons, chips, and toggles.
- Navigation headers that contain page navigation must be fixed or sticky at the top.
- Header content should be grouped into left graphic identity, center navigation, right-side session context, and right actions.
- The left identity zone should render `AppLogo` in full mode when a graphic identity asset is available. Do not replace it with plain domain text.
- `AuthLayout` and `ErrorLayout` should render `AppLogo` in a prominent size instead of reusing compact header sizing.
- `DashboardShell` should render `AppLogo` in the top header identity zone and reserve a right-side group for session context before actions.
- Desktop `VaSidebar` navigation must show icon and text for every item; do not collapse it into icon-only navigation on desktop.
- Routine sidebar icons should use the primary brand color. Use success, info, warning, and danger colors for state and feedback, not routine navigation.
- `AccountLayout` should use `VaNavbar` plus `VaSidebar` when there is more than one account route. The sidebar should include account navigation and return paths only.
- Dashboard and account shells should include a footer or clear terminal boundary with stronger body/footer contrast than header/body contrast.

Correct:

```vue
<template #right>
  <div class="layout-actions">
    <RouterLink to="/site/demo">Demo</RouterLink>
    <VaButton to="/auth/login">Ingresar</VaButton>
    <ThemeToggle />
  </div>
</template>
```

```css
.layout-actions {
  display: flex;
  align-items: center;
  gap: 0.85rem;
}
```

## Typography

- Let Vuestic and the documented `Source Sans Pro` link drive the base typography.
- Do not set a global `font-family` in `src/styles/main.css` unless a design-system change explicitly approves it.
- Page-specific headings may set size, weight, line height, and color, but letter spacing must remain `0`.

## Forms And Selects

- Prefer Vuestic form components for product UI.
- Use `VaSelect` with object options when values are constrained.
- Always define `text-by`, `value-by`, and `track-by` when using object options.
- Use `size="small"` for switches when visual space is constrained.
- Prefer `VaCheckbox` over `VaSwitch` when the state is not an immediate mode/action toggle.
- If an action is self-explaining through opposite states, such as dark/light theme, use icons plus background/state contrast.

Correct:

```vue
<VaSelect
  v-model="roleModel"
  :options="roleOptions"
  text-by="text"
  value-by="value"
  track-by="value"
  label="Rol activo"
/>
```

```ts
const roleOptions = roleValues.map((role) => ({
  text: role,
  value: role
}))
```

For fixed or floating panels such as the mock session switcher:

- Use `teleport="body"` for dropdown content.
- Add a specific `content-class`.
- Set an explicit global z-index for that content class.

```vue
<VaSelect
  teleport="body"
  content-class="mock-switcher__select-dropdown"
/>
```

```css
:global(.mock-switcher__select-dropdown) {
  z-index: 1200 !important;
}
```

Do not pass `:teleport="false"` to `VaSelect`; Vuestic expects a selector or element target.
`VaSelect` dropdown issues in fixed panels should be solved with valid `teleport`, `content-class`, and z-index rules, not by replacing `VaSelect` with a native select.

## Buttons And Links

- Use `VaButton` for actions.
- Use `RouterLink` for plain navigation links.
- Style router links explicitly when they appear in navbars or tab-like navigation.
- Keep button and link spacing in parent flex containers, not with margin utilities on individual children.
- Icon-only buttons must use the primary preset, must be rounded, and must not include visible text.
- Icon-only buttons must still provide an accessible `aria-label`.

Correct icon-only button:

```vue
<VaButton
  preset="primary"
  color="primary"
  round
  aria-label="Alternar navegación lateral"
>
  <VaIcon name="menu" />
</VaButton>
```

Avoid:

```vue
<VaButton preset="plain">
  <VaIcon name="menu" />
  Menu
</VaButton>
```

## Cards And Surfaces

- Use `VaCard`, `VaCardTitle`, and `VaCardContent` for framed content blocks.
- Keep border radius at `8px` or less.
- Avoid cards inside cards.
- Prefer full-width layout bands or plain sections for page-level structure.

## Theme Usage

- Use `useThemePreference()` for theme state.
- Do not call `useColors().applyPreset()` directly in components; keep that behavior centralized in the composable.
- Theme labels and toggles must be accessible with `aria-label` or visible text.

## CSS Utility Reference

- Reusable spacing, border, sizing, layout, and transform rules should use documented product utility classes.
- Avoid excessive SFC-scoped CSS for generic styling.
- CSS utility rules live in [`css-utilities.md`](./css-utilities.md).

## Registration Strategy

- The MVP uses `createVuestic()` for global component registration.
- Do not mix global registration with partial Vuestic registration casually.
- If bundle size becomes a product requirement, migrate deliberately to `createVuesticEssential()` or explicit component registration in a dedicated change.
- The current production build chunk-size warning is acceptable for the MVP while global `createVuestic()` is in use.

## Testing

- Component tests that need Vuestic should use `tests/utils/mount.ts`.
- When stubbing Vuestic components, preserve the slot structure used by the component under test.
- For `VaNavbar`, include named slots:

```ts
VaNavbar: {
  template: '<header><slot name="left" /><slot /><slot name="right" /></header>'
}
```

- Tests may stub `VaIcon` by rendering its `name` prop, but production code must use real `VaIcon`.

## Common Failure Modes

- Icon name appears as text: Material Icons font link is missing or not loaded.
- Dropdown opens behind a fixed panel: `teleport` target or z-index is wrong.
- Navbar actions are glued together: right-slot content lacks an explicit flex wrapper and `gap`.
- Build chunk warning after Vuestic migration: expected while using `createVuestic()` globally; optimize later with tree-shaken Vuestic setup if bundle size becomes a product requirement.

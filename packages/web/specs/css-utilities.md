# CSS Utilities (Live Spec)

## Purpose

Define how reusable product CSS utility classes should be named, organized, and used in `packages/web`.

## Source Of Truth

- Product-wide utility classes live in `src/styles/main.css`.
- Vuestic-specific usage rules live in [`vuestic-usage.md`](./vuestic-usage.md).
- Visual tokens and layout contrast rules live in [`design-system.md`](./design-system.md).

## Usage Rule

- Avoid excessive scoped CSS inside Vue SFCs when the style is reusable.
- Prefer documented utility classes for common spacing, borders, layout, sizing, and transforms.
- Keep component scoped CSS for component-specific structure, behavior, or visual rules that are not reusable.
- Mix utility classes when a style is generic and composable.
- Avoid repeating one-off declarations across components.
- Use existing utilities before adding new ones.
- Do not add a utility class for a one-off component need unless the pattern is expected to recur.
- New utility classes introduced in `src/styles/main.css` SHOULD be documented in this spec in the same change.

Correct:

```vue
<div class="d-flex align-center g-_75-r b-t b-w-1 b-s-s">
  ...
</div>
```

Avoid:

```vue
<div class="component-actions">
  ...
</div>
```

```css
.component-actions {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  border-top: 1px solid var(--va-background-border);
}
```

## Organization

`src/styles/main.css` SHOULD be organized into documented sections in this order:

1. Design tokens and root variables.
2. Base document styles.
3. Layout utilities.
4. Spacing utilities.
5. Gap utilities.
6. Border utilities.
7. Typography utilities.
8. Sizing utilities.
9. Transform utilities.
10. Visibility and accessibility utilities.

Each section SHOULD stay alphabetized or ordered from smallest to largest values when applicable.

## Naming

- Utility names use kebab-like short segments for property and direction.
- Numbers without suffix mean pixels.
- `p` suffix means percentage.
- `r` suffix means rem.
- Use underscore for decimal values.
- Use explicit semantic names when they are clearer than numeric abbreviations.

Examples:

| Class | Meaning |
| --- | --- |
| `m-t-5` | `margin-top: 5px` |
| `m-t-5p` | `margin-top: 5%` |
| `g-_75-r` | `gap: 0.75rem` |
| `p-x-1-r` | horizontal padding `1rem` |
| `scale_half` | `transform: scale(0.5)` |
| `scale_150p` | `transform: scale(1.5)` |
| `scale_double` | `transform: scale(2)` |

## Border Utilities

Border utilities MAY be atomic:

| Class | Meaning |
| --- | --- |
| `b-t` | border top |
| `b-r` | border right |
| `b-b` | border bottom |
| `b-l` | border left |
| `b-w-1` | border width `1px` |
| `b-s-s` | border style solid |

If a border pattern repeats often and becomes noisy in templates, create a named utility.

Example:

```css
.surface_divider_top {
  border-top: 1px solid var(--va-background-border);
}
```

## Balance Rule

- Prefer utility composition for generic layout or spacing.
- Prefer named semantic utilities for repeated product patterns.
- Prefer scoped component CSS when the rule is unique to that component.
- Do not create utilities for values used once.
- Do not make templates unreadable with excessive micro-classes; extract repeated combinations into named utilities.

## Vuestic Components

- Use utility classes around Vuestic components for spacing and layout.
- Do not override Vuestic internals unless the behavior cannot be achieved through props, slots, or wrapper utilities.
- When a Vuestic component needs repeated product styling, document the pattern in [`vuestic-usage.md`](./vuestic-usage.md) and add reusable classes here.

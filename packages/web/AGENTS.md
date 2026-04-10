# web — Agent Context

Vue 3 + Vite + Pinia. State lives in stores/, API calls in composables/.
Components must be presentational — no direct Firebase SDK calls in components.

## Rules specific to this package
- Import shared contracts through `@shared` alias in web package code
- Validate API responses with Zod schemas before writing to Pinia store
- No Firebase SDK calls inside components — use composables/ only
- Composables follow the pattern: use<Entity><Action>.ts
- Test components with @vue/test-utils + Vitest only

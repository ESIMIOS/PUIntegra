# Bill of Materials (BoM) Strategy

The BoM strategy is a core architectural pattern in PUIntegra to centralize and organize shared dependencies through a single `src/bom.ts` file.

## Important distinction: local vs shared dependencies

1. **Local dependencies (direct import)**
- Files in the same directory.
- Files/components in child subdirectories.
- Models or types specific to a page/module.
- Use explicit relative paths (`./` or `../`) for local dependencies.
- Do not use `@/` alias for same-feature local modules.

```typescript
// Correct: direct local dependencies
import { MyPageViewModel } from './my-page-view-model'
import { MyComponent } from './components/my-component'
import { MyLocalType } from './types'
```

2. **Shared dependencies (through BoM)**
- External NPM packages.
- Shared modules across product folders.
- Reusable utilities and components.

```typescript
// Correct: shared dependencies via BoM
import { computed, z, useAuthStore, routePaths } from '@/bom'
```

This distinction preserves local encapsulation while keeping centralized traceability for shared dependencies.

## BoM structure and levels

1. **OPENSOURCE**
- Purpose: Third-party dependencies from public registries.
- Example: `vue-router`, `pinia`, `zod`, `vuetify`.
- Location: top section of `src/bom.ts`.

2. **TEAM**
- Purpose: Reusable packages built by the team.
- Scope: shared across organization products/projects.

3. **PROJECT**
- Purpose: Shared code inside the PUIntegra project.
- Scope: within the PUIntegra monorepo boundary.
- Example: contracts imported from `@shared` alias (system-wide constants, enums, and schemas).

4. **PRODUCT**
- Purpose: Shared code specific to the PUIntegra Web product.
- Scope: `packages/web`.

## Implementation rules

1. **Centralization**

```typescript
// Correct: import via BoM
import { createRouter, createWebHistory } from '@/bom'

// Incorrect: direct import from external package
import { createRouter, createWebHistory } from 'vue-router'
```

Documented exception:
- Router core modules (`routes.ts`, `createRouter.ts`, `guards.ts`, `metaSchema.ts`) may keep direct internal imports to avoid initialization cycles when a `bom.ts` re-export breaks runtime execution.
- Tooling bootstrap files (for example `vite.config.ts`) may use direct imports because they are evaluated before app aliases resolve and should not depend on `src/bom.ts`.
- App bootstrap modules (`src/main.ts`, `src/app/createWebApp.ts`, `src/app/registerServiceWorker.ts`) may use direct imports and should not be re-exported from `bom.ts` when this introduces initialization cycles.

Project-wide contract rule:
- System-wide constants and enums must live in `packages/shared` and be consumed in web from `@shared`.
- Avoid local pass-through files that only re-export `@shared` symbols; consume those symbols directly from `@shared`.
- Product-only defaults (for local mock or UI scaffolding) remain in `packages/web`.
- Navigation labels and route-target catalogs are shared product contracts and must be centralized in `src/shared/constants` and consumed through `@/bom`.

2. **Documentation**
- JSDoc, changelog format, and language conventions are defined globally in [`openspec/specs/engineering-standards.md`](../../../openspec/specs/engineering-standards.md).
- This BoM spec only defines dependency-centralization behavior specific to `packages/web`.

3. **Organization**
- Keep visible categories (`OPENSOURCE`, `TEAM`, `PROJECT`, `PRODUCT`).
- Sort exports alphabetically by category when possible.
- Avoid unnecessary exports that create cycles.

## Implementation example

```typescript
/** OPENSOURCE */
export { computed, createApp } from 'vue'
export { createPinia } from 'pinia'
export { createRouter, createWebHistory } from 'vue-router'
export { z } from 'zod'

/** PRODUCT */
export { useAuthStore } from './stores/authStore'
export { routePaths } from './shared/constants/routePaths'
```

## Benefits

1. **Dependency management**
- Single control point.
- Better supply chain traceability.
- Safer updates.

2. **Code organization**
- Less import scattering.
- Consistent conventions across modules.

3. **Security and maintainability**
- Clearer third-party auditing.
- Lower refactor risk.

4. **Structure refactor**
- Route path changes are concentrated in BoM instead of many consumers.

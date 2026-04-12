# Engineering Standards (Global Live Spec)

## Purpose

Define project-wide engineering documentation and code conventions that apply across packages, to avoid duplicated rules in package specs.

## Scope and precedence

- Scope: `packages/*` source code, tests, and persistent package specs.
- Baseline: this file is the default standard for all packages.
- Override rule: package specs may override a rule only when the override is explicit and justified in that package spec.

## Language policy

- Persistent specs are written in English.
  This includes:
  - `openspec/specs/*`
  - `packages/*/specs/*`
  - `firebase/*/specs/*`
- Ephemeral change artifacts may be written in English or Spanish, but each
  change folder must use one language consistently across
  `proposal.md`, `design.md`, and `tasks.md`:
  - `openspec/changes/*`
- Analysis corpus under `1-Análisis/*` may be written in Spanish and is not
  governed by the persistent-spec language requirement.
- Code symbols, file names, route names, and technical identifiers use English conventions.
- UI labels/copy default to Spanish unless a package spec defines explicit English term exceptions.

## JSDoc and file header policy

- New or modified TypeScript and Vue source files must include the project header JSDoc block.
- Required tags:
  - `@package`
  - `@name`
  - `@version`
  - `@description`
  - `@author`
  - `@changelog`
- `@description` must explain the file purpose and value (not a generic sentence).
- `@changelog` entries use tab-separated columns (real tab character, not `/t`):
  - `<version>\t(<YYYY-MM-DD>)\t<change summary>\t<author>`
- The first changelog entry for every file is the literal text: `Versión inicial del archivo`.

## Dependency and versioning policy

- Package dependencies must use pinned versions in `package.json` (no `^` or `~`).
- Root `.npmrc` must preserve `save-exact=true` and `save-prefix=`.
- In a file, imports from the same module specifier must be consolidated into a single `import` statement.

## Shared contract placement

- System-wide constants, enums, and contracts belong in `packages/shared`.
- Product-only defaults may stay in each product package.
- `packages/shared/src/schemas` remains approval-gated before any modification.

## Constant and schema derivation policy

- Domain string literals (roles, statuses, permissions, etc.) must be declared once in a single shared constant source.
- Zod schemas, subset lists, and inferred types must be derived from that constant source.
- Responsibility split must be explicit:
  - constants define the domain vocabulary (canonical values used by business logic),
  - schemas validate unknown/runtime inputs against that vocabulary.
- Do not place runtime validation logic in constant files.
- For structured technical logs/messages:
  - `code` and `key` use stable technical identifiers (English-style naming),
  - human-readable `message` text defaults to Spanish unless a package spec defines an exception.
- As a coding preference, avoid direct raw-string comparisons in consumer code whenever a stable constant, enum-derived value, or typed lookup map exists.
- This applies to constrained domains such as role/status/severity/domain, and to any other repeated semantic token.
- Avoid duplicating raw string literals across arrays, schemas, and consumer modules.
- If a subset is required for readability/auditability, define it explicitly from the source constant, not by retyping literals.
- In consumer packages, avoid unnecessary local type aliases when the type can be directly derived from shared exported constants or schemas.
- Do not use arbitrary primitive types (for example `string`) for constrained domain inputs when a schema/enum-derived type exists. Function params, store actions, and route metadata must use the constrained type.
- Keep related files paired by naming and proximity to reduce cognitive load:
  - `src/constants/<entity>.ts`
  - `src/schemas/<entity>.schema.ts`

## Spec maintenance model

- `openspec/changes/*`: transactional change artifacts.
- `openspec/specs/*` and `packages/*/specs/*`: persistent live specs.
## Technical anti-patterns
### Circular dependencies (Internal imports)
- **Problem**: Importing from centralized re-exporters (`bom.ts`, `index.ts`) within the same package or components that are re-exported by that file.
- **Consequence**: Module evaluation cycles lead to `undefined` values at runtime, breaking state and constants.
- **Rule**: NEVER import from a package's central re-exporter or index file from within the same package. Always use direct paths (for example `@/stores/authStore` or `../utils/foo`) for internal dependencies.

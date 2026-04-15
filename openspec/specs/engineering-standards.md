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

## TypeScript quality policy

- Prefer `String.prototype.replaceAll()` over `String.prototype.replace()` when replacing every occurrence of a plain string pattern, to satisfy SonarQube `typescript:S7781` and make the intended global replacement explicit.
- Avoid nested template literals. Extract the inner expression to a named constant or compose the string in separate steps to satisfy SonarQube `typescript:S4624` and keep interpolation readable.

## Shared contract placement

- System-wide constants, enums, and contracts belong in `packages/shared`.
- Product-only defaults may stay in each product package.
- `packages/shared/src/schemas` remains approval-gated before any modification.

## Constant and schema derivation policy

- Domain string literals (roles, statuses, permissions, etc.) must be declared once in a single shared constant source.
- Zod schemas, subset lists, and inferred types must be derived from that constant source.
- For constrained vocabularies, use this canonical shape:
  - `UPPER_SNAKE_CASE` object with stable values (`as const`)
  - `<Domain>Values` derived from that object
  - `z.enum(<Domain>Values)` for runtime validation
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

## Timestamp policy

- All persisted domain timestamps must use **UTC epoch milliseconds** as `number`.
- Shared schemas must validate them with an explicit timestamp schema (for example `TimestampMillisecondsUtcSchema`).
- Do not use ISO datetime strings in persisted entity contracts unless a spec explicitly requires external interoperability format.

## Web message boundary policy

- `webSystemMessages` is strictly technical/observability catalog.
- User-facing copy must be defined in `webUIMessages` (or equivalent UI message catalog), never embedded in system telemetry messages.
- Store/controller layers may map technical errors to UI messages, but must keep both catalogs separated.
- Message code format is `PACKAGE-CONTEXT-NNN` (single numeric sequence, zero-padded to 3 digits), for example `WEB-GUARD-001`.
- Do not encode HTTP semantics in message codes; severity and metadata represent operational context.

## Spec maintenance model

- `openspec/changes/*`: transactional change artifacts.
- `openspec/specs/*` and `packages/*/specs/*`: persistent live specs.
## Technical anti-patterns
### Circular dependencies (Internal imports)
- **Problem**: Importing from centralized re-exporters (`bom.ts`, `index.ts`) within the same package or components that are re-exported by that file.
- **Consequence**: Module evaluation cycles lead to `undefined` values at runtime, breaking state and constants.
- **Rule**: NEVER import from a package's central re-exporter or index file from within the same package. Always use direct paths (for example `@/stores/authStore` or `../utils/foo`) for internal dependencies.


## GitHub Actions security

### Pin third-party actions to full commit SHAs
- **Rule**: All third-party GitHub Actions (any action NOT in the `actions/*` or `github/*` namespaces) MUST be pinned to a full 40-character commit SHA, not a mutable tag or branch.
- **Rationale**: Mutable tags (e.g. `@v4`, `@main`) can be silently updated or hijacked by the action author or a supply-chain attacker, executing arbitrary code in your CI runner with access to all secrets.
- **Format**: `uses: owner/action@<40-char-sha> # vX.Y.Z` — the version comment is required for human readability.

```yaml
# ❌ Unsafe — tag is mutable
- uses: pnpm/action-setup@v4
- uses: FirebaseExtended/action-hosting-deploy@v0

# ✅ Safe — pinned to commit SHA with version comment
- uses: pnpm/action-setup@fe02b34f77f8bc703788d5817da081398fad5dd2 # v4.0.0
- uses: FirebaseExtended/action-hosting-deploy@e2eda2e106cfa35cdbcf4ac9ddaf6c4756df2c8c # v0
```

- First-party GitHub actions (`actions/checkout`, `actions/setup-node`, etc.) may use tags — they are governed by GitHub's own security processes.
- When upgrading a pinned action, update both the SHA and the version comment atomically.
- To find the commit SHA for a tag: `gh api repos/{owner}/{repo}/git/ref/tags/{tag}` and dereference annotated tags if `type == "tag"`.

### pnpm install script allowlist
- **Rule**: The root `package.json` MUST declare `pnpm.onlyBuiltDependencies` to allowlist the exact set of packages permitted to run lifecycle scripts (`postinstall`, `preinstall`, `install`).
- **Rationale**: Without this, any transitive dependency can run arbitrary shell code during `pnpm install` in CI, where all secrets are available.
- **Audit command**: Run the following to detect new packages with install scripts before updating the allowlist:
  ```bash
  node -e "
  const {execSync} = require('child_process');
  const r = execSync('find node_modules/.pnpm -maxdepth 5 -name package.json').toString().split('\n');
  r.forEach(f => { try { const d = JSON.parse(require('fs').readFileSync(f)); ['postinstall','preinstall','install'].forEach(k => { if (d.scripts?.[k]) console.log(d.name, k, d.scripts[k]); }); } catch {} });
  "
  ```
- **Current allowlist** (as of initial setup): `esbuild`, `farmhash`, `protobufjs`, `vue-demi`
- When adding a new dependency that requires a lifecycle script, explicitly add it to the allowlist and document the reason in the PR.

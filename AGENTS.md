# PUIntegra — Agent Context

## Project overview
PUIntegra is a SaaS for diverse institutions that need to prepare, operate,
and progressively evolve their integration with the Plataforma Única de
Identidad (PUI).

This repository implements the first product scope as an operational MVP and
also evaluates a Spec-Driven Development (SDD) workflow. Every agent working
on this repo must follow the SDD rules below.

## Stack
- Runtime:    Node.js 20 + TypeScript 5 (strict)
- Monorepo:   pnpm workspaces
- Backend:    Cloud Functions for Firebase + Hono router
- Frontend:   Vue 3 + vue-router + Vite + Pinia
- Delivery:   Firebase Hosting
- App model:  WebApp with PWA behavior
- Shared:     Zod schemas — single source of truth for all types
- Testing:    Vitest + Firebase Emulator Suite
- CI:         GitHub Actions + SonarCloud + CodeQL

## Monorepo structure
packages/shared/   → Zod schemas, inferred TS types, pure utils
packages/api/      → Cloud Functions, Hono routes, Firestore services
packages/web/      → Vue 3 views, components, composables, Pinia stores
firebase/          → Firebase config and specs by component (hosting, firestore, auth, functions, storage)
openspec/          → OpenSpec artifacts (changes, archive, specs)

## Commands
pnpm install                          install all workspaces
pnpm -r typecheck                     typecheck all packages
pnpm -r lint                          lint all packages
pnpm -r test                          run all tests
pnpm -r test:coverage                 run tests + lcov coverage
firebase emulators:start              start local Firebase stack
pnpm dlx knip                         detect dead code

## SDD workflow (OpenSpec)
Use OpenSpec slash commands to drive every feature:
  /opsx:new <feature>     create new change folder with proposal
  /opsx:ff                fast-forward: generate proposal, specs, design, tasks
  /opsx:apply             implement tasks from tasks.md
  /opsx:archive           archive completed change

**Detailed workflow instructions live in `.agent/` (read these explicitly if your tool does not load them automatically):**
- Propose/explore:  `.agent/workflows/opsx-propose.md` + `.agent/skills/openspec-propose/SKILL.md`
- Apply tasks:      `.agent/workflows/opsx-apply.md`   + `.agent/skills/openspec-apply-change/SKILL.md`
- Archive:          `.agent/workflows/opsx-archive.md` + `.agent/skills/openspec-archive-change/SKILL.md`
- Explore:          `.agent/workflows/opsx-explore.md` + `.agent/skills/openspec-explore/SKILL.md`

Non-VS-Code agents (Codex, CLI, etc.): before executing any `/opsx:*` command, read the
corresponding workflow file above to understand the expected steps and constraints.

**Archiving Rule**: 
- NEVER archive a change folder without explicit human approval.
- Every change folder MUST be prefixed with a three-digit serial number (for example `001-feature-name`, `002-fix-name`) before archiving.
- The standard archive location is `openspec/changes/archive/`.

Before generating any code, you MUST:
1. Read the relevant Zod schema in packages/shared/src/schemas/
2. Confirm the type you need already exists
3. If it does not exist → describe the proposed schema change and STOP
   Wait for explicit approval before writing any code

The spec-first order is always:
  schema change → test → implementation
  Never implementation first.

## Spec Hierarchy & Source of Truth
The SDD workflow distinguishes between **Change Artifacts** and **Live Specs**:

1. **openspec/changes/ (Ephemeral / Transactional)**
   - **Purpose:** Workspace for the current task. It defines the *delta* (what is changing).
   - **Source of truth:** Only for the *process* of the current change.
   - **Lifecycle:** Deleted or moved to `archive/` after the PR is merged.

2. **Distributed specs/ (Permanent / System State)**
   - **Location:** `firebase/*/specs/`, `packages/shared/src/schemas/`, etc.
   - **Purpose:** Documentation of the CURRENT state of the system ("Live Specs").
   - **Rule:** Any change initiated in `openspec/` that modifies system behavior MUST update the corresponding permanent spec file as part of its implementation tasks.
   - **Source of truth:** For the *entire system architecture* at any given moment.

If implementation changes behavior described in `firebase/*/specs/` or other
live specs referenced by an approved OpenSpec change, update those permanent
specs in the same task.

**Always sync progress**: Update the `tasks.md` file in the current change folder continuously. Do not rely on internal agent task lists; the on-disk `tasks.md` is the only source of truth for the implementation status.


NEVER use `cat > file << 'EOF'` heredoc to write or rewrite TypeScript/Markdown files.
Heredocs in the bash tool strip tab indentation and collapse tab-separated fields (e.g. JSDoc changelog lines).
ALWAYS use the edit tool for all file modifications. Heredoc is only acceptable for plain text where whitespace is irrelevant.

NEVER use the edit tool to modify package.json files directly.
Use ecosystem commands instead — they understand the format and make atomic changes:
- `pnpm pkg set scripts.foo="bar"` to add/change a script field
- `pnpm add <pkg>` / `pnpm remove <pkg>` to manage dependencies — this also updates the lockfile
- `node -e "..."` or `jq` for deep JSON mutations
Raw text edits on package.json risk dropping keys (invalid JSON) and leave pnpm-lock.yaml out of sync.
If a direct package.json edit was unavoidable, always run `pnpm install` immediately after to resync the lockfile.

**Hygiene and Dead Code**: ALWAYS remove unused imports, variables, and dead code after editing or refactoring a file. Do not leave build-time warnings or unnecessary symbols behind.

**Clean Code Principles**: ALWAYS apply Clean Code defaults in every change. In particular:
- **KISS (Keep It Simple, Stupid)**: Prefer the simplest solution that satisfies current requirements.
- **DRY (Don’t Repeat Yourself)**: Avoid duplicated logic, messages, and mapping rules; extract and reuse shared abstractions when duplication appears.
- **SRP (Single Responsibility Principle)**: Keep modules, components, stores, and functions focused on one clear responsibility.
- **Small Functions**: Prefer small, composable functions with descriptive names instead of large multi-purpose blocks.
- **Low Cognitive Complexity**: Keep control flow easy to reason about; split condition-heavy logic into focused helpers before it becomes hard to read or test.

## Token Budget Protocol
- Default response mode for agents is concise and patch-oriented.
- Prefer minimal diffs and focused edits over full-file rewrites.
- Never paste full files/logs unless explicitly requested by a human.
- For debugging reports, share only the minimal failing snippet (for logs: max 30 relevant lines).
- Avoid repeating already established context; reference paths/symbols instead.
- Batch related changes in one pass when possible to reduce conversational overhead.

## Request Template (for Humans and Agents)
When opening a new coding request, use this compact structure to reduce ambiguity and token usage:
- **Goal**: the exact behavior or bug to fix.
- **Scope**: file paths, symbols, or routes involved.
- **Constraints**: boundaries (no refactor, no version bumps, keep API contract, etc.).
- **Validation**: exact checks to run (specific test/lint/typecheck commands).
- **Expected Output**: patch-only, summary-only, or patch + short rationale.

## Temporal Communication Rule
- When the user writes in English with serious mistakes, provide a brief and kind correction.
- Place that correction at the end of the response (never before the requested work).
- Keep corrections minimal (one short line) to avoid unnecessary token usage.


All types must be inferred from Zod:
  import { z } from 'zod'
  import { UserSchema } from '@puintegra/shared'
  type User = z.infer<typeof UserSchema>

NEVER modify packages/shared/src/schemas/ without explicit approval.
These files are the contract of the system. Propose changes, don't apply them.

NEVER use it.skip, it.todo, test.skip, or test.todo.
If you don't know how to test something, ask instead of skipping.

NEVER touch firebase/firestore/firestore.rules without explicit human approval.
NEVER modify Firebase Auth security posture, providers, MFA policy, blocking
functions behavior, or production auth configuration without explicit human
approval. Flag and stop.

NEVER access .env files or hardcode credentials of any kind.
Use process.env with documented variable names only.

`1-Análisis` access policy:
- `1-Análisis/1-Bases documentales`: normative source documents. NEVER read by
  default. Access only when explicitly asked or human confirmation required when agents need to clarify conceptual aspects.
- `1-Análisis/2-Análisis del dominio del problema`: problem-domain analysis.
  NEVER read by default. Access only when explicitly asked or human confirmation required when agents need to clarify conceptual aspects.
- `1-Análisis/3-Análisis del dominio de la solución`: conceptual and
  technology-agnostic solution-domain analysis, including sprint planning.
  This area MAY be read by orchestrator/planning agents to understand the
  product big picture. The canonical index is
  `1-Análisis/3-Análisis del dominio de la solución/1-Marco Conceptual del Dominio de la Solución.md`.

## Testing rules
- Write the Vitest test BEFORE the implementation (TDD)
- Schema tests live in packages/shared/tests/ — run them first
- Integration tests use Firebase Emulator — never real Firebase
- Coverage threshold: 80% global, 90% on new code
- Every new Cloud Function needs at least one emulator integration test

## Code quality gates
Before proposing any change, verify locally:
  pnpm -r typecheck       must pass with zero errors
  pnpm -r lint            must pass with zero warnings
  pnpm -r test            must pass with zero failures

If any gate fails, fix it before presenting the change.

## Git & PR Conventions
All commits and PR titles MUST follow the [Conventional Commits 1.0.0](https://www.conventionalcommits.org/en/v1.0.0/) specification.

- **Format:** `<type>(<scope>): <description>`
- **Types:** `feat` | `fix` | `refactor` | `test` | `chore` | `docs` | `style` | `ci`
- **Scopes:** `shared` | `api` | `web` | `firebase` | `ci` | `deps`
- **Rules:**
  - Description must be in lowercase and without a period at the end.
  - Every PR that touches `packages/shared` requires architecture review.
  - Every PR must include tests for new behavior.
  - Do not bundle unrelated changes in a single PR or commit.


## Technical Gotchas & Anti-Patterns
Detailed engineering standards and architectural patterns are documented in the following live specs:
- **Global Standards**: [`openspec/specs/engineering-standards.md`](openspec/specs/engineering-standards.md) (Circular dependencies, JSDoc, etc.)
- **Frontend Patterns**: [`packages/web/specs/frontend-foundations.md`](packages/web/specs/frontend-foundations.md) (Singleton composables, testing hooks, etc.)

## Knowledge Persistence
When a technical lesson, "gotcha", or architectural pattern is identified during a task, you should **propose** its persistence in the relevant **Live Specs directory** based on its concern:
- **Global Coding Standards**: `openspec/specs/` directory.
- **Frontend/Web Patterns**: `packages/web/specs/` directory.
- **Project Structure & Agent Rules**: Update this file (`AGENTS.md`).
- **Ephemeral Change Context**: Document in the corresponding `openspec/changes/<feature>/` folder.

**CRITICAL**: NEVER modify persistent live specs or this file (`AGENTS.md`) without explicit human approval of the proposal. Always promote lessons learned to the relevant spec once approved to prevent future regressions.

## Agent Workflows & Skills (tool-specific)

Specialized workflows and skills for this repo are defined in the `.agent/` folder.
Non-VS-Code agents (Codex, Claude, etc.) must read these files explicitly when performing the corresponding task:

### Workflows (`.agent/workflows/`)
- `opsx-propose.md`   — How to create a new OpenSpec change with all artifacts
- `opsx-apply.md`     — How to implement tasks from an approved change
- `opsx-explore.md`   — How to explore and understand the codebase architecture
- `opsx-archive.md`   — How to archive a completed change (requires human approval)

### Skills (`.agent/skills/`)
- `openspec-propose/SKILL.md`        — Skill definition for proposing changes
- `openspec-apply-change/SKILL.md`   — Skill definition for applying changes
- `openspec-explore/SKILL.md`        — Skill definition for codebase exploration
- `openspec-archive-change/SKILL.md` — Skill definition for archiving changes

**When performing any OpenSpec operation, read the corresponding workflow file first.**


Confirmed plans are not implementation approval. After a human confirms a plan,
STOP and wait for an explicit apply/implement request so the human can choose
which model or agent should execute the plan.

Ask before generating. A clarifying question takes 10 seconds.
A file generated from wrong assumptions takes 30 minutes to untangle.
If you are unsure whether a change affects the shared contract, assume it does
and ask.

# PUIntegra — Agent Context

## Project overview
PUIntegra is a fullstack MVP evaluating a Spec-Driven Development (SDD)
workflow. Every agent working on this repo must follow the SDD rules below.

## Stack
- Runtime:    Node.js 20 + TypeScript 5 (strict)
- Monorepo:   pnpm workspaces
- Backend:    Cloud Functions for Firebase + Hono router
- Frontend:   Vue 3 + Vite + Pinia
- Shared:     Zod schemas — single source of truth for all types
- Testing:    Vitest + Firebase Emulator Suite
- CI:         GitHub Actions + SonarCloud + CodeQL

## Monorepo structure
packages/shared/   → Zod schemas, inferred TS types, pure utils
packages/api/      → Cloud Functions, Hono routes, Firestore services
packages/web/      → Vue 3 components, composables, Pinia stores
firebase/          → Firebase config organized by component (firestore, auth, functions, storage)
openspec/          → OpenSpec SDD artifacts (changes, archive)

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


## Absolute constraints

NEVER define TypeScript types manually.
All types must be inferred from Zod:
  import { z } from 'zod'
  import { UserSchema } from '@puintegra/shared'
  type User = z.infer<typeof UserSchema>

NEVER modify packages/shared/src/schemas/ without explicit approval.
These files are the contract of the system. Propose changes, don't apply them.

NEVER use it.skip, it.todo, test.skip, or test.todo.
If you don't know how to test something, ask instead of skipping.

NEVER touch firebase/firestore/firestore.rules or any Firebase Auth logic
without explicit human approval. Flag and stop.

NEVER access .env files or hardcode credentials of any kind.
Use process.env with documented variable names only.

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


## When in doubt
Ask before generating. A clarifying question takes 10 seconds.
A file generated from wrong assumptions takes 30 minutes to untangle.
If you are unsure whether a change affects the shared contract, assume it does
and ask.

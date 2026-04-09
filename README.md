# PUIntegra

PUIntegra is a SaaS for diverse institutions that need to prepare, operate,
and progressively evolve their integration with the Plataforma Única de
Identidad (PUI).

The current first scope focuses on delivering the operational MVP of the
product: institutional administration, identity and access, permissions,
contacts, internal requests and findings management, provider backoffice,
and auditability.

This repository also evaluates a Spec-Driven Development (SDD) workflow using
OpenSpec, AGENTS.md, Zod schemas, and Firebase.

## Stack
- **Monorepo**: pnpm workspaces
- **Backend**: Node.js 20 + TypeScript + Cloud Functions + Hono
- **Frontend**: Vue 3 + vue-router + Vite + Pinia + TypeScript + WebApp/PWA + Vuetify
- **Web delivery**: Firebase Hosting
- **Shared contract**: Zod schemas in `packages/shared`
- **Firebase**: Hosting, Firestore, Auth, Cloud Functions
- **Testing**: Vitest + Firebase Emulator Suite
- **CI**: GitHub Actions + SonarCloud + CodeQL

## Quick start
```bash
# Install dependencies
pnpm install

# Start Firebase emulators
firebase emulators:start

# Run all tests
pnpm -r test

# Typecheck all packages
pnpm -r typecheck
```

## SDD workflow (OpenSpec)
```bash
# Install OpenSpec globally
npm install -g @fission-ai/openspec@latest

# Initialize in project root
openspec init

# Start a new feature
/opsx:new <feature-name>   # create change folder
/opsx:ff                   # generate proposal, specs, design, tasks
/opsx:apply                # implement tasks
/opsx:archive              # archive completed change
```

## Project structure
```
PUIntegra/
├── 1-Análisis/                  ← project analysis and domain research (Human only)
├── AGENTS.md                    ← agent instructions (core SDD rules)
├── openspec/
│   ├── changes/                 ← ephemeral SDD artifacts (current delta)
│   ├── specs/                   ← high-level system specs
│   └── config.yaml              ← OpenSpec agent configuration
├── firebase/                    ← Firebase configuration and rules
│   ├── AGENTS.md                ← Firebase-specific agent instructions
│   ├── firestore/specs/         ← database & security specs
│   ├── auth/specs/              ← identity & auth flow specs
│   ├── functions/specs/         ← backend trigger & endpoint specs
│   └── storage/specs/           ← bucket & access rules specs
└── packages/
    ├── shared/                  ← Zod schemas & shared logic (source of truth)
    ├── api/                     ← Cloud Functions + Hono backend
    └── web/                     ← Vue 3 + Pinia + Vite frontend
```

## Documentation
### Agent Context & Rules
- [AGENTS.md](./AGENTS.md) — Core agent instructions and SDD workflow rules.
- [firebase/AGENTS.md](./firebase/AGENTS.md) — Specific rules for Firebase security and implementation.

### System Specs (Permanent)
- **Shared Schemas**: `packages/shared/src/schemas/` — The system's type contract.
- **Service Specs**: `firebase/*/specs/` — Documented behavior for each Firebase service.

### Research & Analysis
- [1-Análisis](./1-Análisis/) — Business requirements, domain analysis, and design assets (Human only).

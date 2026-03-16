# PUIntegra

MVP evaluating a Spec-Driven Development (SDD) workflow using OpenSpec,
AGENTS.md, Zod schemas, and Firebase.

## Stack
- **Monorepo**: pnpm workspaces
- **Backend**: Node.js 20 + TypeScript + Cloud Functions + Hono
- **Frontend**: Vue 3 + Vite + Pinia + TypeScript
- **Shared contract**: Zod schemas in `packages/shared`
- **Firebase**: Firestore, Auth, Cloud Functions, Storage
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
├── AGENTS.md                    ← agent instructions (all agents)
├── openspec/changes/            ← OpenSpec SDD artifacts per feature
├── firebase/                    ← Firebase config by component
│   ├── AGENTS.md
│   ├── firestore/specs/         ← collection & security specs
│   ├── auth/specs/              ← roles & auth flow specs
│   ├── functions/specs/         ← trigger & endpoint specs
│   └── storage/specs/           ← bucket & access specs
└── packages/
    ├── shared/                  ← Zod schemas (source of truth)
    ├── api/                     ← Cloud Functions + Hono
    └── web/                     ← Vue 3 + Pinia
```

## Documentation
- [AGENTS.md](./AGENTS.md) — agent instructions and SDD rules
- [firebase/AGENTS.md](./firebase/AGENTS.md) — Firebase-specific rules
- [openspec/changes/add-user-schema](./openspec/changes/add-user-schema/) — first feature spec

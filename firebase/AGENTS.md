# firebase/ — Agent Context

This folder contains ALL Firebase configuration for PUIntegra.
It is organized one subfolder per Firebase component.
Each component has a specs/ subfolder that defines intent before config is written.

## Structure
firebase/
  firestore/specs/    → collection design, security model decisions
  auth/specs/         → roles, custom claims, authentication flows
  functions/specs/    → trigger specs, HTTP endpoint contracts
  storage/specs/      → bucket structure, path conventions, access rules

## Spec-first rule for Firebase
The SDD flow for any Firebase change is:
  1. Write or update the relevant specs/ document
  2. Get explicit approval on the spec
  3. Only then modify the config or rules file

NEVER modify firestore.rules without reading firestore/specs/security-model.md first.
NEVER modify storage.rules without reading storage/specs/buckets.md first.
NEVER add a new Cloud Function trigger without a spec in functions/specs/triggers.md.
NEVER add Auth providers or custom claims without updating auth/specs/roles.md.

## Human review required
Any change to a .rules file requires explicit human approval before applying.
Any change to auth/config.json (providers, MFA) requires explicit human approval.
Flag these changes and stop — do not apply them autonomously.

## Emulator first
All Firebase config changes must be validated against the local emulator before
proposing a PR. Never test against the real Firebase project.
Emulator command: firebase emulators:start --only firestore,auth,functions,storage

## No credentials here
NEVER write API keys, service account JSON, or any secrets in this folder.
Use .env.example to document required variables — actual values live in
GitHub Secrets and local .env (gitignored).

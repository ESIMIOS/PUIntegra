# Cloud Functions — Triggers Spec

## Status: draft

## Auth triggers

### onUserCreated
- Trigger: functions.auth.user().onCreate()
- Purpose: Initialize user document in Firestore + set default custom claims
- Input: Firebase Auth UserRecord
- Side effects:
  - Creates users/{uid} in Firestore with role 'member'
  - Sets custom claim { role: 'member' } via Admin SDK
- Error handling: Log failure, do not throw

## Change process
Before implementing any new trigger:
1. Add entry to this spec + get explicit approval
2. Add Zod schema to packages/shared if new data shape is involved
3. Write Vitest test using Firebase Emulator before implementing

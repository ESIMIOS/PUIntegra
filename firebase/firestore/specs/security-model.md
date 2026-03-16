# Firestore — Security Model Spec

## Status: draft

## Principles
1. Default deny — no rule grants access unless explicitly defined
2. Auth required — all read/write requires request.auth != null
3. Ownership — users can only modify their own documents unless admin
4. Role-based — roles stored in the user document, validated server-side

## Role definitions
| Role    | Description                              |
|---------|------------------------------------------|
| admin   | Full read/write access to all documents  |
| member  | Read/write own documents, read shared    |
| viewer  | Read-only access to shared documents     |

## Helper functions (to implement in firestore.rules)
- isAuthenticated(): request.auth != null
- isOwner(userId): request.auth.uid == userId
- hasRole(role): get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == role

## Change process
Any modification requires:
1. Architecture review from project owner
2. Update to firestore.rules
3. Validation against Firebase Emulator with test suite
4. PR with both spec update and rules update together

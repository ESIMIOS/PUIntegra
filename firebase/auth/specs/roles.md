# Auth — Roles & Custom Claims Spec

## Status: draft

## Authentication providers
- Email/password (enabled)
- Google OAuth (planned — requires spec update before enabling)

## Roles
Roles are stored as custom claims on the Firebase Auth token AND mirrored
in the users/{userId} Firestore document for Firestore rule access.

| Role    | Custom claim          | Description                    |
|---------|-----------------------|--------------------------------|
| admin   | { role: 'admin' }     | Full system access             |
| member  | { role: 'member' }    | Standard authenticated user    |
| viewer  | { role: 'viewer' }    | Read-only access               |

## Claim assignment
Custom claims are set by Cloud Functions (Admin SDK only).
NEVER set custom claims from client-side code.

## Default role
New users are assigned 'member' role on first sign-in via Auth onCreate trigger.

## Change process
Any change to roles or providers requires:
1. Update this spec + explicit human approval
2. Update packages/shared/src/schemas/user.schema.ts if role enum changes

# API Domain Write Boundary (Live Spec)

## Purpose

Define which domain writes must run through authenticated API services instead of direct browser Firestore writes.

## Contract

- Browser clients must not perform direct Firestore writes for protected institution-admin domain mutations.
- All protected writes must validate payloads with shared Zod contracts before service-layer logic.
- All successful protected writes must emit domain audit logs with canonical log categories.

## Current required API-boundary writes

- Account profile update:
  - `PATCH /api/account/profile`
- Provider backoffice institution operations:
  - `POST /api/admin/institutions`
  - `PATCH /api/admin/institutions/:rfc/plan`
- App-domain institution admin operations:
  - `PUT /api/app/institutions/:rfc/contacts/:type`
  - `PUT /api/app/institutions/:rfc/shared-secret`
  - `POST /api/app/institutions/:rfc/permissions`
  - `PATCH /api/app/institutions/:rfc/permissions/:permissionId`

## App-domain institution admin policy

- Role requirement: actor must resolve to `ROLE.INSTITUTION_ADMIN`.
- RFC scope requirement: actor must hold a granted institution-admin permission for the same route RFC.
- Reserved RFC operations (`SYSTEM_RFC`, `DEFAULT_RFC`) are rejected.
- Permission edit flow may only mutate `role` and `status`.

## Non-goals

- This spec does not define Firestore read posture.
- This spec does not define frontend rendering behavior.

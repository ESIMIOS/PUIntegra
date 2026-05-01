## Why

PUIntegra already persists structured update histories on every operational entity except log entries, but current admin and account pages only expose counts or current values. Operators and account users need a consistent, readable way to inspect how document properties changed over time without each page inventing its own audit UI.

## What Changes

- Add a reusable Vue component for displaying entity update history from existing shared `updates` arrays.
- Support inline rendering and icon-triggered modal rendering.
- Support two views: timeline for friendly chronological review and table for analytical traceability.
- Add Spanish field labels and value formatting presets for existing update schemas.
- Integrate the component into admin and account domain pages that already load update-bearing entities.
- Exclude log entries from this component; log inspection remains handled by the existing logs pages.

## Capabilities

### New Capabilities

- `update-history-inspection`: Reusable UI for inspecting update histories on admin and account pages using existing entity update schemas.

### Modified Capabilities

- `admin-institution-inspection`: Admin institution, contact, permission, and request pages expose entity update histories instead of only current state.

## Impact

- Shared schemas: no changes expected; existing `UpdateActorSchema`, `UserUpdateSchema`, `InstitutionUpdateSchema`, `PermissionUpdateSchema`, `ContactUpdateSchema`, `RequestUpdateSchema`, and `FindingUpdateSchema` are sufficient.
- Web: adds a shared update-history component, normalization/formatting utilities, component tests, and admin/account page integrations.
- Firebase: no Firestore security rules changes expected; the component only renders update arrays already returned by existing page reads.
- API: no backend API or Cloud Functions changes expected.
- Specs: adds an OpenSpec capability for update-history inspection and updates the existing admin institution inspection capability.

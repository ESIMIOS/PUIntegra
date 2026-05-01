## Context

Admin and account pages already load entities whose shared schemas include `updates` arrays. The common metadata contract is defined by `UpdateActorSchema` in `packages/shared/src/schemas/domain-common.schema.ts`, and entity-specific update fields are defined by `UserUpdateSchema`, `InstitutionUpdateSchema`, `PermissionUpdateSchema`, `ContactUpdateSchema`, `RequestUpdateSchema`, and `FindingUpdateSchema`.

Current web patterns are documented in `packages/web/specs/frontend-foundations.md`, `packages/web/specs/design-system.md`, and `packages/web/specs/vuestic-usage.md`. The component must follow Vuestic UI conventions, Spanish user-facing copy, and Zod-inferred shared types through `@shared`.

## Goals / Non-Goals

**Goals:**

- Provide one reusable update-history component for admin and account domain pages.
- Render the same update data as an inline panel or icon-triggered modal.
- Offer timeline and table views, with timeline as the default.
- Normalize `previous*` and `updated*` pairs from existing update schemas without changing shared contracts.
- Show raw changed values, including sensitive-looking fields, because the requested traceability behavior requires full visibility.

**Non-Goals:**

- No changes to `packages/shared/src/schemas/*`.
- No Firebase security rules changes.
- No API or Cloud Functions changes.
- No use on log entries; log pages remain covered by the existing log inspection UI.
- No new dependency for timeline rendering, date formatting, or tables.

## Decisions

1. Build a shared Vue component plus small display utilities.
   - Rationale: Pair detection, sorting, relative time, actor labels, and value formatting are reusable across admin and account pages.
   - Alternative considered: Implement history UI independently in each page. Rejected because it duplicates parsing logic and creates inconsistent audit UX.

2. Keep entity contracts in shared schemas and define display metadata in web.
   - Rationale: The `updates` arrays already exist in shared Zod schemas; field labels and view formatting are UI concerns.
   - Alternative considered: Add a generic shared update-history DTO. Rejected because it would modify the shared contract without a data need.

3. Normalize changed fields by matching `previous*` and `updated*` suffixes.
   - Rationale: This matches the existing entity update pattern and keeps the component generic.
   - Boundary: Metadata fields from `UpdateActorSchema` are rendered as event context, not changed properties.

4. Use Vuestic primitives and local component CSS only where needed.
   - Rationale: `VaButton`, `VaIcon`, `VaModal`, `VaButtonToggle` or equivalent controls, and `va-table` fit existing app patterns.
   - Alternative considered: Add a timeline package. Rejected to avoid dependency and bundle growth for a simple audit display.

5. Integrate first into admin and account pages that already have the required data.
   - Admin: institution detail inline, and row-level icon modal history for contacts, permissions, and requests.
   - Account: settings inline for user profile updates, and row-level icon modal history for institution and permission history on account institutions.
   - Rationale: These pages already load update-bearing records, so the change stays UI-focused.

## Risks / Trade-offs

- Raw sensitive values can expose operational secrets or certificates in UI -> accepted by product decision for this change; implementation must not add masking.
- Generic pair detection can miss malformed update records -> fallback behavior displays only well-formed previous/updated pairs and still shows metadata context.
- Relative time can be unstable in tests -> inject or control the current timestamp in utilities/tests rather than asserting against real clock drift.
- Account institutions currently maps rows into a reduced row model -> preserve access to the underlying institution and permission records so row-level history can render without extra reads.
- Timeline and table views increase component test surface -> keep normalization utilities small and test them separately from rendering.

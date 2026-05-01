## 1. Tests First

- [x] 1.1 Add utility tests for update-history normalization: metadata exclusion, previous/updated pair detection, missing values, raw value rendering, and descending timestamp order.
- [x] 1.2 Add date display tests for absolute and relative timestamp formatting with a controlled current time.
- [x] 1.3 Add component tests for inline mode, icon-modal mode, empty state, timeline/table switching, actor/origin metadata, and multi-field update events.
- [x] 1.4 Update admin page tests for institution inline history and row-level history controls on contacts, permissions, and requests.
- [x] 1.5 Update account page tests for account settings inline history and account institutions row-level institution/permission history controls.

## 2. Contract And UI Foundation

- [x] 2.1 Read and confirm existing shared update schemas cover all required data before writing implementation code.
- [x] 2.2 Implement typed update-history display definitions for user, institution, permission, contact, request, and finding update schemas without editing shared schemas.
- [x] 2.3 Implement normalization utilities that derive display events and changed fields from `previous*` and `updated*` pairs.
- [x] 2.4 Implement timestamp, actor, origin, and fallback value formatting helpers with Spanish UI labels.

## 3. Reusable Component

- [x] 3.1 Implement the shared update-history component with `inline` and `icon` modes.
- [x] 3.2 Implement timeline and table views, with timeline as the default view.
- [x] 3.3 Implement the icon-triggered `VaModal` with accessible labels and no data mutation behavior.
- [x] 3.4 Add focused component styling consistent with Vuestic and existing web design-system specs.

## 4. Page Integrations

- [x] 4.1 Integrate inline institution update history into `/admin/institutions/:rfc`.
- [x] 4.2 Integrate row-level update-history modals into admin contacts, permissions, and requests pages.
- [x] 4.3 Integrate inline user update history into account settings.
- [x] 4.4 Integrate row-level institution and permission update-history modals into account institutions without adding extra reads.
- [x] 4.5 Keep account logs and all log-entry UIs on the existing logs inspection components.

## 5. Specs And Quality Gates

- [x] 5.1 Update relevant permanent web specs for the reusable update-history UI contract.
- [x] 5.2 Run `pnpm -r typecheck`.
- [x] 5.3 Run `pnpm -r lint`.
- [x] 5.4 Run `pnpm -r test`.

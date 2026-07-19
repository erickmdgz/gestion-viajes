# FEAT-006 - Agency document layer

## 1. Summary

Let the board register agency documents (itinerary, budget) by type with a version label and date,
mark exactly one version per type as "current," and record a free-text changelog note per version.

## 2. Problem or need

The agency sends itinerary/budget revisions over time with no consistent versioning; the board has no
single place to know which version is the one actually in effect. FEAT-006 **manages** that version
chaos rather than eliminating it — the agency keeps its own PDF flow (agency-as-receiver principle,
`02_architecture.md`).

## 3. Affected user

- **Exec board** — registers document versions, marks one current per type, records changelog notes.

## 4. Related requirements

- FR-010 — Register agency documents with version label and date.
- FR-011 — Mark exactly one document version as current.
- FR-012 — Record a changelog between document versions.

## 5. Expected flow

1. The board opens a trip's "Documents" page and adds a new version: type (free text, e.g.
   "itinerary"), version label, date, an optional link to where the agency shared the file, and an
   optional changelog note.
2. The new version starts as not current.
3. The board marks a version "current" for its type; any other version of that same type stops being
   current — exactly one is current per (trip, type), always.
4. Anyone viewing the documents page sees, per type, every version with its changelog and which one is
   current.

## 6. Acceptance criteria

Acceptance criteria are defined in **FR-010, FR-011, FR-012** (`docs_en/03_requirements.md`), not
here.

## 7. Business rules

Business rules live in the FRs. Key rules implemented here:

- **No real file upload.** `file_ref` is an optional link/URL only — consistent with the local-first,
  no-cloud-storage architecture (ADR-002) and the agency-as-receiver principle.
- **`type` is free text**, not a closed enum — the PRD gives "itinerary"/"budget" only as examples.
  The add-version form suggests those two via a `<datalist>`.
- **A new version always starts not current.** Registering (FR-010) and marking current (FR-011) are
  deliberately separate actions; nothing in either FR requires a new version to auto-become current,
  and keeping the `is_current` write to one code path (`markDocumentCurrent`) is what lets that
  function guarantee the invariant.
- **Exactly one `is_current = true` per (trip, type), always** — enforced atomically via a Prisma
  `$transaction`.
- **Changelog is captured at registration time only.** No separate "edit an existing version's
  changelog" action in v1 — not required by FR-012's acceptance criterion.

## 8. Proposed technical design

### Frontend

`src/app/dashboard/trips/[tripId]/documents/page.tsx` (Server Component): documents grouped by type,
each version showing label/date/changelog/link and a "CURRENT" badge or a "Mark as current" button;
an "add version" form at the bottom. Linked from the roster page ("Documents →").

### Backend

Next.js Server Actions in `.../documents/actions.ts`: `addDocument` (zod-validated: type/versionLabel
required, matching the `createTrip` precedent — a board-only form, not a public trust boundary like
FEAT-001's F1 form, so validation stays inline rather than in a separate pure module) and
`markCurrent`. Core logic in `src/lib/agencyDocuments.ts`: `registerDocumentRecord`,
`listDocumentsForTrip`, `markDocumentCurrent`.

### Database

New `AgencyDocument` model (`id`, `tripId`, `type`, `versionLabel`, `date`, `isCurrent`, `changelog`,
`fileRef`, `createdAt`), migrated with `prisma migrate dev --name feat006_agency_documents`.

### Security

Every action requires an operator session via `requireOperator()`. No new participant-facing surface.

## 9. Required tests

| ID | Test | Type |
|---|---|---|
| TC-023 | Register a document with type/version label/date | Functional |
| TC-024 | Missing type or version label is rejected | Validation |
| TC-025 | Marking a version current supersedes the previous one | Functional |
| TC-026 | Marking a different version current still leaves exactly one current | Functional |
| TC-027 | A changelog note is stored and shown with its version | Functional |

Automated: `src/lib/agencyDocuments.test.ts` (real Prisma write path, throwaway SQLite, same pattern
as `trips.test.ts`) — TC-023, TC-025, TC-026 (the `$transaction` invariant tested directly, not just
trusted), TC-027. TC-024 is `addDocument`'s zod layer, verified manually against the running app —
same treatment `createTrip`'s validation got in FEAT-004.

## 10. Documentation impact

- [x] Update architecture (`02_architecture.md`).
- [x] Update API doc (`06_api.md`).
- [x] Update backlog (`05_backlog.md`).
- [x] Update data model (`07_data_model.md`).
- [x] Update test plan (`08_test_plan.md`).
- [x] Feature doc (this file).
- [ ] Release notes — on release to `main`.

## 11. Checklist before implementing

- [x] The feature has a clear objective.
- [x] It is linked to requirements (FR-010, FR-011, FR-012).
- [x] It has acceptance criteria (in the FRs).
- [x] It has defined tests (TC-023..TC-027).
- [x] The technical impact is understood.
- [x] The user impact is understood.

## 12. Checklist before closing

- [x] Implemented.
- [x] Tests executed (`npm run test` — 58/58 passing; manual end-to-end pass against the running app,
  including the exactly-one-current invariant across 3 versions of the same type).
- [x] Acceptance criteria met.
- [ ] Pull request reviewed.
- [x] Documentation updated.
- [ ] Release notes updated.

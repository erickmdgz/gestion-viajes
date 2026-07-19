# FEAT-009 - Publish notices and payment-date reminders

## 1. Summary

Let the board publish free-text notices and payment-plan-date reminders directly in Solanum, and
show them all on a public feed page for the confirmed group, most recent first.

## 2. Problem or need

FR-015 depends on the `Notice` model already built for FR-014 (FEAT-008), but only itinerary sharing
was wired up. The board also needs a lightweight way to post general announcements ("meeting moved to
Wednesday") and payment-date reminders without needing an external document or link.

## 3. Affected user

- **Exec board** — composes and publishes notices/payment-reminders.
- **Confirmed participant** — opens the feed link (no session — participants never log in, NF-2/NF-8).

## 4. Related requirements

- FR-015 — Publish notices and payment-date reminders.

## 5. Expected flow

1. The board opens a trip's notices page and writes a post: type (notice or payment-reminder) and
   free-text content.
2. Clicking "Publish" creates a new, permanent entry — publishing again does not overwrite anything
   previously posted.
3. The public feed at `/share/{tripId}/notices` lists every published entry for the trip, most recent
   first.

## 6. Acceptance criteria

Acceptance criteria are defined in **FR-015** (`docs_en/03_requirements.md`), not here.

## 7. Business rules

FR-015 itself has no business rules section beyond its single AC; the rules below are this FEAT's own
design decisions, made explicit for traceability:

- **Accumulating feed, not a single mutable slot** (unlike itinerary/FEAT-008): every publish is its
  own permanent row. This required dropping `Notice`'s `@@unique([tripId, type])` constraint (added
  in FEAT-008 specifically for itinerary's singleton behavior) — see `07_data_model.md`. Itinerary's
  singleton behavior moved to application code (`publishItinerary` now finds-existing-or-creates); no
  behavior change for FR-014, verified by re-running FEAT-008's existing tests unchanged.
- **Free text authored directly in Solanum** (`Notice.body`), not a link to external content — unlike
  `AgencyDocument.fileRef`/itinerary's `contentRef`.
- **`type` is a fixed 2-option select** (`notice` / `payment-reminder`), not free text like
  `AgencyDocument.type` — FR-015 enumerates exactly these two kinds, unlike the open-ended agency
  document types.

## 8. Proposed technical design

### Frontend

`src/app/dashboard/trips/[tripId]/notices/page.tsx`: a compose form (type select, body textarea) and
a list of the trip's already-published notices below it. Public feed page
`src/app/share/[tripId]/notices/page.tsx` (no session), same pattern as `/apply` and
`/share/.../itinerary`. Linked from the roster page ("Notices →").

### Backend

`publishNoticeAction(tripId, formData)` Server Action (`.../notices/actions.ts`, inline zod,
`requireOperator()` first — board-only, not a public trust boundary). Core logic in
`src/lib/notices.ts`: `publishNotice` (always creates a new row), `listPublishedNotices` (most recent
first). `publishItinerary`/`getItineraryNotice` were rewritten to find-existing-or-create instead of
relying on the now-removed unique constraint.

### Database

`Notice.body` (String?) added; `@@unique([tripId, type])` replaced with `@@index([tripId, type])`.
Migrated with `prisma migrate dev --name feat009_notice_feed`.

### Security

Publishing requires an operator session. The feed page is intentionally public and unauthenticated
(NF-2/NF-8) — the trip is identified only by its opaque UUID in the path, no PII.

## 9. Required tests

| ID | Test | Type |
|---|---|---|
| TC-033 | Publishing a notice/payment-reminder makes it available as shareable content | Functional |

Automated: `src/lib/notices.test.ts` — new cases for `publishNotice` (creates a new row per call, not
an overwrite), `listPublishedNotices` (most-recent-first, scoped to the right trip/types), plus the
**existing itinerary describe blocks re-run unchanged**, proving the schema change didn't regress
FR-014. Manual: published two notices and one payment-reminder for a trip via curl (no session for
the read side) and confirmed `/share/{tripId}/notices` listed all three, most recent first; also
re-verified the itinerary share flow end-to-end after the migration to catch any regression.

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
- [x] It is linked to requirements (FR-015).
- [x] It has acceptance criteria (in the FR).
- [x] It has defined tests (TC-033).
- [x] The technical impact is understood.
- [x] The user impact is understood.

## 12. Checklist before closing

- [x] Implemented.
- [x] Tests executed (`npm run test` — 75/75 passing; manual end-to-end pass against the running app,
  including a regression check on FEAT-008's itinerary flow).
- [x] Acceptance criteria met.
- [ ] Pull request reviewed.
- [x] Documentation updated.
- [ ] Release notes updated.

# FEAT-008 - Publish the current itinerary as a shareable link

## 1. Summary

Let the board publish a stable link that always serves whichever itinerary document version is
currently marked "current" (FR-011) — the link itself never changes, even after a newer version
supersedes the old one.

## 2. Problem or need

Without a live-resolving link, the board would have to re-share a new link with the confirmed group
every time the itinerary changes. FEAT-008 turns FEAT-006's version tracking into something the board
can actually distribute once and forget.

## 3. Affected user

- **Exec board** — publishes the itinerary, copies the link to share with the confirmed group.
- **Confirmed participant** — opens the link (no session — participants never log in, NF-2/NF-8).

## 4. Related requirements

- FR-014 — Publish the current itinerary as a shareable link/file.

## 5. Expected flow

1. The board registers and marks current an `itinerary`-type agency document (FEAT-006, already
   built).
2. On the documents page, the board clicks "Publish itinerary." Solanum records that itinerary
   sharing is on for this trip and shows a stable share path.
3. The board copies that link and shares it with the confirmed group (WhatsApp, email — never sent by
   the tool itself).
4. Anyone opening the link is redirected to the current itinerary document's file.
5. Later, the board registers a new itinerary version and marks it current. The **same** link, opened
   again, now redirects to the new version — no republish step.

## 6. Acceptance criteria

Acceptance criteria are defined in **FR-014** (`docs_en/03_requirements.md`), not here.

## 7. Business rules

Business rules live in the FR. Key rules implemented here:

- **The share link is a live lookup, not a snapshot.** `resolvePublishedItineraryFileRef`
  (`src/lib/notices.ts`) re-resolves the trip's current `itinerary` `AgencyDocument` on every visit —
  this is what makes TC-032 true without any code change to FEAT-006's `markDocumentCurrent`.
- **Publishing is gated** on a current itinerary document already existing (mirrors TC-031's own
  premise) and is **idempotent** — publishing again just refreshes the timestamp.
- **`Notice.contentRef` stores the stable Solanum path** (`/share/{tripId}/itinerary`), not the
  agency's actual file link — that indirection is the whole mechanism.
- **Case-sensitive type match** on `AgencyDocument.type = "itinerary"` — a documented v1 constraint,
  not engineered around (SQLite `=` is case-sensitive; Prisma's insensitive mode isn't available on
  SQLite).
- **`Notice` is built as documented for FR-014/015 together**, but only `type = "itinerary"` gets
  actions/UI here — FR-015's generic notice/payment-reminder publishing is a separate, not-yet-built
  feature.

## 8. Proposed technical design

### Frontend

A new section on the existing documents page (`/dashboard/trips/[tripId]/documents`): publish status,
a "Publish itinerary" button, and — once published — the share path with the existing generic
`CopyButton` (`push/copy-button.tsx`, reused, not duplicated). New public page
`src/app/share/[tripId]/itinerary/page.tsx` (no session; `redirect()`s to the resolved file, or shows
"not available yet").

### Backend

`publishItinerary(tripId)` Server Action (`.../documents/actions.ts`, `requireOperator()` first).
Core logic in `src/lib/notices.ts`: `publishItinerary`, `getItineraryNotice`,
`resolvePublishedItineraryFileRef`. `src/lib/agencyDocuments.ts` gets `getCurrentDocument(tripId,
type)`, the query both this FEAT and any future FR-015 notice type will reuse.

### Database

New `Notice` model (`id`, `tripId`, `type`, `contentRef`, `publishedAt`), unique on `(tripId, type)`.
Migrated with `prisma migrate dev --name feat008_notices`.

### Security

The share page is intentionally public and unauthenticated (NF-2/NF-8) — the trip is identified only
by its opaque UUID in the path, no PII. Publishing itself still requires an operator session.

## 9. Required tests

| ID | Test | Type |
|---|---|---|
| TC-031 | Publishing a current itinerary produces a link that serves it | Functional |
| TC-032 | Superseding the current version serves the new one on the same link | Functional |

Automated: `src/lib/notices.test.ts` (Prisma-backed, throwaway SQLite) covers the publish gate,
TC-031, and TC-032 directly (marks a new version current without republishing and asserts the
resolved `fileRef` changes). Manual: curl against the running dev server with **no session cookies**
confirmed the share URL redirects to the current file, then — after registering and marking a v2
current — the same unchanged URL redirected to v2.

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
- [x] It is linked to requirements (FR-014).
- [x] It has acceptance criteria (in the FR).
- [x] It has defined tests (TC-031, TC-032).
- [x] The technical impact is understood.
- [x] The user impact is understood.

## 12. Checklist before closing

- [x] Implemented.
- [x] Tests executed (`npm run test` — 65/65 passing; manual end-to-end pass against the running app,
  no session, including the version-change scenario).
- [x] Acceptance criteria met.
- [ ] Pull request reviewed.
- [x] Documentation updated.
- [ ] Release notes updated.

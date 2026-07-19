# FEAT-011 - Track visit targets through a pipeline

## 1. Summary

Let the board track company/institution visit targets (e.g. companies to visit during the trip)
through a `contact` → `confirmed` → `scheduled` pipeline, recording status at each stage and the
day/time once scheduled.

## 2. Problem or need

The board coordinates several potential company/institution visits per trip with no structured way
to see who's been contacted, who's confirmed, and who's actually scheduled. FR-017 gives it that
pipeline; FR-018 (a separate, not-yet-built feature) will generate an agency brief from the
confirmed/scheduled visits tracked here.

## 3. Affected user

- **Exec board** — registers visit targets and advances them through the pipeline.

## 4. Related requirements

- FR-017 — Track visit targets through a contact→confirmation→schedule pipeline.

## 5. Expected flow

1. The board adds a visit target (name, optional company/institution type, optional notes) — it
   starts at `contact`.
2. Once the target responds, the board marks it `confirmed`.
3. Once a day and time are agreed, the board sets them — this is what advances the visit to
   `scheduled`.

## 6. Acceptance criteria

Acceptance criteria are defined in **FR-017** (`docs_en/03_requirements.md`), not here.

## 7. Business rules

Business rules live in the FR. Design decisions made explicit for traceability:

- **Three explicit stages, not derived.** `contact` (initial) → `confirmed` (board action) →
  `scheduled` (setting the day/time on a confirmed visit is what advances it — mirrors TC-036's own
  wording). No regression action; no acceptance criterion requires un-confirming/un-scheduling.
- **Gates mirror the existing pre-contract/F2-eligibility pattern:** `markVisitConfirmed` only
  succeeds from `contact`; `scheduleVisit` only succeeds from `confirmed`.
- **`target_type` is a fixed 2-option select** (`company`/`institution`) — FR-017's description names
  an exhaustive pair, unlike `AgencyDocument.type`'s open-ended examples.
- **Scope is strictly FR-017.** FR-018 (agency brief generation from confirmed/scheduled visits) is a
  separate, closely related FR left for its own turn.

## 8. Proposed technical design

### Frontend

`src/app/dashboard/trips/[tripId]/visits/page.tsx`: a table of visits (target, type, status,
schedule) with an inline "Mark confirmed" button per `contact`-stage row and an inline schedule form
(date + time) per `confirmed`-stage row, plus an "Add visit target" form at the bottom — same
structural pattern as the documents page. Linked from the roster page ("Visits →").

### Backend

`.../visits/actions.ts` (`"use server"`, inline zod, `requireOperator()` first): `addVisit`,
`confirmVisit`, `scheduleVisitAction`. Core logic in `src/lib/visits.ts`: `registerVisitRecord`,
`listVisitsForTrip`, `markVisitConfirmed`, `scheduleVisit`.

### Database

New `Visit` model (`id`, `tripId`, `targetName`, `targetType`, `status`, `scheduledDate`,
`scheduledTime`, `notes`, `createdAt`), migrated with `prisma migrate dev --name feat011_visits`.

### Security

Every action requires an operator session via `requireOperator()`. No new participant-facing surface.

## 9. Required tests

| ID | Test | Type |
|---|---|---|
| TC-035 | Advancing a visit through contact → confirmed → scheduled records status at each stage | Functional |
| TC-036 | Setting a day/time on a confirmed visit stores the schedule | Functional |

Automated: `src/lib/visits.test.ts` (Prisma-backed, throwaway SQLite, same pattern as
`agencyDocuments.test.ts`) — covers both gates (rejecting confirm/schedule from the wrong status) and
the full pipeline end to end. Manual: added a visit target, confirmed it, scheduled it with a
day/time via curl against the running dev server, and confirmed the roster showed `scheduled` with
the correct date/time at each step.

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
- [x] It is linked to requirements (FR-017).
- [x] It has acceptance criteria (in the FR).
- [x] It has defined tests (TC-035, TC-036).
- [x] The technical impact is understood.
- [x] The user impact is understood.

## 12. Checklist before closing

- [x] Implemented.
- [x] Tests executed (`npm run test` — 81/81 passing; manual end-to-end pass against the running app).
- [x] Acceptance criteria met.
- [ ] Pull request reviewed.
- [x] Documentation updated.
- [ ] Release notes updated.

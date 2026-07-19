# FEAT-004 - Funnel core: Trip + Participant state machine

## 1. Summary

Build the core of the participant funnel: the board creates a **Trip** with per-transition deadlines,
adds **Participants** to it, advances/regresses their funnel state by toggling two independent flags
(`contract_signed`, `deposit_confirmed`) with `Confirmed` auto-derived, and the tool flags a
participant as **overdue** when their current transition's deadline has passed.

## 2. Problem or need

Before this feature Solanum had no participant/trip data at all — only operator authentication
(FEAT-003). The board has no way to track who is where in the funnel or who is late on a step. FEAT-004
gives the board that base: a trip, a roster, and the state machine everything else (reminders, funnel
counts, price tiers) will build on.

## 3. Affected user

- **Exec board** — creates trips, adds participants, sets transition flags, sees overdue flags.

## 4. Related requirements

- FR-003 — Create a trip and define its funnel deadlines.
- FR-004 — Add participants and view their current state.
- FR-005 — Advance or regress a participant's state (Confirmed auto-derived).
- FR-006 — Flag overdue transitions.

Out of scope for this FEAT (deferred to a later FEAT-005): FR-007 (reminder message generation),
FR-008 (daily push list), FR-009 (reminder cadence/snooze/dismiss).

## 5. Expected flow

1. The board creates a trip, setting an absolute deadline and/or a relative "N days" fallback for the
   "Contract signed" and "Deposit confirmed" transitions.
2. The board adds a participant (first name, last name, email) with an initial state
   (`Interested` or `Registered (F1)`).
3. The board marks the contract as sent (`Contract sent`) — the only path out of the pre-contract
   states; no participant deadline applies to this transition.
4. The board toggles `contract_signed` and `deposit_confirmed` independently as the participant
   progresses; the system derives `Confirmed` once both are true, and regresses (never below
   `Contract sent`) if either is cleared.
5. When the board opens the trip roster, any participant whose pending transition deadline has passed
   is shown with an "OVERDUE" badge, unless they are `Withdrawn/Declined`.
6. The board can withdraw a participant at any point (optional drop reason); the record is kept, not
   deleted, and excluded from overdue flagging and action controls going forward.

## 6. Acceptance criteria

Acceptance criteria are defined in **FR-003, FR-004, FR-005, FR-006** (`docs_en/03_requirements.md`),
not here. This FEAT only references them.

## 7. Business rules

Business rules live in the FRs (`docs_en/03_requirements.md`). Key rules implemented here:

- `Confirmed` is derived, never hand-set (§6.3, FR-005).
- `contract_signed`/`deposit_confirmed` can only be set once the participant has reached
  `Contract sent` (a gate enforced by `applyTransitionFlag`); the two flags are independent of each
  other.
- A regression that clears both flags floors at `Contract sent` — never back to a pre-contract state.
- `Withdrawn/Declined` is terminal, keeps historical flags, and is excluded from overdue flagging
  (FR-006) and from the action controls on the roster.
- Grace period defaults to 0 days; deadlines are absolute-date-first, relative-days fallback
  (resolves the FR-003 `[PROPOSED — confirm]` tags — see `07_data_model.md`).
- Overdue is computed on demand (no cron), using plain UTC calendar-day arithmetic — `Trip.timezone`
  is stored but not yet consumed (accepted v1 simplification).

## 8. Proposed technical design

### Frontend

Server Components under `src/app/dashboard/trips/`: `new/page.tsx` (create-trip form), `[tripId]/page.tsx`
(roster: state, overdue badge, per-participant transition controls, add-participant form). Plain HTML
elements only, no new UI dependency.

### Backend

Next.js **Server Actions**, not REST routes (see `06_api.md`): `createTrip`, `addParticipant`,
`withdrawParticipant` (named, in `actions.ts` files) and `markContractSent` /
`applyTransitionFlag`-backed inline actions for the no-field toggle buttons. Every action calls
`requireOperator()` (`src/lib/authz.ts`) first. Core logic lives in plain, Prisma-free
`src/lib/funnel.ts` (state derivation + overdue math, unit-tested) and Prisma-backed `src/lib/trips.ts`
/ `src/lib/participants.ts`.

### Database

New Prisma models `Trip` and `Participant` (see `07_data_model.md` for the full field list). Migrated
with `prisma migrate dev` (`prisma/migrations/20260719004019_feat004_funnel_core/`) — the first formal
migration for this repo; `db:push` remains available for quick local iteration.

### Security

Every action requires an operator session (`requireOperator()`); no participant-facing route exists
(participants never log in, NF-2/NF-8). No sensitive data is collected by this FEAT (only name, email,
and funnel flags).

## 9. Required tests

| ID | Test | Type |
|---|---|---|
| TC-006 | Create a trip with a deadline per transition | Functional |
| TC-007 | Board-action transition has no participant deadline | Functional |
| TC-008 | Board adds a participant to a trip | Functional |
| TC-009 | Board views a trip with participants | Functional |
| TC-010 | Board marks the next transition on a participant | Functional |
| TC-011 | Confirmed is auto-derived from both flags | Functional |
| TC-012 | Regression clears Confirmed and floors at Contract sent | Functional |
| TC-013 | Overdue flag on a past deadline | Functional |
| TC-014 | Withdrawn/Declined participant is not flagged overdue | Security / privacy-adjacent (exclusion rule) |
| TC-015 | Late-joiner after a trip-wide deadline | Deferred — known v1 gap, see `08_test_plan.md` |

Automated: `src/lib/funnel.test.ts` (pure state machine + overdue math), `src/lib/trips.test.ts` /
`src/lib/participants.test.ts` (real Prisma write path against a throwaway SQLite file). Run with
`npm run test`. The thin `"use server"` action files (auth + validation + delegate + redirect) were
verified manually against the running dev server (login → create trip → add participant → withdraw
participant, end to end against real SQLite) rather than with an automated request-level harness — no
such harness (e.g. Playwright) is introduced in this first pass, consistent with a local-first
prototype maintained by student volunteers.

## 10. Documentation impact

- [x] Update requirements — already present (`03_requirements.md`, FR-003..FR-006); no changes needed.
- [x] Update architecture (`02_architecture.md`).
- [x] Update API doc (`06_api.md` — Server Actions, not REST).
- [x] Update backlog (`05_backlog.md`).
- [x] Update data model (`07_data_model.md`).
- [x] Update test plan (`08_test_plan.md`).
- [x] Feature doc (this file).
- [ ] Release notes — on release to `main`.

## 11. Checklist before implementing

- [x] The feature has a clear objective.
- [x] It is linked to requirements (FR-003, FR-004, FR-005, FR-006).
- [x] It has acceptance criteria (in the FRs).
- [x] It has defined tests (TC-006..TC-015).
- [x] The technical impact is understood.
- [x] The user impact is understood.

## 12. Checklist before closing

- [x] Implemented.
- [x] Tests executed (`npm run test` — 27/27 passing; manual end-to-end pass on the dev server).
- [x] Acceptance criteria met (TC-006..TC-014; TC-015 deferred, documented as a known gap).
- [ ] Pull request reviewed.
- [x] Documentation updated.
- [ ] Release notes updated.

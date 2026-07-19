# FEAT-005 - Reminders: message templates, daily push list, snooze/dismiss

## 1. Summary

Turn FEAT-004's overdue signal into the board's daily workflow: a drafted WhatsApp-format reminder
message per overdue transition with a copy-to-clipboard action, a per-trip "push today" list of
overdue participants grouped by transition and ordered most-overdue-first, and reminder cadence
tracking (snooze for N days, dismiss today's nudge, record nudges with a timestamp and counter).

## 2. Problem or need

FEAT-004 already computes who is overdue, but the board had no way to act on it day to day: no
drafted message, no daily to-do list, no way to avoid re-nudging the same person every single day.
FEAT-005 closes that loop while keeping the "human-in-the-loop, never-sends" principle intact — the
tool drafts and tracks, a human copies and actually sends.

## 3. Affected user

- **Exec board** — views the daily push list, copies reminder messages, records nudges,
  snoozes/dismisses participants.

## 4. Related requirements

- FR-007 — Generate the reminder message for the overdue transition.
- FR-008 — Produce the daily push list.
- FR-009 — Reminder cadence, snooze/dismiss and nudge tracking.

## 5. Expected flow

1. The board opens a trip's roster and follows the new "Push today →" link.
2. The page lists every overdue, non-withdrawn, non-snoozed participant, grouped by which
   transition is pending (contract signed / deposit confirmed), oldest deadline first within each
   group.
3. Each entry shows a drafted reminder message; the board clicks "Copy message" to copy it to the
   clipboard and pastes it into WhatsApp themselves (the tool never sends).
4. After actually contacting the participant, the board clicks "Mark as nudged" — this is a
   deliberate, separate action from copying, since copying does not guarantee the message was sent.
5. If the participant needs more time, the board snoozes them for N days, or dismisses just today's
   nudge (reappearing tomorrow) without committing to a longer snooze.

## 6. Acceptance criteria

Acceptance criteria are defined in **FR-007, FR-008, FR-009** (`docs_en/03_requirements.md`), not
here.

## 7. Business rules

Business rules live in the FRs. Key rules implemented here:

- One template per transition (`contractSigned`, `depositConfirmed`); no literal `{transition}` token
  — the transition identity is which template is selected, not an interpolated field.
- `{amount}`/`{payment_reference}` are **not** interpolated: Solanum has no price/payment fields yet
  (FR-013/PriceTier is a separate, not-yet-built feature).
- Dismiss = snooze for 1 day (start of the next UTC calendar day) — the same `snoozed_until` field,
  no separate "dismissed" flag.
- Recording a nudge is a deliberate board action, separate from copying the message.
- No operator identity is recorded for snooze/nudge/dismiss (no AC requires it; see
  `07_data_model.md`).
- **The literal Spanish message wording is a draft, `[PROPOSED — confirm]`** — the team should review
  and edit it (same treatment given to the F1/F2 user-facing strings in FEAT-001/002).

## 8. Proposed technical design

### Frontend

`src/app/dashboard/trips/[tripId]/push/page.tsx` (Server Component): builds the push list via
`buildPushList`, renders one section per non-empty transition group, each entry showing the message,
a `CopyButton`, and nudge/snooze/dismiss forms. `copy-button.tsx` is a `"use client"` component —
the app's first beyond `/login` — wrapping only `navigator.clipboard.writeText`; it receives the
already-rendered message text as a prop and contains no business logic.

### Backend

Next.js Server Actions in `src/app/dashboard/trips/[tripId]/push/actions.ts`: `recordNudge`,
`snoozeParticipant`, `dismissParticipantToday`, each calling `requireOperator()` first. Core logic in
`src/lib/reminders.ts` (pure): `buildPushList`, `renderReminderMessage`, `computeSnoozedUntil`,
`isSnoozed`, `isNudgedToday`. Persistence in `src/lib/participants.ts`: `recordNudgeRecord`,
`snoozeParticipantRecord`, `dismissParticipantTodayRecord` (delegates to `snoozeParticipantRecord`
with `days = 1`).

### Database

Three new `Participant` fields: `snoozedUntil` (DateTime?), `lastRemindedAt` (DateTime?),
`reminderCount` (Int, default 0). Migrated with `prisma migrate dev --name feat005_reminders`.

### Security

Every action requires an operator session via `requireOperator()`. No new participant-facing surface;
messages are drafted for the board to copy, never sent by the tool.

## 9. Required tests

| ID | Test | Type |
|---|---|---|
| TC-016 | Message shown for an overdue participant, correct per transition | Functional |
| TC-017 | Copy-to-clipboard is plain text, no PII in a URL | Security / privacy-adjacent |
| TC-018 | Push list grouped by transition, most-overdue-first, snoozed excluded | Functional |
| TC-019 | Withdrawn/Declined excluded from the push list | Functional |
| TC-020 | Recording a nudge sets `last_reminded_at` and increments the counter | Functional |
| TC-021 | Snoozing for N days hides the participant until N days pass | Functional |
| TC-022 | Dismissing today hides them today, reappear tomorrow | Functional |

Automated: `src/lib/reminders.test.ts` (pure grouping/sorting/template logic, fully controlled `now`)
and new blocks in `src/lib/participants.test.ts` (real Prisma persistence). Run with `npm run test`.
TC-017's clipboard behavior itself is not unit-testable (no DOM/clipboard API in Vitest); verified by
a content-level assertion (no URL/`wa.me` in any template) plus code review of `copy-button.tsx` and
a manual pass against the running dev server. `recordNudge`/`dismissParticipantToday` were also
verified manually end-to-end (curl against the real server + SQLite), same treatment as FEAT-004's
thin action files.

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
- [x] It is linked to requirements (FR-007, FR-008, FR-009).
- [x] It has acceptance criteria (in the FRs).
- [x] It has defined tests (TC-016..TC-022).
- [x] The technical impact is understood.
- [x] The user impact is understood.

## 12. Checklist before closing

- [x] Implemented.
- [x] Tests executed (`npm run test` — 41/41 passing; manual end-to-end pass on the dev server).
- [x] Acceptance criteria met.
- [ ] Pull request reviewed.
- [x] Documentation updated.
- [ ] Release notes updated.

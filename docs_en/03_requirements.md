# Functional requirements

This document catalogs what the system must do. Each functional requirement (FR) is an **atomic and verifiable** capability. To add one, copy the block from `docs_en/templates/template_requirement.md` and paste it below the index.

> **Distinction:** the FR defines **what** the system must do; the **how** (design, screens, data schema, steps) lives in the feature document (`docs_en/templates/template_feature.md`). Work progress, estimation and ownership live in `05_backlog.md`.

## How to write an FR

1. **Atomic:** one FR = one capability. If you join two functions with "and", split it into two FRs.
2. **Data ≠ functions:** fields are grouped inside the function that uses them, not one FR per field.
3. **Fixed pattern:** "The system shall, when [trigger/actor], [observable result]". Design (technology, screens, data schema) and vagueness ("fast", "friendly", "easy") are forbidden.
4. **Observable result (channel-neutral):** persisted state, record created/modified, value or code returned, event emitted or on-screen output. It does not require a graphical interface.
5. **Discriminator always:** every result (happy or error) must be distinguishable: resulting state, flagged field or code. Never just "shows an error".
6. **Error path:** mandatory if the FR accepts user input, depends on preconditions or requires permissions/state. It goes as a criterion with its TC-.
7. **Verifiable:** each acceptance criterion maps 1:1 to a TC- in `08_test_plan.md` (the assertion lives in the TC's "Expected result"). Coverage: every described path has ≥1 criterion; no criterion without a described behavior.
8. **Priority = requirement criticality** (see scale), not work urgency (that is managed by `05_backlog.md`).
9. **Do not invent:** anything unconfirmed is marked `[PENDING: ask client]`.
10. **FR ↔ FEAT boundary:** criteria and rules are written in the FR; the feature document (FEAT) **references** them ("Criteria: see FR-XXX"), it does not rewrite them.

**Priority scale:**

| Priority | Meaning |
|---|---|
| High | Without this requirement the system does not fulfill its purpose. |
| Medium | Adds value; its absence degrades the system but can be deferred. |
| Low | Desirable; no impact on core value. |

**Status (requirement validity):** `Proposed` / `Approved` / `Obsolete`. Implementation progress is not recorded here; it is read in `05_backlog.md`.

## Requirements index

<!-- Catalog at a glance; the detail lives in each FR-XXX block below. -->

| ID | Requirement | Priority |
|---|---|---|
| FR-001 | Participant registration via F1 intake form | High |
| FR-002 | F2 completion status tracking (status-only) | High |
| FR-003 | Create a trip and define its funnel deadlines | High |
| FR-004 | Add participants and view their current state | High |
| FR-005 | Advance or regress a participant's state (Confirmed auto-derived) | High |
| FR-006 | Flag overdue transitions | High |
| FR-007 | Generate the reminder message for the overdue transition | High |
| FR-008 | Produce the daily push list | High |
| FR-009 | Reminder cadence, snooze/dismiss and nudge tracking | High |

<!-- Paste each FR here using docs_en/templates/template_requirement.md -->

---

## FR-001 — Participant registration via F1 intake form

**Actor:** Participant · **Priority:** High · **Status:** Approved
**Origin:** 01_product_vision.md / PRD §6 (state machine), FEAT-001

### Description

The system shall, when a participant submits the F1 form, create a `participant` record with the
operational (non-sensitive) fields and set `current_state = "Registered (F1)"`.

### Acceptance criteria

- [ ] Given a valid F1 submission with all required fields and consent, when the participant submits, then a `participant` record is created with `current_state = "Registered (F1)"`, `privacy_consent = true` and a `consent_timestamp` set. → TC-001
- [ ] Given a submission missing a required field (email, first_name, last_name, student_id, age, phone, or consent), when the participant submits, then the submission is rejected and the missing field is flagged. → TC-002
- [ ] Given an input with an invalid format (student_id not matching `A########`, age < 18, or an invalid email), when the participant submits, then the submission is rejected and the offending field is flagged. → TC-003

### Business rules

- F1 must not collect or store sensitive data (passport scan, full date of birth, medical
  conditions, allergies, diet, official documents, payment/bank data). Those belong to F2 (FR-002 /
  FEAT-002) or to later external processes.
- `student_id` follows the pattern `A########` (letter `A` + 8 digits); `age` is an integer ≥ 18.

---

## FR-002 — F2 completion status tracking (status-only)

**Actor:** Exec board · **Priority:** High · **Status:** Approved
**Origin:** PRD §6 (state machine), §14 (privacy), ADR-001, FEAT-002

### Description

The system shall, when the exec board marks a participant's F2 as completed, persist only the F2
status flags and set `current_state = "F2 complete"`, without storing F2 sensitive data.

### Acceptance criteria

- [ ] Given a participant whose F2 the board marks as completed, when the action is confirmed, then `F2_complete = true`, `F2_completed_at` is set, and `current_state = "F2 complete"`. → TC-004
- [ ] Given an F2 completion is recorded, when the participant record is inspected, then no F2 sensitive field (passport scan, birth date, medical condition, diet/food restriction) is persisted in Solanum. → TC-005

### Business rules

- F2 applies only to participants already in `Contract signed`, `Deposit confirmed`, or `Confirmed`.
- Solanum stores completion status only and acts as a tracker, not a repository of sensitive data
  (see ADR-001). Sensitive F2 answers remain in an external tool controlled by the organizing team.

---

## FR-003 — Create a trip and define its funnel deadlines

**Actor:** Exec board · **Priority:** High · **Status:** Approved
**Origin:** PRD §12 (F-1), §7.1 (per-transition deadline model)

### Description

The system shall, when the board creates a trip, persist the trip together with a deadline for each
funnel transition (an absolute trip-level date or a relative "N days after entering the state"), so
that overdue detection (FR-006) can run.

### Acceptance criteria

- [ ] Given a new trip with a deadline set for each transition, when the board saves it, then the trip is persisted and each transition stores its deadline source (absolute date or N-days-relative). → TC-006
- [ ] Given a board-action transition with no participant deadline (Registered (F1) → Contract sent), when the trip is saved, then no participant deadline applies to that transition (it is a board task only). → TC-007

### Business rules

- Deadlines are either an **absolute date** (trip-level, e.g. first-payment date) or **relative** (N days after entering the current state); each transition declares which. `[PROPOSED — confirm]`
- **Grace period** default **0 days** (overdue the day after the deadline), configurable per trip. `[PROPOSED — confirm]`
- Timezone is **board-local**. `[PROPOSED — confirm]`

---

## FR-004 — Add participants and view their current state

**Actor:** Exec board · **Priority:** High · **Status:** Approved
**Origin:** PRD §12 (F-2), §6 (state machine)

### Description

The system shall, when the board adds a participant to a trip, create the participant record with an
initial funnel state, and shall display each participant's current state in the trip roster.

### Acceptance criteria

- [ ] Given a trip, when the board adds a participant, then the participant record is created with a `current_state` and appears in the trip roster. → TC-008
- [ ] Given participants exist on a trip, when the board views the trip, then each participant's `current_state` is shown. → TC-009

### Business rules

- Participants may also enter at `Registered (F1)` via the F1 form (FR-001); FR-004 is the board-side
  add/view path.

---

## FR-005 — Advance or regress a participant's state (Confirmed auto-derived)

**Actor:** Exec board · **Priority:** High · **Status:** Approved
**Origin:** PRD §12 (F-3), §6.3 (Confirmed derived), §6.5 (regression)

### Description

The system shall, when the board sets or clears a transition flag on a participant, advance or regress
the participant's funnel state accordingly, auto-derive the `Confirmed` state when both "Contract
signed" and "Deposit confirmed" are true, and record each change with a timestamp and the acting
operator.

### Acceptance criteria

- [ ] Given a participant, when the board marks the next transition, then the participant advances to that state and the change is recorded with a timestamp and the operator. → TC-010
- [ ] Given a participant with "Contract signed" AND "Deposit confirmed" both true, when the second flag is set, then the system auto-derives `Confirmed` and adds the participant to the confirmed-group list (the board never sets `Confirmed` directly). → TC-011
- [ ] Given a `Confirmed` participant, when "Deposit confirmed" or "Contract signed" is cleared, then the system regresses the state, removes the participant from the confirmed-group list and re-decrements the confirmed count, and updates the per-transition timestamps. → TC-012

### Business rules

- `Confirmed` is derived, never hand-set (§6.3). "Contract signed" and "Deposit confirmed" are two
  independent flags.
- Transitions are reversible (§6.5); moving back clears the flags of the states left behind.
- All state changes (forward and back) are recorded with a timestamp and the acting operator
  (audit trail, PRD §16).

---

## FR-006 — Flag overdue transitions

**Actor:** System (trigger) · **Priority:** High · **Status:** Approved
**Origin:** PRD §12 (F-4, §12.6 criteria), §7.1

### Description

The system shall, when the board opens the tool, flag every participant whose current transition's
deadline has passed as **overdue**, excluding participants in `Withdrawn/Declined`.

### Acceptance criteria

- [ ] Given a participant in "Contract sent" whose contract/first-payment deadline was yesterday, when the board opens the tool, then that participant is flagged overdue. → TC-013
- [ ] Given a `Withdrawn/Declined` participant with a past deadline, when the board opens the tool, then that participant is **not** flagged. → TC-014
- [ ] Given a late-joiner who entered after a trip-wide deadline had already passed, when overdue is evaluated, then they are not instantly flagged (their relative clock starts at entry, or the board sets a per-participant deadline override). `[PROPOSED — confirm]` → TC-015

### Business rules

- `Withdrawn/Declined` is excluded from overdue flagging, from the daily push list (FR-008) and from
  active funnel/confirmed counts (§6.4).
- Grace period default 0 days (per FR-003).

---

## FR-007 — Generate the reminder message for the overdue transition

**Actor:** Exec board · **Priority:** High · **Status:** Approved
**Origin:** PRD §12 (F-5, §12.6 criteria), §7.4, NF-7

### Description

The system shall, when the board views an overdue participant, output a WhatsApp-format, plain-text
reminder message for that exact transition, with interpolated fields and a copy-to-clipboard action.
The tool does not send the message itself in v1.

### Acceptance criteria

- [ ] Given an overdue participant, when the board views them, then a WhatsApp-format message for that exact transition is shown with `{first_name}` and `{deadline}` interpolated. → TC-016
- [ ] Given the message is shown, when the board triggers "copy", then the plain text is copied to the clipboard (no PII in a URL; no `wa.me` deep link — NF-7). → TC-017

### Business rules

- One template per transition, seeded from LEAD's playbook; language Spanish, informal-respectful. `[PROPOSED — confirm]`
- Interpolation fields: `{first_name}`, `{transition}`, `{deadline}`, and where relevant `{amount}` / `{payment_reference}`.
- Delivery mechanism is plain-text copy to clipboard (NF-7 forbids PII in URLs, so `wa.me/?text=`
  deep links carrying a name are out).

---

## FR-008 — Produce the daily push list

**Actor:** Exec board · **Priority:** High · **Status:** Approved
**Origin:** PRD §12 (F-6, §12.6 criteria), §7.3

### Description

The system shall, when the board opens "push today", produce the list of overdue participants to
contact, grouped by transition and ordered most-overdue first, excluding snoozed/dismissed
participants and `Withdrawn/Declined`.

### Acceptance criteria

- [ ] Given 3 overdue participants and 1 snoozed participant, when the board opens "push today", then exactly the 3 overdue appear, grouped by transition, most-overdue first, and the snoozed one is absent. → TC-018
- [ ] Given a `Withdrawn/Declined` participant, when the daily list is produced, then that participant is absent. → TC-019

### Business rules

- Grouped by transition; within a group, ordered by how overdue (most overdue first). `[PROPOSED — confirm]`

---

## FR-009 — Reminder cadence, snooze/dismiss and nudge tracking

**Actor:** Exec board · **Priority:** High · **Status:** Approved
**Origin:** PRD §12 (F-22), §7.2

### Description

The system shall track reminder cadence: an overdue participant reappears on the daily list once per
day until their state advances or they are snoozed/dropped; the board can snooze a participant for N
days or dismiss today's nudge; and the system records `last_reminded_at` and a per-participant
reminder counter.

### Acceptance criteria

- [ ] Given an overdue participant, when the board records a nudge, then `last_reminded_at` is set to today, the reminder counter increments, and the participant shows "nudged today". → TC-020
- [ ] Given an overdue participant, when the board snoozes them for N days, then they do not reappear on the daily list until N days have passed. → TC-021
- [ ] Given an overdue participant, when the board dismisses today's nudge, then they are absent from today's list but reappear the next day. → TC-022

### Business rules

- Cadence: once per day until the state advances, or the participant is snoozed or dropped. `[PROPOSED — confirm]`
- Only the reminder count and `last_reminded_at` are stored, not the message body (§7.2; supports the
  §18 metrics without retaining message text).

---

## Identifier convention

| Type | Prefix | Example |
|---|---|---|
| Functional requirement | FR | FR-001 |
| Non-functional requirement | NFR | NFR-001 |
| User story | US | US-001 |
| Technical decision | ADR | ADR-001 |
| Test | TC | TC-001 |
| Feature | FEAT | FEAT-001 |
| Bug | BUG | BUG-001 |

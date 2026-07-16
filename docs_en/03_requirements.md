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

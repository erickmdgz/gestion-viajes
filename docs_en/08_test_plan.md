# Test plan

## Strategy

The system's main flows will be tested before closing each feature.

## Test types

- Functional tests.
- Validation tests.
- Basic security tests.
- Simple regression tests.
- Manual user tests.

## Test cases

<!-- Each TC- maps 1:1 to an acceptance criterion of an FR (see 03_requirements.md). -->

| ID | Feature | Requirement | Case | Expected result | Status |
|---|---|---|---|---|---|
| TC-001 | FEAT-001 | FR-001 | Submit F1 with all required fields and consent | `participant` created with `current_state = "Registered (F1)"`, `privacy_consent = true`, `consent_timestamp` set | Pending |
| TC-002 | FEAT-001 | FR-001 | Submit F1 missing a required field (e.g. student_id or consent) | Submission rejected; the missing field is flagged; no record created | Pending |
| TC-003 | FEAT-001 | FR-001 | Submit F1 with invalid format (student_id ≠ `A########`, age < 18, invalid email) | Submission rejected; the offending field is flagged | Pending |
| TC-004 | FEAT-002 | FR-002 | Board marks a confirmed participant's F2 as complete | `F2_complete = true`, `F2_completed_at` set, `current_state = "F2 complete"` | Pending |
| TC-005 | FEAT-002 | FR-002 | Inspect participant record after F2 completion | No F2 sensitive field (passport, birth date, medical, diet) is persisted in Solanum | Pending |
| TC-006 | Funnel core | FR-003 | Create a trip with a deadline per transition | Trip persisted; each transition stores its deadline source (absolute date or N-days-relative) | Pending |
| TC-007 | Funnel core | FR-003 | Save a trip where Registered (F1) → Contract sent has no participant deadline | No participant deadline applies to that board-action transition | Pending |
| TC-008 | Funnel core | FR-004 | Board adds a participant to a trip | Participant created with a `current_state` and appears in the roster | Pending |
| TC-009 | Funnel core | FR-004 | Board views a trip with participants | Each participant's `current_state` is shown | Pending |
| TC-010 | Funnel core | FR-005 | Board marks the next transition on a participant | Participant advances to that state; change recorded with timestamp + operator | Pending |
| TC-011 | Funnel core | FR-005 | A participant has both Contract signed AND Deposit confirmed | System auto-derives `Confirmed` and adds them to the confirmed-group list (board never sets Confirmed directly) | Pending |
| TC-012 | Funnel core | FR-005 | A Confirmed participant loses Deposit confirmed or Contract signed | State regresses; removed from confirmed-group list; confirmed count re-decremented; timestamps updated | Pending |
| TC-013 | Funnel core | FR-006 | Participant in "Contract sent" with a deadline of yesterday; board opens the tool | Participant is flagged overdue | Pending |
| TC-014 | Funnel core | FR-006 | Withdrawn/Declined participant with a past deadline; board opens the tool | Participant is NOT flagged overdue | Pending |
| TC-015 | Funnel core | FR-006 | Late-joiner entering after a trip-wide deadline had passed | Not instantly flagged; relative clock starts at entry (or per-participant override) `[PROPOSED]` | Pending |
| TC-016 | Funnel core | FR-007 | Board views an overdue participant | WhatsApp-format message for that exact transition shown with `{first_name}` and `{deadline}` interpolated | Pending |
| TC-017 | Funnel core | FR-007 | Board triggers "copy" on the message | Plain text copied to clipboard; no PII in a URL / no `wa.me` deep link (NF-7) | Pending |
| TC-018 | Funnel core | FR-008 | 3 overdue + 1 snoozed participant; board opens "push today" | Exactly the 3 overdue appear, grouped by transition, most-overdue first; snoozed one absent | Pending |
| TC-019 | Funnel core | FR-008 | Withdrawn/Declined participant; daily list produced | That participant is absent from the list | Pending |
| TC-020 | Funnel core | FR-009 | Board records a nudge on an overdue participant | `last_reminded_at` set to today; reminder counter increments; shows "nudged today" | Pending |
| TC-021 | Funnel core | FR-009 | Board snoozes an overdue participant for N days | Participant does not reappear on the daily list until N days pass | Pending |
| TC-022 | Funnel core | FR-009 | Board dismisses today's nudge on an overdue participant | Participant absent from today's list; reappears the next day | Pending |

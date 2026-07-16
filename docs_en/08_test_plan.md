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
| TC-023 | Agency layer | FR-010 | Board uploads a document with type, version label and date | Document registered and listed under its type | Pending |
| TC-024 | Agency layer | FR-010 | Board saves a document missing type or version label | Rejected; the missing field is flagged | Pending |
| TC-025 | Agency layer | FR-011 | Three budget versions; board marks v3 current | v1 and v2 show "superseded"; only v3 is current and served to distribution | Pending |
| TC-026 | Agency layer | FR-011 | Type already has a current version; another is marked current | Exactly one remains current; the previous becomes superseded | Pending |
| TC-027 | Agency layer | FR-012 | Board records a free-text changelog on a version | Note stored and shown with that version | Pending |
| TC-028 | Agency layer | FR-013 | Tiers [10–19:$X],[20–29:$Y], 20 confirmed; a 21st confirms | Displayed tier stays [20–29] | Pending |
| TC-029 | Agency layer | FR-013 | Same tiers; a confirmed participant reverted below 20 | Tier re-resolves to [10–19] | Pending |
| TC-030 | Agency layer | FR-013 | Confirmed count below the smallest tier | Tool shows "no tier / below minimum" (no guess) | Pending |
| TC-031 | Distribution | FR-014 | Board publishes the current itinerary | Shareable link/file produced for the confirmed group, pointing to the current version | Pending |
| TC-032 | Distribution | FR-014 | Current itinerary superseded by a new current version; shared link opened | Link serves the new current version | Pending |
| TC-033 | Distribution | FR-015 | Board publishes a notice / payment-date reminder | Available as shareable content | Pending |
| TC-034 | Distribution | FR-016 | Board requests promotional content | Draft content ideas and image prompts generated | Pending |
| TC-035 | Visits | FR-017 | Board advances a visit through contact → confirmation → scheduled | Status recorded at each stage | Pending |
| TC-036 | Visits | FR-017 | Board sets a day and time on a confirmed visit | Scheduled day and time stored on the visit | Pending |
| TC-037 | Visits | FR-018 | Board generates a visit brief with confirmed/scheduled visits | Brief produced containing those visits | Pending |
| TC-038 | Visits | FR-018 | A visit still at "contact"; board generates the brief | That unconfirmed visit is excluded from the brief | Pending |

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
| TC-001 | FEAT-001 | FR-001 | Submit F1 with all required fields and consent | `participant` created with `current_state = "Registered (F1)"`, `privacy_consent = true`, `consent_timestamp` set | Passed (automated: `src/lib/f1Registration.test.ts`, `src/lib/participants.test.ts`; manual: curl-verified public submission with no session against the running app) |
| TC-002 | FEAT-001 | FR-001 | Submit F1 missing a required field (e.g. student_id or consent) | Submission rejected; the missing field is flagged; no record created | Passed (automated: `f1Registration.test.ts`; manual: curl-verified missing-consent rejection, 0 records created) |
| TC-003 | FEAT-001 | FR-001 | Submit F1 with invalid format (student_id ≠ `A########`, age < 18, invalid email) | Submission rejected; the offending field is flagged | Passed (automated: `f1Registration.test.ts`; manual: curl-verified invalid student_id rejection with the correct Spanish message) |
| TC-004 | FEAT-002 | FR-002 | Board marks a confirmed participant's F2 as complete | `F2_complete = true`, `F2_completed_at` set, `current_state = "F2 complete"` | Pending |
| TC-005 | FEAT-002 | FR-002 | Inspect participant record after F2 completion | No F2 sensitive field (passport, birth date, medical, diet) is persisted in Solanum | Pending |
| TC-006 | FEAT-004 | FR-003 | Create a trip with a deadline per transition | Trip persisted; each transition stores its deadline source (absolute date or N-days-relative) | Passed (automated: `src/lib/trips.test.ts`; manual: curl-verified `createTrip` against the running app) |
| TC-007 | FEAT-004 | FR-003 | Save a trip where Registered (F1) → Contract sent has no participant deadline | No participant deadline applies to that board-action transition | Passed (automated: `src/lib/trips.test.ts`, `src/lib/funnel.test.ts` pre-contract exclusion) |
| TC-008 | FEAT-004 | FR-004 | Board adds a participant to a trip | Participant created with a `current_state` and appears in the roster | Passed (automated: `src/lib/participants.test.ts`; manual: curl-verified `addParticipant` + roster render) |
| TC-009 | FEAT-004 | FR-004 | Board views a trip with participants | Each participant's `current_state` is shown | Passed (automated: `src/lib/trips.test.ts`; manual: roster page shows `current_state` per row) |
| TC-010 | FEAT-004 | FR-005 | Board marks the next transition on a participant | Participant advances to that state; change recorded with timestamp + operator | Passed (automated: `src/lib/participants.test.ts`) |
| TC-011 | FEAT-004 | FR-005 | A participant has both Contract signed AND Deposit confirmed | System auto-derives `Confirmed` and adds them to the confirmed-group list (board never sets Confirmed directly) | Passed (automated: `src/lib/participants.test.ts`, `src/lib/funnel.test.ts`) |
| TC-012 | FEAT-004 | FR-005 | A Confirmed participant loses Deposit confirmed or Contract signed | State regresses; removed from confirmed-group list; confirmed count re-decremented; timestamps updated | Passed (automated: `src/lib/participants.test.ts`, `src/lib/funnel.test.ts`) |
| TC-013 | FEAT-004 | FR-006 | Participant in "Contract sent" with a deadline of yesterday; board opens the tool | Participant is flagged overdue | Passed (automated: `src/lib/funnel.test.ts`) |
| TC-014 | FEAT-004 | FR-006 | Withdrawn/Declined participant with a past deadline; board opens the tool | Participant is NOT flagged overdue | Passed (automated: `src/lib/funnel.test.ts`; manual: curl-verified withdraw removes overdue-eligible actions) |
| TC-015 | FEAT-004 | FR-006 | Late-joiner entering after a trip-wide deadline had passed | Not instantly flagged; relative clock starts at entry (or per-participant override) `[PROPOSED]` | Deferred — known v1 gap: a late-joiner is instantly overdue if the trip uses an absolute deadline already in the past; no per-participant override is implemented (documented in `07_data_model.md`/FEAT-004 feature doc) |
| TC-016 | FEAT-005 | FR-007 | Board views an overdue participant | WhatsApp-format message for that exact transition shown with `{first_name}` and `{deadline}` interpolated | Passed (automated: `src/lib/reminders.test.ts`; manual: curl-verified message rendered on the running app) |
| TC-017 | FEAT-005 | FR-007 | Board triggers "copy" on the message | Plain text copied to clipboard; no PII in a URL / no `wa.me` deep link (NF-7) | Passed — content guarantee automated (`reminders.test.ts` asserts no URL/`wa.me` in any template); clipboard behavior itself not unit-testable (no DOM/clipboard API in Vitest's node environment); verified by code review of `copy-button.tsx` (no fetch/navigation/URL) |
| TC-018 | FEAT-005 | FR-008 | 3 overdue + 1 snoozed participant; board opens "push today" | Exactly the 3 overdue appear, grouped by transition, most-overdue first; snoozed one absent | Passed (automated: `src/lib/reminders.test.ts`) |
| TC-019 | FEAT-005 | FR-008 | Withdrawn/Declined participant; daily list produced | That participant is absent from the list | Passed (automated: `src/lib/reminders.test.ts`) |
| TC-020 | FEAT-005 | FR-009 | Board records a nudge on an overdue participant | `last_reminded_at` set to today; reminder counter increments; shows "nudged today" | Passed (automated: `reminders.test.ts` for the day-boundary logic, `participants.test.ts` for persistence; manual: curl-verified against the running app) |
| TC-021 | FEAT-005 | FR-009 | Board snoozes an overdue participant for N days | Participant does not reappear on the daily list until N days pass | Passed (automated: `reminders.test.ts` for the N-days semantics, `participants.test.ts` for persistence) |
| TC-022 | FEAT-005 | FR-009 | Board dismisses today's nudge on an overdue participant | Participant absent from today's list; reappears the next day | Passed (automated: `reminders.test.ts`, `participants.test.ts`; manual: curl-verified dismiss against the running app) |
| TC-023 | FEAT-006 | FR-010 | Board registers a document with type, version label and date | Document registered and listed under its type | Passed (automated: `src/lib/agencyDocuments.test.ts`; manual: curl-verified against the running app) |
| TC-024 | FEAT-006 | FR-010 | Board saves a document missing type or version label | Rejected; the missing field is flagged | Passed — `addDocument`'s zod schema (`src/app/dashboard/trips/[tripId]/documents/actions.ts`), verified manually; same treatment as `createTrip`'s validation in FEAT-004, not unit-tested in isolation |
| TC-025 | FEAT-006 | FR-011 | Three budget versions; board marks v3 current | v1 and v2 show "superseded"; only v3 is current and served to distribution | Passed (automated: `agencyDocuments.test.ts`; manual: curl-verified against the running app) |
| TC-026 | FEAT-006 | FR-011 | Type already has a current version; another is marked current | Exactly one remains current; the previous becomes superseded | Passed (automated: `agencyDocuments.test.ts` — the `$transaction` invariant tested directly) |
| TC-027 | FEAT-006 | FR-012 | Board records a free-text changelog on a version | Note stored and shown with that version | Passed (automated: `agencyDocuments.test.ts`; manual: curl-verified against the running app) |
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
| TC-039 | Funnel view | FR-019 | Participants across states (incl. one Withdrawn); board opens funnel view | Count per state shown; Withdrawn/Declined excluded from active counts | Pending |
| TC-040 | Data mgmt | FR-020 | Board imports a CSV of new participants | A participant record is created for each new row | Pending |
| TC-041 | Data mgmt | FR-020 | Import row whose uniqueness key matches an existing participant | Flagged as duplicate; no second record created | Pending |
| TC-042 | Roster | FR-021 | Board views the operational roster | Lists participants with non-sensitive fields only; no F2 sensitive field present | Pending |
| TC-043 | Roster | FR-022 | Board flags a participant as accompanying professor | Marked required attendee; excluded from the confirmed count for tier resolution | Pending |
| TC-044 | Data mgmt | FR-023 | Board edits a participant field (e.g. contact handle) | Updated value persisted | Pending |
| TC-045 | Data mgmt | FR-024 | Board deletes a participant created in error | Record removed | Pending |
| TC-046 | Data mgmt | FR-025 | Board adds a participant with an existing contact handle | Duplicate flagged; no second record created | Pending |
| TC-047 | Data mgmt | FR-026 | Re-imported CSV row matches an existing uniqueness key | Existing record updated; no duplicate created | Pending |
| TC-048 | FEAT-003 | NFR-002 | Operator logs in with valid seeded credentials | Session created; `/dashboard` reachable (HTTP 200) | Passed |
| TC-049 | FEAT-003 | NFR-002 | Login with a wrong password | Rejected; no session created (`/api/auth/session` is null) | Passed |
| TC-050 | FEAT-003 | NFR-002 | Request `/dashboard` without a session | Redirects (307) to `/login?callbackUrl=/dashboard` | Passed |
| TC-051 | FEAT-003 | NFR-001 | Inspect the stored operator after seeding | `passwordHash` is a bcrypt hash, not plaintext | Passed |

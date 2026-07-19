# Data model

## Entity: Operator

An exec-board member who logs in to operate Solanum (FEAT-003). Operators authenticate; participants
never log in (NF-2, NF-8).

| Field | Type | Required | Description |
|---|---|---|---|
| id | UUID | Yes | Unique identifier |
| email | String | Yes | Unique login email |
| name | String | Yes | Display name |
| passwordHash | String | Yes | bcrypt hash; plaintext is never stored (NFR-001) |
| createdAt | DateTime | Yes | Record creation date |

## Entity: Trip

A mission/trip whose participants move through the funnel. Holds the per-transition deadlines that
drive overdue detection (FR-003, FR-006). Aligned with PRD §7.1. Implemented in FEAT-004.

| Field | Type | Required | Description |
|---|---|---|---|
| id | UUID | Yes | Unique identifier |
| name | String | Yes | Trip / mission name |
| registration_close | Date | No | Informational; borders the Registered (F1) → Contract sent transition, which is board-action only and carries no participant deadline (FR-003 AC2) |
| contract_date | Date | No | Absolute deadline for the "Contract signed" transition; wins over `contract_signed_deadline_days` when set |
| contract_signed_deadline_days | Integer | No | Relative fallback for "Contract signed": N days after the participant entered "Contract sent". Used only when `contract_date` is null |
| first_payment_date | Date | No | Absolute deadline for the "Deposit confirmed" transition; wins over `deposit_confirmed_deadline_days` when set |
| deposit_confirmed_deadline_days | Integer | No | Relative fallback for "Deposit confirmed": N days after the participant entered "Contract sent". Used only when `first_payment_date` is null |
| flights_date | Date | No | Reserved for the future "Ready for flights" transition — not used by any FEAT-004 logic |
| grace_period_days | Integer | Yes | Days after a deadline before "overdue"; default 0 |
| timezone | String | Yes | Board-local timezone; **persisted but not yet consumed** — FEAT-004's overdue calculation uses plain UTC calendar-day arithmetic (accepted v1 simplification; a few hours of error near a midnight boundary is not significant at a 0-day default grace period) |

Per-transition deadlines are **absolute** (the trip-level date columns above) when set, else **relative**
(N days after the participant entered "Contract sent", via the matching `*_deadline_days` column), per
§7.1. This resolves the FR-003/§7.1 `[PROPOSED — confirm]` tags: **grace period defaults to 0 days**
and **timezone is board-local but not yet timezone-aware in the overdue calculation** (both confirmed
by FEAT-004). Registered (F1) → Contract sent is board-action only and carries no participant deadline.

## Entity: Participant

A student moving through the Solanum funnel toward a confirmed trip seat. Fields marked **(F1)** are
captured by the F1 form (FEAT-001); fields marked **(F2 status)** are set when the board records F2
completion (FEAT-002). Aligned with PRD §16.

**FEAT-004 implements the funnel-management subset** (identity: `first_name`, `last_name`,
`email`; funnel: `current_state`, `contract_signed`, `deposit_confirmed`, `confirmed`, `withdrawn`,
`drop_reason`, `state_changed_at`, `state_changed_by`) — enough to identify and contact a
board-added participant (FR-004). **FEAT-005 adds the reminder subset** (`snoozed_until`,
`last_reminded_at`, `reminder_count`). **FEAT-001 adds the F1 intake subset** (`preferred_name`,
`student_id`, `age`, `career`, `semester`, `phone`, `instagram`, `nationality`, `passport_status`,
`visa_status`, `whatsapp_group_consent`, `privacy_consent`, `consent_timestamp`) via a public,
unauthenticated page at `/apply/[tripId]` (no board session — participants never log in, NF-2/NF-8).

Two notes on how FEAT-001 differs from this table's "Required: Yes/No" column:

- **`full_name` is not a column.** The FEAT-001 feature doc's own note says it "may be dropped if the
  system concatenates first/last name" — it is, everywhere the roster/push list displays a name.
- **All F1 fields are nullable at the schema level**, even ones marked "Required: Yes" below, because
  `Participant` is shared with the board-manual add path (FR-004), which never collects them.
  "Required" here means required *by the F1 form's own validation* (`src/lib/f1Registration.ts`), not
  a database-level NOT NULL constraint.

The "program information" block described in the FEAT-001 doc (destination, price, seats, payment
schedule, etc.) is **not rendered on the live page** — `Trip` has no such fields and no FR-001
acceptance criterion requires it; the public page only shows `trip.name` plus the form itself. A
deliberate v1 scope trim, not a bug.

**FEAT-002 implements the F2 status subset** (`F2_complete`, `F2_completed_at`, `F2_verified_by`) —
one note on how it differs from the table below: **there is no `F2_verified_at` column.** In this
design, marking F2 complete *is* the verification act (there is no separate "participant reports
completion" step) — a second timestamp identical to `F2_completed_at` would be redundant, so only one
is kept. `F2_verified_by` is kept because it captures something the timestamp doesn't: which operator
acted, mirroring `state_changed_by`.

| Field | Type | Required | Source | Description |
|---|---|---|---|---|
| id | UUID | Yes | System | Unique identifier |
| trip_id | UUID | Yes | System | Trip/mission the participant belongs to |
| email | String | Yes | F1 | Contact email (valid email) |
| first_name | String | Yes | F1 | First name(s) |
| last_name | String | Yes | F1 | Last name(s) |
| preferred_name | String | No | F1 | Preferred form of address |
| student_id | String | Yes | F1 | Enrollment id, pattern `A########` |
| age | Integer | Yes | F1 | Age, must be ≥ 18 |
| career | String | Yes | F1 | Degree program |
| semester | String | Yes | F1 | One of: 0º, 2º, 4º, 6º, 8º, Otro |
| phone | String | Yes | F1 | Phone, format `55########` |
| instagram | String | No | F1 | Instagram handle |
| nationality | String | Yes | F1 | Nationality |
| passport_status | String | Yes | F1 | Status only (no file): Sí / No / No tengo pasaporte todavía / En proceso de renovación |
| visa_status | String | Yes | F1 | Sí / No / En proceso / No aplica |
| whatsapp_group_consent | Boolean | Yes | F1 | Consent to be added to the phase-1 WhatsApp group |
| privacy_consent | Boolean | Yes | F1 | Explicit data-use consent |
| consent_timestamp | DateTime | Yes | F1 | When consent was given |
| current_state | String | Yes | System | Funnel state (see states below) |
| created_at | DateTime | Yes | System | Record creation date |
| F2_complete | Boolean | No | F2 status | Whether F2 was completed (default false) |
| F2_completed_at | DateTime | No | F2 status | When F2 was marked complete (also the verification timestamp — see note above) |
| F2_verified_by | String | No | F2 status | Operator who marked F2 complete |
| contract_signed | Boolean | No | Funnel | Flag set by the board (FR-005) |
| deposit_confirmed | Boolean | No | Funnel | Flag set by the board (FR-005) |
| confirmed | Boolean | No | Derived | Auto-derived: `contract_signed` AND `deposit_confirmed` (§6.3, FR-005) |
| withdrawn | Boolean | No | Funnel | Terminal Withdrawn/Declined flag (§6.4) |
| drop_reason | String | No | Funnel | Optional free-text drop reason (§6.4) |
| snoozed_until | DateTime | No | Reminders | Snoozed until this date; hidden from the daily push list (FR-009). Dismissing today's nudge sets this to the start of the next UTC day — the same field, no separate "dismissed" flag |
| last_reminded_at | DateTime | No | Reminders | When the participant was last nudged (FR-009); set only by an explicit "Mark as nudged" action, not by copying the message |
| reminder_count | Integer | No | Reminders | Per-participant nudge counter for metrics (FR-009, §18) |
| state_changed_at | DateTime | No | System | Timestamp of the last state change (audit, FR-005) |
| state_changed_by | String | No | System | Operator who made the last state change (audit, FR-005) |
| is_accompanying_professor | Boolean | No | Funnel | Marks the required accompanying professor; excluded from the confirmed count (FR-022) |

### Funnel states (`current_state`)

Canonical flow (PRD §6): `Interested → Registered (F1) → Contract sent → Contract signed → Deposit
confirmed → Confirmed → F2 complete → Ready for flights`, plus the terminal `Withdrawn/Declined`.
This feature set (FEAT-001/FEAT-002) sets `Registered (F1)` and `F2 complete`.

## Entity: AgencyDocument

A versioned document received from the agency (itinerary, budget). Manages version chaos (FR-010,
FR-011, FR-012; PRD §9). **Implemented in FEAT-006.**

| Field | Type | Required | Description |
|---|---|---|---|
| id | UUID | Yes | Unique identifier |
| trip_id | UUID | Yes | Trip the document belongs to |
| type | String | Yes | Document type — free text with suggested values ("itinerary", "budget"); not a closed enum, the PRD only gives those as examples |
| version_label | String | Yes | Version label |
| date | Date | Yes | Version date |
| is_current | Boolean | Yes | Whether this is the current version for its type; always `false` at registration — set only by the separate "mark current" action (default false) |
| changelog | String | No | Free-text note of what changed vs. the previous version (FR-012); captured at registration time, no separate later-edit action in v1 |
| file_ref | String | No | Link/URL only — **no real file upload**. Local-first, no cloud storage (ADR-002); the agency keeps its own PDF flow (agency-as-receiver principle) |

- **Exactly one `is_current = true` per (trip, type), always** — enforced atomically by
  `markDocumentCurrent` (`src/lib/agencyDocuments.ts`) via a Prisma `$transaction` that unsets every
  other document of the same (trip, type) and sets the target one, so a concurrent board member never
  observes two currents or zero.

## Entity: PriceTier

An agency price band by group size; drives the live tier resolution (FR-013; PRD §9.1).

| Field | Type | Required | Description |
|---|---|---|---|
| id | UUID | Yes | Unique identifier |
| trip_id | UUID | Yes | Trip the tier belongs to |
| min_size | Integer | Yes | Lower bound (inclusive) |
| max_size | Integer | Yes | Upper bound (inclusive) |
| price | Decimal | Yes | Per-head price for this band |

## Entity: Notice

A piece of distributed content for the confirmed group (FR-014, FR-015; PRD §12.3).

| Field | Type | Required | Description |
|---|---|---|---|
| id | UUID | Yes | Unique identifier |
| trip_id | UUID | Yes | Trip the notice belongs to |
| type | String | Yes | itinerary / notice / payment-reminder |
| content_ref | String | Yes | Link or file with the shareable content |
| published_at | DateTime | No | When it was published |

## Entity: Visit

A company/institution visit target tracked through a pipeline; feeds the agency brief (FR-017,
FR-018; PRD §10).

| Field | Type | Required | Description |
|---|---|---|---|
| id | UUID | Yes | Unique identifier |
| trip_id | UUID | Yes | Trip the visit belongs to |
| target_name | String | Yes | Company or institution name |
| target_type | String | No | company / institution |
| status | String | Yes | Pipeline stage: contact / confirmed / scheduled |
| scheduled_date | Date | No | Day of the visit (set on confirmation) |
| scheduled_time | String | No | Time of the visit (set on confirmation) |
| notes | String | No | Free-text notes |

## Rules

- The `student_id` follows the pattern `A########` (letter `A` + 8 digits).
- `age` must be an integer ≥ 18.
- `privacy_consent` is required and stored with `consent_timestamp`.
- **F1 does not capture sensitive data** (passport scan, full date of birth, medical conditions,
  allergies, diet, official documents, payment/bank data).
- **F2 sensitive data is NOT stored in Solanum.** Only the F2 status fields above are persisted; the
  actual F2 answers/files (passport scan, birth date, medical conditions, diet, etc.) remain in an
  external tool controlled by the organizing team. See `decisions/ADR-001_f2_sensitive_data_not_stored.md`.
- **`confirmed` is derived, never hand-set:** it is true only while `contract_signed` AND
  `deposit_confirmed` are both true (§6.3, FR-005).
- **Dropping ≠ deleting:** a dropped participant is marked `withdrawn` (record retained for funnel
  metrics), not deleted (§6.4).
- Every state change records `state_changed_at` and `state_changed_by` (audit trail, FR-005).
- Reminders store only `last_reminded_at` and `reminder_count` — never the message body (§7.2).
- Exactly one `AgencyDocument.is_current = true` per (trip, type); others are superseded (FR-011).
- `PriceTier` bands are contiguous and non-overlapping; the confirmed count feeding the tier is
  participants **at or past** `Confirmed`, excluding Withdrawn and the accompanying professor
  (FR-013, §9.1). `[PROPOSED — confirm]`
- The agency visit brief (FR-018) is generated from `Visit` records in `confirmed`/`scheduled`
  status; visits still at `contact` are excluded.
- The operational roster (FR-021) is a view of `Participant` restricted to non-sensitive fields
  (names, contact handles); it never exposes F2 sensitive data.
- **Uniqueness key = contact handle** `[PROPOSED — confirm]`: on manual add (FR-004) and import
  (FR-020) a matching key is flagged as a duplicate (FR-025); re-import updates by key (FR-026).
- **Delete ≠ drop:** deletion (FR-024) is for erroneous records only; genuine drops use `withdrawn`
  (§6.4). `trip_id` scopes all funnel/roster/tier queries (multi-trip) `[PROPOSED — confirm]`.
- **Contract-sent gate (FEAT-004, FR-005):** `contract_signed`/`deposit_confirmed` can only be set once
  the participant has reached "Contract sent" (via the board-only `markContractSent` action); setting
  either flag on a pre-contract participant is rejected. The two flags are independent of each other.
  A regression that clears both flags floors at "Contract sent" — it never falls back to a pre-contract
  state once the contract has been sent.
- **Withdrawing keeps historical flags:** `withdrawParticipantRecord` (FEAT-004) does not clear
  `contract_signed`/`deposit_confirmed`/`confirmed` when withdrawing — they remain a historical
  snapshot of how far the participant got. Every "active"/"confirmed count" query elsewhere must
  filter `withdrawn = false` explicitly (relevant to the future FR-013, FR-019).
- **No participant deduplication yet (FR-025, not in FEAT-004 scope):** `addParticipantRecord` does not
  check for an existing participant with the same email/contact handle; duplicate detection is a
  separate, not-yet-built feature.
- **Daily push list exclusion (FEAT-005, FR-008):** the push list excludes `withdrawn` participants
  and any participant currently snoozed (`snoozed_until` in the future); a participant racing both
  the `contract_signed` and `deposit_confirmed` deadlines at once can legitimately appear in both
  transition groups, since the reminder fields are per-participant, not per-transition.
- **No operator attribution for reminders (FEAT-005):** unlike funnel state changes
  (`state_changed_by`), snoozing/nudging/dismissing does not record *who* acted — no acceptance
  criterion in FR-009 requires it, and bolting it onto `state_changed_by` would be semantically wrong
  (that field is tied to funnel-state changes, and reminders never change `current_state`). The
  action still requires an authenticated operator session; only the identity isn't persisted.
- **Reminder message templates are draft copy `[PROPOSED — confirm]`:** the Spanish, informal-respectful
  wording in `src/lib/reminders.ts` is a first pass for the team to review, same treatment as the
  F1/F2 user-facing strings (FEAT-001/002). `{amount}`/`{payment_reference}` are not interpolated —
  Solanum has no price/payment fields yet (FR-013/PriceTier is a separate, not-yet-built feature).
- **F2 eligibility gate (FEAT-002, FR-002):** `markF2Complete` only succeeds from `Contract signed`,
  `Deposit confirmed`, or `Confirmed`; it sets `current_state = "F2 complete"` directly rather than
  through `deriveState`. **Known accepted gap:** `deriveState` has no notion of the F2-complete state
  — if `contract_signed`/`deposit_confirmed` is toggled *after* F2 is marked complete, the participant
  will silently move off "F2 complete." No acceptance criterion covers this ordering; fixing it would
  mean teaching `deriveState` about a state outside its current scope for no tested benefit.

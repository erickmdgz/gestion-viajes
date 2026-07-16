# Data model

## Entity: Trip

A mission/trip whose participants move through the funnel. Holds the per-transition deadlines that
drive overdue detection (FR-003, FR-006). Aligned with PRD §7.1.

| Field | Type | Required | Description |
|---|---|---|---|
| id | UUID | Yes | Unique identifier |
| name | String | Yes | Trip / mission name |
| registration_close | Date | No | Trip-level "registration close" date (deadline source) |
| contract_date | Date | No | Trip-level contract deadline |
| first_payment_date | Date | No | Trip-level first-payment deadline |
| flights_date | Date | No | Trip-level flights/passport deadline |
| grace_period_days | Integer | Yes | Days after a deadline before "overdue"; default 0 `[PROPOSED — confirm]` |
| timezone | String | Yes | Board-local timezone `[PROPOSED — confirm]` |

Per-transition deadlines can be **absolute** (the trip-level dates above) or **relative** (N days
after entering a state), per §7.1; some transitions are board-action only and carry no participant
deadline (e.g. Registered (F1) → Contract sent).

## Entity: Participant

A student moving through the Solanum funnel toward a confirmed trip seat. Fields marked **(F1)** are
captured by the F1 form (FEAT-001); fields marked **(F2 status)** are set when the board records F2
completion (FEAT-002). Aligned with PRD §16.

| Field | Type | Required | Source | Description |
|---|---|---|---|---|
| id | UUID | Yes | System | Unique identifier |
| trip_id | UUID | Yes | System | Trip/mission the participant belongs to |
| email | String | Yes | F1 | Contact email (valid email) |
| first_name | String | Yes | F1 | First name(s) |
| last_name | String | Yes | F1 | Last name(s) |
| full_name | String | Yes | F1 | Full name (may be derived from first/last) |
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
| F2_completed_at | DateTime | No | F2 status | When F2 was marked complete |
| F2_verified_by | String | No | F2 status | Board member who verified F2 (optional audit) |
| F2_verified_at | DateTime | No | F2 status | When F2 was verified (optional audit) |
| contract_signed | Boolean | No | Funnel | Flag set by the board (FR-005) |
| deposit_confirmed | Boolean | No | Funnel | Flag set by the board (FR-005) |
| confirmed | Boolean | No | Derived | Auto-derived: `contract_signed` AND `deposit_confirmed` (§6.3, FR-005) |
| withdrawn | Boolean | No | Funnel | Terminal Withdrawn/Declined flag (§6.4) |
| drop_reason | String | No | Funnel | Optional free-text drop reason (§6.4) |
| snoozed_until | DateTime | No | Reminders | Snoozed until this date; hidden from the daily push list (FR-009) |
| last_reminded_at | DateTime | No | Reminders | When the participant was last nudged (FR-009) |
| reminder_count | Integer | No | Reminders | Per-participant nudge counter for metrics (FR-009, §18) |
| state_changed_at | DateTime | No | System | Timestamp of the last state change (audit, FR-005) |
| state_changed_by | String | No | System | Operator who made the last state change (audit, FR-005) |

### Funnel states (`current_state`)

Canonical flow (PRD §6): `Interested → Registered (F1) → Contract sent → Contract signed → Deposit
confirmed → Confirmed → F2 complete → Ready for flights`, plus the terminal `Withdrawn/Declined`.
This feature set (FEAT-001/FEAT-002) sets `Registered (F1)` and `F2 complete`.

## Entity: AgencyDocument

A versioned document received from the agency (itinerary, budget). Manages version chaos (FR-010,
FR-011, FR-012; PRD §9).

| Field | Type | Required | Description |
|---|---|---|---|
| id | UUID | Yes | Unique identifier |
| trip_id | UUID | Yes | Trip the document belongs to |
| type | String | Yes | Document type (e.g. itinerary, budget) |
| version_label | String | Yes | Version label |
| date | Date | Yes | Version date |
| is_current | Boolean | Yes | Whether this is the current version for its type (default false) |
| changelog | String | No | Free-text note of what changed vs. the previous version (FR-012) |
| file_ref | String | No | Link or file reference to the document |

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

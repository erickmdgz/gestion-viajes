# Data model

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

### Funnel states (`current_state`)

Canonical flow (PRD §6): `Interested → Registered (F1) → Contract sent → Contract signed → Deposit
confirmed → Confirmed → F2 complete → Ready for flights`, plus the terminal `Withdrawn/Declined`.
This feature set (FEAT-001/FEAT-002) sets `Registered (F1)` and `F2 complete`.

## Rules

- The `student_id` follows the pattern `A########` (letter `A` + 8 digits).
- `age` must be an integer ≥ 18.
- `privacy_consent` is required and stored with `consent_timestamp`.
- **F1 does not capture sensitive data** (passport scan, full date of birth, medical conditions,
  allergies, diet, official documents, payment/bank data).
- **F2 sensitive data is NOT stored in Solanum.** Only the F2 status fields above are persisted; the
  actual F2 answers/files (passport scan, birth date, medical conditions, diet, etc.) remain in an
  external tool controlled by the organizing team. See `decisions/ADR-001_f2_sensitive_data_not_stored.md`.

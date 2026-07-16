# FEAT-002 - F2 general information tracking

## 1. Summary

Handle the **F2 (general information / post-confirmation) form** as a **status tracker**. F2 collects
the operational — and potentially **sensitive** — information needed for confirmed participants, but
Solanum **only records whether F2 was completed**, never the sensitive answers. Completing F2 moves
the participant to the `F2 complete` state.

## 2. Problem or need

Confirmed participants must provide logistics data (passport, birth date, medical/diet info) for the
trip. Storing that inside Solanum would turn a lightweight funnel tracker into a sensitive-data
repository, creating privacy and legal exposure (LFPDPPP — see PRD §14). The board still needs to
**know who has completed F2**. FEAT-002 solves the tracking need while keeping the sensitive data out
of Solanum.

## 3. Affected user

- **Participant** (confirmed) — fills out F2 in an external tool (Google Forms/Drive).
- **Exec board** — verifies completion and marks the F2 status in Solanum.

## 4. Related requirements

- FR-002 — F2 completion status tracking (status-only).

## 5. Expected flow

1. A confirmed participant fills out F2 in the external tool (outside Solanum).
2. The exec board verifies the submission.
3. The board marks F2 as completed for that participant in Solanum.
4. Solanum persists only the status flags and sets `current_state = "F2 complete"`. The participant
   can then advance to `Ready for flights`.

## 6. Acceptance criteria

Acceptance criteria are defined in **FR-002** (`docs_en/03_requirements.md`), not here:

- FR-002 → criteria in `docs_en/03_requirements.md`.

## 7. Business rules

Business rules live in the FR (`docs_en/03_requirements.md`). Reference:

- FR-002.

Key rules:

- F2 should be sent when the participant is in `Contract signed`, `Deposit confirmed`, or (cleanest)
  `Confirmed`.
- **Solanum must not store F2 sensitive data** — it acts as a tracker, not a repository. This is
  recorded as a technical decision in **ADR-001**.

## 8. Proposed technical design

> **Language note:** field/question **metadata** (type, required, validation) is in English; the
> **user-facing strings** a participant reads are kept **in Spanish (ES)**. Marked `user-facing (ES)`.

### When F2 is sent

Send F2 when the participant is in one of: `Contract signed`, `Deposit confirmed`, `Confirmed`. The
cleanest option is after `Confirmed` (contract signed AND deposit confirmed).

### Frontend (external form definition — NOT hosted by Solanum)

The F2 form (external Google Forms in v1) has the following questions:

| # | Field (EN metadata) | Question label — user-facing (ES) | Type | Required | Notes |
|---|---|---|---|---|---|
| 1 | email | Correo electrónico | Short answer | Yes | Valid email |
| 2 | full_name | Nombre completo | Short answer | Yes | — |
| 3 | birth_date | Fecha de nacimiento | Date | Yes | DD/MM/YYYY. **Sensitive — not stored in Solanum** |
| 4 | age | Edad | Number | Yes | Integer ≥ 18 |
| 5 | nationality | Nacionalidad | Short answer | Yes | — |
| 6 | visa_status | ¿Tienes visa de Estados Unidos? | Multiple choice | Yes | Sí / No / En proceso / No aplica |
| 7 | passport_file | Pasaporte escaneado | File upload | Yes | PDF `Nombre_Apellido_Pasaporte.pdf`. **Sensitive — not stored in Solanum** |
| 8 | career | Carrera | Short answer | Yes | — |
| 9 | semester | Semestre | Dropdown | Yes | 0º, 2º, 4º, 6º, 8º, Otro |
| 10 | phone | Número de teléfono | Short answer | Yes | Format `55########` |
| 11 | medical_condition | ¿Tienes alguna condición médica? | Paragraph | Yes | "No" if none. **Sensitive — not stored in Solanum** |
| 12 | diet | ¿Sigues una dieta vegetariana, vegana o especial? | Multiple choice | Yes | No / Vegetariana / Vegana / Otra. **Sensitive — not stored in Solanum** |
| 13 | diet_other | Si seleccionaste "Otra", especifica tu dieta o restricción | Paragraph | No | **Sensitive — not stored in Solanum** |
| 14 | preferred_name | ¿Cómo te gusta que te digan? | Short answer | No | — |
| 15 | instagram | Instagram | Short answer | No | — |
| 16 | operational_consent | (checkbox, see text below) | Checkbox | Yes | Must be checked |

**Intro text — user-facing (ES):**

> Registro de información general para participantes confirmados. La información solicitada en este
> formulario será utilizada únicamente para fines logísticos, operativos y de coordinación
> relacionados con la misión internacional. Algunos datos solicitados pueden ser sensibles. Por
> seguridad, esta información no será almacenada dentro de Solanum. El sistema únicamente registrará
> si este formulario fue completado o no.

**Short privacy notice — user-facing (ES):**

> La información proporcionada en este formulario será utilizada exclusivamente para la planeación
> logística y operativa de la misión internacional. Los datos podrán ser revisados por el equipo
> organizador y, cuando sea estrictamente necesario para la operación del viaje, compartidos con
> terceros involucrados en la logística del programa. Al enviar este formulario, confirmas que la
> información proporcionada es correcta y autorizas su uso para los fines descritos.

**Consent checkbox text (field 16) — user-facing (ES):**

> Acepto que la información proporcionada en este formulario sea utilizada únicamente para fines
> logísticos, operativos y de coordinación relacionados con la misión internacional.

### Backend / logic (Solanum side)

- Solanum exposes an action for the board to **mark F2 as completed** for a participant.
- On that action: set the status flags and the funnel state; do **not** ingest form answers.

### Database

Fields Solanum **stores** from F2 (see `docs_en/07_data_model.md`, entity `Participant`):

```yaml
participant:
  F2_complete: true
  F2_completed_at: ""
  current_state: "F2 complete"
  # optional audit
  F2_verified_by: ""
  F2_verified_at: ""
```

Fields Solanum **must NOT store** from F2: passport scan, birth date, medical conditions, allergies,
medical treatments, diet/food restrictions, personal documents, any additional sensitive information.
These stay in the external tool (Google Forms/Drive) controlled by the organizing team.

### Security / privacy

- Sensitive data never enters Solanum (see **ADR-001**). Solanum is a process tracker only.
- Only completion status and optional audit metadata are persisted.

## 9. Required tests

| ID | Test | Type |
|---|---|---|
| TC-004 | Marking a confirmed participant's F2 as complete sets `F2_complete = true`, `F2_completed_at` and `current_state = "F2 complete"` | Functional |
| TC-005 | Solanum does not persist any F2 sensitive field (passport, birth date, medical, diet) | Security / privacy |

## 10. Documentation impact

- [x] Update requirements (`03_requirements.md` — FR-002).
- [x] Update backlog (`05_backlog.md`).
- [x] Update data model (`07_data_model.md`).
- [x] Update test plan (`08_test_plan.md`).
- [x] New ADR (`decisions/ADR-001_f2_sensitive_data_not_stored.md`).
- [x] Feature doc (this file).
- [ ] API spec — not applicable (no endpoints in v1 yet).
- [ ] Release notes — on release to `main`.

## 11. Checklist before implementing

- [x] The feature has a clear objective.
- [x] It is linked to requirements (FR-002).
- [x] It has acceptance criteria (in FR-002).
- [x] It has defined tests (TC-004, TC-005).
- [x] The technical impact is understood.
- [x] The user impact is understood.

## 12. Checklist before closing

- [ ] Implemented.
- [ ] Tests executed.
- [ ] Acceptance criteria met.
- [ ] Pull request reviewed.
- [ ] Documentation updated.
- [ ] Release notes updated.

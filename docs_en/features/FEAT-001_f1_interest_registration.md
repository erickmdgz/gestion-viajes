# FEAT-001 - F1 interest registration form

## 1. Summary

Build the **F1 (interest / initial capture) form** that registers a student who is interested in
the international mission into Solanum's funnel. Submitting F1 creates a `participant` record with
**operational, non-sensitive** data and moves the participant to the `Registered (F1)` state.

## 2. Problem or need

Today the exec board (mesa directiva) captures interested students by hand across WhatsApp and
spreadsheets, with no single source of truth. F1 gives the board a structured, consented intake that
feeds the participant database and enables follow-up, without ever handling sensitive data.

## 3. Affected user

- **Participant** (student) — fills out and submits F1.
- **Exec board** — consumes the resulting funnel entry for follow-up.

## 4. Related requirements

- FR-001 — Participant registration via F1 intake form.

## 5. Expected flow

1. The participant opens the F1 form and reads the program information and privacy notice.
2. The participant fills in the required operational fields and gives explicit data-use consent.
3. The system validates the input (required fields and formats).
4. On success, the system creates the `participant` record, sets
   `current_state = "Registered (F1)"`, stores the consent flags and a `consent_timestamp`, and the
   participant becomes available for follow-up in Solanum.

## 6. Acceptance criteria

Acceptance criteria are defined in **FR-001** (`docs_en/03_requirements.md`), not here. This FEAT
only references them:

- FR-001 → criteria in `docs_en/03_requirements.md`.

## 7. Business rules

Business rules live in the FR (`docs_en/03_requirements.md`). Reference:

- FR-001.

Key rule: **F1 must not collect or store sensitive data** (passport scans, full date of birth,
medical conditions, allergies, diet, official documents, payment/bank data). Those belong to F2 or to
external processes (see FEAT-002 and ADR-001).

## 8. Proposed technical design

> **Implementation note (as built):** this is a **native Solanum page** at `/apply/[tripId]`
> (public, no session), not a Google Form — the "(e.g. Google Forms in v1)" framing below predates
> the decision to build it natively. FR-001 requires the system to create the participant record
> synchronously on submit, which only a Solanum-hosted form satisfies without a separate
> import/sync step (that would be FR-020, a different, not-yet-built feature). The "program
> information" block (destination, price, seats, etc.) described below is **not rendered**: `Trip`
> has no such fields and no acceptance criterion requires it — the live page shows only `trip.name`
> and the form. `full_name` is not a stored column; it is concatenated from `first_name`/`last_name`
> wherever displayed, per this doc's own note below. See `docs_en/07_data_model.md` and
> `docs_en/06_api.md` for the resulting schema/action list.

> **Language note:** field/question **metadata** below (type, required, validation) is documentation
> and is written in English. The **user-facing strings** a participant reads — question labels, intro
> text, privacy notice, checkbox text — are kept **in Spanish (ES)** because the pilot population is
> Tec de Monterrey students. They are marked `user-facing (ES)`.

### Program information (shown at the top of the form)

Display before the questions: mission name, destination, program dates, available seats, target
audience, total investment, application deadline, first payment required, payment schedule, what is
included, what is not included, responsible organizing team.

### Frontend (form definition)

The F1 form (e.g. Google Forms in v1) has the following questions:

| # | Field (EN metadata) | Question label — user-facing (ES) | Type | Required | Validation |
|---|---|---|---|---|---|
| 1 | email | Correo electrónico | Short answer | Yes | Valid email |
| 2 | first_name | Nombre(s) | Short answer | Yes | — |
| 3 | last_name | Apellido(s) | Short answer | Yes | — |
| 4 | full_name | Nombre completo | Short answer | Yes | May be dropped if the system concatenates first/last name |
| 5 | preferred_name | ¿Cómo te gusta que te digan? | Short answer | No | — |
| 6 | student_id | Matrícula | Short answer | Yes | Starts with `A` + 8 digits (`A########`) |
| 7 | age | Edad | Number | Yes | Integer ≥ 18 |
| 8 | career | Carrera | Short answer | Yes | — |
| 9 | semester | Semestre actual | Dropdown | Yes | One of: 0º, 2º, 4º, 6º, 8º, Otro |
| 10 | phone | Número de teléfono | Short answer | Yes | Format `55########`, no extension |
| 11 | instagram | Instagram | Short answer | No | — |
| 12 | nationality | Nacionalidad | Short answer | Yes | — |
| 13 | passport_status | ¿Tu pasaporte tiene vigencia suficiente para el viaje? | Multiple choice | Yes | One of: Sí / No / No tengo pasaporte todavía / En proceso de renovación. **Status only — no file/image** |
| 14 | visa_status | ¿Tienes visa de Estados Unidos o puedes entrar a EE. UU. por otro medio? | Multiple choice | Yes | One of: Sí / No / En proceso / No aplica |
| 15 | whatsapp_group_consent | ¿Estás de acuerdo en ser agregado al grupo de WhatsApp de primera fase? | Multiple choice | Yes | Sí / No |
| 16 | privacy_consent | (checkbox, see text below) | Checkbox | Yes | Must be checked |

**Intro text — user-facing (ES):**

> Registro de interés para la misión internacional. Completa este formulario si deseas recibir
> información detallada y comenzar tu proceso de aplicación. Este formulario no confirma tu lugar en
> la misión. La confirmación dependerá del cumplimiento de los siguientes pasos del proceso: revisión
> de información, firma de contrato, pago inicial y entrega de información complementaria cuando sea
> solicitada.

**Short privacy notice — user-facing (ES):**

> Los datos recopilados en este formulario serán utilizados únicamente para dar seguimiento a tu
> interés, coordinar tu proceso de inscripción y compartir información relacionada con la misión
> internacional. La información será tratada por el equipo organizador responsable del programa y no
> será compartida con terceros, salvo cuando sea necesario para fines logísticos relacionados con la
> misión. Al enviar este formulario, aceptas que tus datos sean utilizados para estos fines.

**Consent checkbox text (field 16) — user-facing (ES):**

> Acepto que mis datos sean utilizados por el equipo organizador para dar seguimiento a mi proceso de
> inscripción, compartir información sobre la misión y coordinar los siguientes pasos del programa.

### Backend / logic

- On submit: validate required fields and formats (fields 1, 6, 7, 10 have explicit validation).
- Create the `participant` record and set the funnel state to `Registered (F1)`.
- Persist consent flags (`privacy_consent`, `whatsapp_group_consent`) and `consent_timestamp`.

### Database

Fields Solanum **stores** from F1 (see `docs_en/07_data_model.md`, entity `Participant`):

```yaml
participant:
  id: ""
  trip_id: ""
  email: ""
  first_name: ""
  last_name: ""
  full_name: ""
  preferred_name: ""
  student_id: ""
  age: ""
  career: ""
  semester: ""
  phone: ""
  instagram: ""
  nationality: ""
  passport_status: ""
  visa_status: ""
  whatsapp_group_consent: true
  privacy_consent: true
  consent_timestamp: ""
  current_state: "Registered (F1)"
  created_at: ""
```

Fields F1 **must NOT ask for or store**: passport scan, full date of birth, medical conditions,
allergies, diet, official documents, payment info, payment receipts, bank data, detailed medical
information. These belong to F2 or to later external processes.

### Security / privacy

- Explicit consent is mandatory (field 16) and recorded with a timestamp.
- No sensitive data is captured in F1 (privacy-by-design; see ADR-001 for the sensitive-data policy
  applied to F2).

## 9. Required tests

| ID | Test | Type |
|---|---|---|
| TC-001 | A valid F1 submission creates the participant with `current_state = "Registered (F1)"`, consent flags and timestamp | Functional |
| TC-002 | A submission missing a required field is rejected and the missing field is flagged | Validation |
| TC-003 | Invalid formats (student_id not `A########`, age < 18, invalid email) are rejected with the field flagged | Validation |

## 10. Documentation impact

- [x] Update requirements (`03_requirements.md` — FR-001).
- [x] Update backlog (`05_backlog.md`).
- [x] Update data model (`07_data_model.md`).
- [x] Update test plan (`08_test_plan.md`).
- [x] Feature doc (this file).
- [x] Update API doc (`06_api.md` — `registerParticipant` Server Action).
- [ ] Release notes — on release to `main`.

## 11. Checklist before implementing

- [x] The feature has a clear objective.
- [x] It is linked to requirements (FR-001).
- [x] It has acceptance criteria (in FR-001).
- [x] It has defined tests (TC-001..TC-003).
- [x] The technical impact is understood.
- [x] The user impact is understood.

## 12. Checklist before closing

- [x] Implemented.
- [x] Tests executed (`npm run test` — 54/54 passing; manual end-to-end pass against the running app).
- [x] Acceptance criteria met (TC-001..TC-003).
- [ ] Pull request reviewed.
- [x] Documentation updated.
- [ ] Release notes updated.

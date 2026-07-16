# ADR-001 - Solanum stores F2 completion status only, not sensitive data

## Status

Accepted.

## Context

The F2 form (see FEAT-002) collects operational and **potentially sensitive** participant data for
confirmed participants: passport scans, full date of birth, medical conditions, allergies, medical
treatments, and dietary restrictions. Solanum's purpose (PRD §2, §5) is to be a lightweight **funnel
tracker** for a volunteer student exec board — not a records system. Storing sensitive personal data
inside Solanum would expand its scope, its attack surface, and its legal exposure under Mexican data
protection law (LFPDPPP; see PRD §14), for little operational benefit: the board only needs to know
**who has completed F2**, not to hold the answers.

## Decision

Solanum will **only store the F2 completion status** (`F2_complete`, `F2_completed_at`,
`current_state = "F2 complete"`, plus optional audit fields `F2_verified_by` / `F2_verified_at`). The
actual F2 answers and files remain **outside Solanum**, in an external tool controlled by the
organizing team (e.g. Google Forms / Google Drive). Solanum acts as a **process tracker, not a
repository** of sensitive data.

## Alternatives considered

1. **Store all F2 data in Solanum.** Rejected: maximum privacy/legal exposure, larger scope, against
   the product's "tracker not repository" principle.
2. **Store only completion status in Solanum; keep sensitive data external.** *(Chosen.)* Meets the
   operational need with minimal data footprint.
3. **Encrypt and store F2 data in Solanum.** Rejected for v1: adds key-management and compliance
   complexity that the operational need (knowing completion) does not justify.

## Positive consequences

- Minimal sensitive-data footprint; smaller privacy/legal exposure (aligns with PRD §14 / LFPDPPP).
- Keeps Solanum's scope focused on funnel tracking.
- Simpler v1 with no sensitive-data storage, encryption, or retention machinery to build.

## Negative consequences

- Sensitive data lives in an external tool, so completion depends on the board verifying it manually.
- Solanum cannot report on F2 contents (only on completion status).

## Date

2026-07-15.

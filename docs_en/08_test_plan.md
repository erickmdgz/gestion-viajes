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

# FEAT-010 - Generate promotional content ideas and image prompts

## 1. Summary

Let the board open a page and get a handful of draft social-media content ideas (captions) and
matching image prompts for a trip — no external AI call, purely local templates.

## 2. Problem or need

The board needs promotional material to recruit participants but has no structured starting point.
FR-016 asks Solanum to generate draft ideas for the board to review — never final material
(human-in-the-loop, never-sends principle, same as FR-007's reminder messages).

## 3. Affected user

- **Exec board** — opens the page, copies whichever ideas/prompts it wants to use or adapt.

## 4. Related requirements

- FR-016 — Generate promotional content ideas and image prompts.

## 5. Expected flow

1. The board opens a trip's "Promo ideas" page.
2. The page shows ~5 draft ideas, each with a Spanish caption and an English image prompt (for
   pasting into a text-to-image tool), with copy buttons for both.
3. The board reviews, edits, and decides what to actually post — Solanum never publishes or sends
   anything on its own.

## 6. Acceptance criteria

Acceptance criteria are defined in **FR-016** (`docs_en/03_requirements.md`), not here.

## 7. Business rules

FR-016's own business rule ("output is a draft proposal; a human decides and produces the final
material") is satisfied by construction — there is no publish/send action anywhere in this FEAT.
Design decisions made explicit for traceability:

- **Local, deterministic templates — no LLM API call.** Confirmed this session: no new dependency, no
  secret to manage, no network call, no cost, consistent with `reminders.ts`'s message templates
  (FEAT-005). Trade-off: output is more formulaic than a real LLM would produce.
- **No persistence.** "Requesting content" is just viewing the page — same "computed on demand"
  principle as overdue flagging (FR-006) and price-tier resolution (FR-013).
- **Caption in Spanish, image prompt in English.** The caption is the actual social-copy deliverable
  (same audience as F1's user-facing strings); the image prompt follows the conventional
  lingua-franca of text-to-image tools regardless of the target audience's language.
- **Draft copy is `[PROPOSED — confirm]`** — same treatment as FEAT-005's reminder templates, a first
  pass for the team to edit.
- **Keyed only off `Trip.name` and `Trip.registrationClose`** — `Trip` has no destination/dates-range
  fields (FEAT-001's "program information" scope trim), so templates can't reference more than that.

## 8. Proposed technical design

### Frontend

`src/app/dashboard/trips/[tripId]/promo/page.tsx` (Server Component, no action): calls
`generatePromoIdeas(trip.name, trip.registrationClose)`, renders each idea as a card with the caption,
image prompt, and the existing generic `CopyButton` (`push/copy-button.tsx`, reused for both). Linked
from the roster page ("Promo ideas →").

### Backend

`src/lib/promo.ts` (pure, no Prisma import, same convention as `funnel.ts`/`reminders.ts`): a fixed
set of ~5 "angles" (countdown/urgency, teamwork/experience, behind-the-scenes, testimonial,
FOMO/scarcity), each a small template returning a caption + an image prompt.

### Database

None — no schema change, no migration.

### Security

The page is board-only, behind `/dashboard` (`requireOperator()` via the existing session check —
no participant-facing surface, no new data collected).

## 9. Required tests

| ID | Test | Type |
|---|---|---|
| TC-034 | Requesting content generates draft content ideas and image prompts | Functional |

Automated: `src/lib/promo.test.ts` (pure) — multiple distinct angles, every caption/image prompt
interpolates the trip name, deterministic output, and the urgency angle correctly reflects (or
gracefully omits) the registration deadline. Manual: opened the page for a real trip and confirmed 5
distinct ideas render with working copy buttons.

## 10. Documentation impact

- [x] Update architecture (`02_architecture.md`).
- [x] Update API doc (`06_api.md`).
- [x] Update backlog (`05_backlog.md`).
- [x] Update data model (`07_data_model.md`).
- [x] Update test plan (`08_test_plan.md`).
- [x] Feature doc (this file).
- [ ] Release notes — on release to `main`.

## 11. Checklist before implementing

- [x] The feature has a clear objective.
- [x] It is linked to requirements (FR-016).
- [x] It has acceptance criteria (in the FR).
- [x] It has defined tests (TC-034).
- [x] The technical impact is understood.
- [x] The user impact is understood.

## 12. Checklist before closing

- [x] Implemented.
- [x] Tests executed (`npm run test` — 79/79 passing; manual pass against the running app).
- [x] Acceptance criteria met.
- [ ] Pull request reviewed.
- [x] Documentation updated.
- [ ] Release notes updated.

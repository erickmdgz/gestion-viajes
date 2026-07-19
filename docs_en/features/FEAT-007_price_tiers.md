# FEAT-007 - Live price tier by confirmed group size

## 1. Summary

Let the board define price bands by confirmed group size and show, live, which band the current
confirmed count falls into.

## 2. Problem or need

The agency prices the trip per head, in bands that shift as more participants confirm (e.g. 10–19
people at one price, 20–29 at a lower per-head price). Without a live view, the board has to
manually recompute which band applies every time someone confirms or drops.

## 3. Affected user

- **Exec board** — defines the tiers, sees which one currently applies.

## 4. Related requirements

- FR-013 — Live price tier by confirmed group size.

## 5. Expected flow

1. The board defines one or more price tiers for a trip: a size range and a price.
2. As participants advance to `Confirmed` (or later, still counting), the pricing page shows the
   current confirmed count and the tier it falls into.
3. If the count is below every defined tier's minimum, the page shows "No tier — below minimum"
   rather than guessing.

## 6. Acceptance criteria

Acceptance criteria are defined in **FR-013** (`docs_en/03_requirements.md`), not here.

## 7. Business rules

Business rules live in the FR. Key rules and how this FEAT resolves the FR's `[PROPOSED — confirm]`
tags:

- **Confirmed count is cumulative**, not `current_state == "Confirmed"` — a participant who advanced
  to `F2 complete` still counts. `Participant.confirmed` already behaves this way (FEAT-002's
  `markF2Complete` never clears it); withdrawn participants are excluded even if `confirmed` is still
  `true` (a historical flag, per FEAT-004).
- **Boundary inclusivity is `min ≤ count ≤ max`.**
- **No overlap/contiguity validation on tier creation** — the board is trusted to enter sane bands.
- **Accompanying-professor exclusion is a known v1 gap**, tied to `is_accompanying_professor`
  (FR-022, not yet built). The count currently includes everyone confirmed. Same treatment as
  FEAT-004's TC-015 — documented, not silently dropped.
- **`price` is a plain Integer, not Decimal** — Solanum does not process money (product vision); this
  is a display-only figure, whole currency units, no cents.

## 8. Proposed technical design

### Frontend

`src/app/dashboard/trips/[tripId]/pricing/page.tsx` (Server Component): confirmed count, the resolved
tier (or "No tier — below minimum"), a table of all defined tiers with a CURRENT badge, and an
"Add tier" form. Linked from the roster page ("Pricing →").

### Backend

`addPriceTier` Server Action (`.../pricing/actions.ts`, zod-validated inline like `createTrip`).
Pure resolution logic in `src/lib/priceTiers.ts`: `countConfirmedParticipants`, `resolvePriceTier`.
Persistence added to `src/lib/trips.ts`: `createPriceTierRecord`, `listPriceTiersForTrip` (price
tiers are trip-scoped data, same rationale that put `getTripById` there).

### Database

New `PriceTier` model (`id`, `tripId`, `minSize`, `maxSize`, `price`), migrated with
`prisma migrate dev --name feat007_price_tiers`.

### Security

Every action requires an operator session via `requireOperator()`. No new participant-facing surface.

## 9. Required tests

| ID | Test | Type |
|---|---|---|
| TC-028 | Tier stays the same as the count moves within its band | Functional |
| TC-029 | Tier re-resolves to the lower band when the count drops below the boundary | Functional |
| TC-030 | Count below the smallest tier shows "no tier," not a guess | Functional |

Automated: `src/lib/priceTiers.test.ts` (pure, no DB setup) covers TC-028/029/030 plus the
withdrawn-exclusion case; `src/lib/trips.test.ts` covers `createPriceTierRecord`/
`listPriceTiersForTrip` persistence. Manual: confirmed 20→21→19→9 participants against the running
dev server and watched the pricing page track [20–29] → [20–29] → [10–19] → "No tier — below
minimum" correctly at each step.

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
- [x] It is linked to requirements (FR-013).
- [x] It has acceptance criteria (in the FR).
- [x] It has defined tests (TC-028..TC-030).
- [x] The technical impact is understood.
- [x] The user impact is understood.

## 12. Checklist before closing

- [x] Implemented.
- [x] Tests executed (`npm run test` — 67/67 passing; manual end-to-end pass against the running app).
- [x] Acceptance criteria met.
- [ ] Pull request reviewed.
- [x] Documentation updated.
- [ ] Release notes updated.

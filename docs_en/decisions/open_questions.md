# Open questions register

> These are the unresolved questions/dependencies from the PRD (`PRD Solanum v1.1 (improved).md`, §21).
> They are **not decisions** (those live in the `ADR-XXX` files); they are items the team must close.
> Owner/due are placeholders (`[assign]`/`[date]`) exactly as in the PRD — not invented here.

## Blocks the v1 build / pilot (close in Phase 0)

| ID | Question | Owner | Due | Status | Tracking |
|---|---|---|---|---|---|
| O-1 | Real funnel numbers **and effort/time** from LEAD's last mission (interested→confirmed, # reminders, chase-time). Sets the pilot baseline; close by pulling from existing forms/chats. | [assign] | [date] | Open | #27 |
| O-2 | How the participant contract is issued, under what legal personality, and how it's signed today. Determines whether "contract signed" is auto-registerable or a manual check; feeds §14 liability. | [assign] | [date] | Open | #28 |

## Blocks future scope (not v1)

| ID | Question | Owner | Due | Status | Tracking |
|---|---|---|---|---|---|
| O-3 | Tec's administrative & data requirements for a student trip; whether sensitive data can ever come inside. | [assign] | [date] | Open | not yet |
| O-4 | Which regulation mandates the accompanying professor and what else it requires (insurance, waivers, ratios). | [assign] | [date] | Open | not yet |
| O-5 | Whether the agency would accept a structured intake or its PDF flow is non-negotiable. | [assign] | [date] | Open | not yet |
| O-6 | Whether the Tec already has or plans an internal system for this (build-vs-buy). | [assign] | [date] | Open | not yet |

## What each question unblocks

- **O-1** → the primary success metric / pilot baseline (PRD §18).
- **O-2** → whether FR-005 can auto-register "contract signed"; §14 liability (a launch blocker, §22).
- **O-3** → whether sensitive data could ever be stored (would revisit ADR-001).
- **O-4** → the institutional-compliance scope (F-21, Won't v1).
- **O-5** → FR-014 structured intake for the agency (F-14, currently deferred).
- **O-6** → build-vs-buy positioning (PRD §22 risk on differentiation).

## Standing note

The `[PROPOSED — confirm]`-tagged defaults throughout the requirements (grace period, timezone,
reminder cadence, form factor, retention window, uniqueness key, tier inclusivity, concurrency model,
hosting ceiling) and the **adults-only population assumption** are placeholders chosen to unblock the
work; the team must confirm or overwrite them before Phase 1 (PRD §23).

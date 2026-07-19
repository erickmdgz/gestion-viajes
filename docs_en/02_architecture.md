# System architecture

## Overview

Solanum is a **push-based participant funnel tracker** for a student exec board (mesa directiva). It
gives the board a single view of where each participant is in the funnel and which transition is
overdue, and it drafts reminder messages — but a **human always sends and decides** (human-in-the-loop,
never auto-sends). Only **operators** (the board) log in; **participants do not** (NF-2).

In this phase the system is **local-first**: it runs entirely on a laptop (`npm run dev`) with no
cloud services, so the idea can be validated before any deployment. See
`decisions/ADR-002_technology_stack.md`.

## Technology stack

- **Frontend:** Next.js (App Router) + React + TypeScript, mobile-first responsive (NF-11).
- **Backend:** Next.js API routes (TypeScript).
- **ORM:** Prisma.
- **Database:** SQLite locally (`file:./dev.db`); the Prisma schema is kept Postgres-compatible so the
  database can be migrated to a hosted Postgres later.
- **Authentication:** Auth.js (NextAuth) for exec-board / operator accounts (NF-8).
- **Hosting:** local for now (`npm run dev`); cloud deploy is deferred to a future ADR.
- **Repository:** github.com/erickmdgz/gestion-viajes.

## General diagram

Operator (mobile) → Next.js (UI + API routes) → Prisma → SQLite

The daily push list and the overdue-transition flags are **computed on demand** when the operator
opens the view; a background scheduler is deferred to the deploy phase.

## Project structure

Implemented in FEAT-003 (baseline), FEAT-004 (funnel core), FEAT-005 (reminders), FEAT-001 (F1
public intake), FEAT-006 (agency document layer), FEAT-007 (live price tier), FEAT-008 (publish
itinerary), FEAT-009 (publish notices) and FEAT-011 (visit tracking):

```txt
prisma/          # schema.prisma (Operator, Trip, Participant) + migrations/ + seed.ts
src/
  app/
    apply/[tripId]/page.tsx        # public F1 intake form, no session (FEAT-001)
    apply/[tripId]/actions.ts      # "use server" registerParticipant
    apply/[tripId]/thanks/page.tsx # static confirmation
    dashboard/
      page.tsx                       # trip list (FEAT-004)
      trips/new/page.tsx             # create-trip form
      trips/actions.ts               # "use server" createTrip
      trips/[tripId]/page.tsx        # roster: state, overdue flag, transition + F2 controls (FEAT-002)
      trips/[tripId]/actions.ts      # "use server" addParticipant, withdrawParticipant
      trips/[tripId]/push/page.tsx   # daily push list: message, copy, nudge/snooze/dismiss (FEAT-005)
      trips/[tripId]/push/actions.ts # "use server" recordNudge, snoozeParticipant, dismissParticipantToday
      trips/[tripId]/push/copy-button.tsx # "use client" — clipboard only, no business logic
      trips/[tripId]/documents/page.tsx   # agency document versions by type, mark current (FEAT-006)
      trips/[tripId]/documents/actions.ts # "use server" addDocument, markCurrent, publishItinerary
      trips/[tripId]/pricing/page.tsx     # live price tier by confirmed count (FEAT-007)
      trips/[tripId]/pricing/actions.ts   # "use server" addPriceTier
      trips/[tripId]/notices/page.tsx     # compose + list published notices/payment-reminders (FEAT-009)
      trips/[tripId]/notices/actions.ts   # "use server" publishNoticeAction
      trips/[tripId]/visits/page.tsx      # visit pipeline: contact/confirmed/scheduled (FEAT-011)
      trips/[tripId]/visits/actions.ts    # "use server" addVisit, confirmVisit, scheduleVisitAction
    share/[tripId]/itinerary/page.tsx     # public, no session — live-resolves the current itinerary (FEAT-008)
    share/[tripId]/notices/page.tsx       # public, no session — lists published notices, most recent first (FEAT-009)
    api/auth/[...nextauth]/       # Auth.js route handler
    login/, page.tsx              # FEAT-003
  lib/
    prisma.ts     # client singleton
    auth.ts       # Auth.js config
    authz.ts      # requireOperator() — auth check reused by every action (FEAT-004)
    funnel.ts       # pure state machine + overdue math (FR-005/FR-006)
    reminders.ts     # pure push-list grouping/sorting + message templates (FR-007/008/009)
    f1Registration.ts # pure zod schema + validator for the public F1 form (FR-001)
    trips.ts       # Trip reads/writes
    participants.ts # Participant reads/writes, wraps funnel.ts, reminders.ts and f1Registration.ts
    agencyDocuments.ts # AgencyDocument reads/writes; markDocumentCurrent's $transaction enforces
                        # exactly one is_current per (trip, type) (FR-011)
    priceTiers.ts       # pure tier resolution + confirmed-count math (FR-013)
    notices.ts           # Notice reads/writes; resolvePublishedItineraryFileRef is the live lookup
                          # the public share page resolves against on every visit (FR-014).
                          # publishNotice/listPublishedNotices implement the FR-015 feed (FEAT-009)
    visits.ts             # Visit reads/writes; markVisitConfirmed/scheduleVisit gate the pipeline
                          # (FR-017), same pattern as the pre-contract/F2-eligibility gates
  middleware.ts  # route protection (redirects unauthenticated /dashboard* to /login)
docs_en/         # living product documentation
```

Mutations (create trip, add/withdraw participant, toggle a transition flag, record a nudge,
snooze/dismiss) go through **Next.js Server Actions**, not REST API routes — see `06_api.md`. Every
**board-facing** action calls `requireOperator()` first (auth required on every action, not just the
page shell). The deliberate exceptions are `registerParticipant` (FEAT-001, FR-001) and the read-only
`/share/[tripId]/itinerary` (FEAT-008, FR-014) and `/share/[tripId]/notices` (FEAT-009, FR-015) pages:
all are public by design (participants never log in — NF-2/NF-8). `registerParticipant`'s only
guards are input validation and
the write itself. Database migrations use `prisma migrate dev` starting with FEAT-004
(`npm run db:migrate`); `db:push` remains available for quick local iteration.

`copy-button.tsx` (FEAT-005) is the app's **first Client Component beyond `/login`** — justified
because clipboard access (`navigator.clipboard.writeText`) has no server-side equivalent. It receives
the fully rendered message text as a prop; it contains no business logic, no fetch, and constructs no
URL, keeping it consistent with "do not mix business logic with visual components."

## Main modules

Following the "generic core + context modules" principle (PRD §5): a generic core, plus modules that
activate by context.

| Module | Responsibility |
|---|---|
| Funnel & state machine | Core: participant states and transitions (PRD §6) |
| Reminder engine | Deadlines per transition; computed on demand in the local prototype (PRD §7) |
| Daily push list & funnel view | Ordered "who to contact" list and funnel overview (PRD §8) |
| Agency document layer & price tier | Track document versions and live price tier (PRD §9) |
| Distribution | Confirmed-group distribution list (PRD §6.3) |
| Visit coordination & roster/compliance | Operational roster and compliance (PRD §10) |
| Participant data management | Participant CRUD, edit/drop, retention (PRD §11, §14) |
| Operator auth & access control | Board login and access control (NF-8) |

## Architecture principles

- **Generic core, context modules** — nothing Tec-specific inside the core; modules activate by context.
- **Human-in-the-loop, never-sends** — the tool proposes and drafts; a human sends and decides.
- **Design around the agency** — manage the agency's document/version chaos rather than trying to
  eliminate it.
- **Local-first, deploy-later** — validate the idea running locally before investing in hosting.

## Architecture rules

- Separate frontend, backend and database.
- Do not mix business logic with visual components.
- Do not write direct database queries from the frontend — data access goes through Prisma on the
  server.
- **Operator authentication is required**; the participant roster must never be reachable by an
  unauthenticated URL (NF-8).
- **No special-category data at rest**: F2 sensitive data is not stored; only F2 status flags
  (ADR-001, NF-6).
- **No PII in URLs**; minimal collection (NF-7).
- Keep the **Prisma schema portable to Postgres** (avoid SQLite-only features).
- Concurrency for the 2–3 board members: shared workspace, last-write-wins, recording per-operator
  identity on state changes (NF-10).
- Automated backups (NF-9) and a background reminder scheduler are **deploy-phase work**, out of the
  local prototype.
- Every new feature must have minimal tests and be associated with an Issue / feature document.

## Important decisions

See the `/decisions` folder:

- `ADR-001_f2_sensitive_data_not_stored.md` — Solanum stores F2 status only, not sensitive data.
- `ADR-002_technology_stack.md` — local-first Next.js + TypeScript + Prisma + SQLite + Auth.js.

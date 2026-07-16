# ADR-002 - Local-first technology stack for Solanum v1

## Status

Accepted.

## Context

Before writing product code, the team wants Solanum to **run entirely on a laptop** so the idea can
be validated **before any deployment** (local-first). Per `CLAUDE.md`, the technology stack is a human
decision that must be documented before implementation; this ADR closes Phase 0 / block B (PRD §20).

Constraints that shape the choice:

- The tool is maintained by a volunteer student exec board and must be **handed off** to the 2028
  board (NF-5) — favor one common language and a well-documented, mainstream stack.
- v1 needs **operator authentication** (NF-8), a **participant funnel/state-machine** tracker (PRD §6),
  a daily push list, and a reminder model (PRD §7); **mobile-first** (NF-11); **cheap to run** (NF-4).
- It stores participant PII (names, contact handles) but **no special-category data** (NF-6); F2
  sensitive data stays out of Solanum (ADR-001).
- Small scale (a ~150→20 funnel per mission) — not a scale problem; simplicity wins.

## Decision

Build Solanum v1 as a **local-first** application with:

- **Next.js (App Router) + TypeScript** for the UI and the API routes (one language front and back).
- **Prisma ORM** over **SQLite** (`file:./dev.db`) for the local prototype database.
- **Auth.js (NextAuth)** for exec-board (operator) authentication (NF-8).

It runs end to end with `npm run dev` — **no Docker, no cloud services**. The **Prisma schema is kept
Postgres-compatible** (no SQLite-only features) so the database can be migrated to a hosted Postgres
later. Deployment (Postgres migration, hosting such as Vercel, a background reminder scheduler, and
automated backups) is **deferred to a future ADR** once the idea is validated.

## Alternatives considered

1. **Supabase local (CLI + Docker).** Rejected for the prototype: adds a Docker dependency; heavier
   than needed just to validate the idea locally. Still viable as a *future* Postgres/deploy target.
2. **Local Postgres + Prisma + Auth.js.** Rejected for now: more manual setup than SQLite for a
   throwaway prototype; Prisma keeps the door open to Postgres anyway.
3. **Django + Postgres (Python).** Rejected: the team works in JS/TS; a single-language stack eases
   maintenance and handoff.
4. **Low-code (Airtable + Softr/AppSheet).** Rejected: weaker operator auth/access control (NF-8) and
   limits the path to a real product in Phase 3.

## Positive consequences

- Zero local infrastructure: runs on any laptop with Node.js, no Docker or cloud accounts.
- Fastest path to a testable prototype to validate the idea.
- One language (TypeScript) across UI, API and schema.
- Prisma keeps the database portable to Postgres for the eventual deploy.
- Auth.js covers operator authentication (NF-8) without building auth from scratch.

## Negative consequences

- SQLite ≠ Postgres: must avoid SQLite-only features to keep the future migration clean.
- Deferred work: background reminder scheduler, automated backups (NF-9) and hosting are not solved
  in this phase.
- Prototype data is disposable (no formal backup locally).

## Date

2026-07-16.

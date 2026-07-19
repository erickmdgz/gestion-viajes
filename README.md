# Solanum

## Description

Solanum is a **local-first academic-trip funnel tracker** for a student exec board (mesa directiva).
It gives the board a single view of where each participant is in the funnel and who to nudge today —
without processing money or storing sensitive data. See `docs_en/01_product_vision.md`.

This repository currently contains the **project baseline** (FEAT-003) plus the **funnel core**
(FEAT-004): operator authentication, and trips/participants moving through the funnel state machine
with overdue flagging. Reminders, the daily push list, agency documents and price tiers are built on
top of it in later features (FEAT-005+).

## Stack

- **Frontend:** Next.js 15 (App Router) + React 19 + TypeScript
- **Backend:** Next.js API routes + Auth.js (NextAuth v5)
- **Database:** Prisma ORM over SQLite (local); schema kept Postgres-compatible for a future deploy
- **Authentication:** Auth.js Credentials (email + password, bcrypt)
- **Hosting:** local (`npm run dev`); cloud deploy deferred (see `docs_en/decisions/ADR-002_technology_stack.md`)

## Prerequisites

- Node.js 22+
- No database server needed — SQLite runs from a local file
- Environment variables (see below)

## Installation

```bash
npm install
cp .env.example .env   # then fill in AUTH_SECRET and the seed credentials
npm run db:migrate     # create the local SQLite database and apply migrations
npm run db:seed        # create the initial exec-board operator
```

Generate an `AUTH_SECRET` with `openssl rand -base64 32`.

## Local run

```bash
npm run dev
```

Open http://localhost:3000, go to `/login`, and sign in with the credentials you set in `.env`
(`SEED_OPERATOR_EMAIL` / `SEED_OPERATOR_PASSWORD`).

## Environment variables

```txt
DATABASE_URL=            # file:./dev.db
AUTH_SECRET=             # openssl rand -base64 32
SEED_OPERATOR_EMAIL=     # initial operator login
SEED_OPERATOR_PASSWORD=  # initial operator password
SEED_OPERATOR_NAME=      # initial operator display name
```

`.env` is gitignored — never commit it.

## Project structure

```txt
prisma/
  schema.prisma   # SQLite datasource + Operator, Trip, Participant models
  migrations/     # prisma migrate history
  seed.ts         # seeds the initial operator
src/
  app/            # App Router pages (/, /login, /dashboard, /dashboard/trips/*) + api/auth/[...nextauth]
  lib/            # prisma.ts, auth.ts, authz.ts, funnel.ts (state machine), trips.ts, participants.ts
  middleware.ts   # protects /dashboard* (redirects to /login without a session)
docs_en/          # product documentation
```

## Main scripts

| Command | Description |
|---|---|
| npm run dev | Runs the local dev server |
| npm run build | Builds the project |
| npm run start | Runs the production build |
| npm run lint | Lints the project |
| npm run test | Runs the Vitest suite (`src/lib/**/*.test.ts`) |
| npm run db:migrate | Applies Prisma migrations (creates the local SQLite database on first run) |
| npm run db:push | Syncs the Prisma schema to the local SQLite database without a migration |
| npm run db:seed | Seeds the initial exec-board operator |

## Documentation

- Product vision: `docs_en/01_product_vision.md`
- Architecture: `docs_en/02_architecture.md`
- Requirements: `docs_en/03_requirements.md`
- Non-functional requirements: `docs_en/04_non_functional_requirements.md`
- Backlog: `docs_en/05_backlog.md`
- API: `docs_en/06_api.md`
- Data model: `docs_en/07_data_model.md`
- Test plan: `docs_en/08_test_plan.md`
- Decisions (ADRs): `docs_en/decisions/`

# FEAT-003 - Local-first project baseline

## 1. Summary

Stand up the first code of the project: a **local-first** Next.js (App Router) + TypeScript
application with a Prisma/SQLite database and **operator (exec board) authentication** via Auth.js.
It runs entirely on a laptop with `npm run dev` — no Docker, no cloud. This materializes ADR-002 and
is the baseline the funnel (FEAT-004) and everything else build on.

## 2. Problem or need

Phase 0 (documentation) is complete; Phase 1 needs a technical baseline: a running app, a local
database, and operator login so the participant roster is never reachable without authentication
(NF-8).

## 3. Affected user

- **Exec board (operator)** — logs in to operate Solanum. Participants never log in (NF-2).

## 4. Related requirements

- NFR-001 — Password security (hashing).
- NFR-002 — Protected access (private routes require authentication).
- NFR-005 — Maintainability (modular structure + README).
- Implements ADR-002 (local-first stack) and PRD NF-8 (operator auth).

## 5. Expected flow

1. A developer runs `npm install` → `npm run db:push` → `npm run db:seed` → `npm run dev`.
2. The operator opens `/login` and signs in with the seeded credentials.
3. On success they reach `/dashboard` (a protected route). On failure an inline error is shown.
4. Visiting `/dashboard` without a session redirects to `/login`.

## 6. Acceptance criteria

Criteria are validated by the test cases below (there is no business FR here; this feature satisfies
NFR-001 / NFR-002). See `docs_en/08_test_plan.md`:

- TC-048 (login success), TC-049 (login failure), TC-050 (protected route redirect), TC-051 (hashed
  password).

## 7. Business rules

- Operators authenticate with email + password; passwords are stored bcrypt-hashed (NFR-001).
- There is no public sign-up; operators are created by the seed script (NF-2).

## 8. Proposed technical design

### Stack

Next.js 15 (App Router) + React 19 + TypeScript; Prisma ORM over SQLite (`file:./dev.db`, schema kept
Postgres-compatible); Auth.js v5 (NextAuth) Credentials provider with JWT sessions; bcryptjs for
hashing; zod for input validation.

### Structure (`src/`)

- `src/lib/prisma.ts` — PrismaClient singleton.
- `src/lib/auth.ts` — NextAuth config: Credentials provider, `authorize()` looks up `Operator` by
  email and validates with `bcrypt.compare`.
- `src/app/api/auth/[...nextauth]/route.ts` — Auth.js route handlers.
- `src/middleware.ts` — redirects unauthenticated requests for `/dashboard*` to `/login` (NFR-002).
- `src/app/page.tsx` — landing (redirects to `/dashboard` when signed in).
- `src/app/login/page.tsx` — login form (client) calling `signIn("credentials")`.
- `src/app/dashboard/page.tsx` — protected demo route with sign-out.
- `prisma/schema.prisma` — `Operator` model. `prisma/seed.ts` — seeds the initial operator.

### Database

`Operator` entity (see `docs_en/07_data_model.md`): `id`, `email` (unique), `name`, `passwordHash`,
`createdAt`. Funnel entities are added by the features that use them (FEAT-004+).

### Security

- Passwords bcrypt-hashed; plaintext never stored or compared (NFR-001).
- Protected routes gated by middleware; the roster is unreachable without a session (NFR-002, NF-8).
- `AUTH_SECRET` and seed credentials come from `.env` (gitignored); `.env.example` documents them.

## 9. Required tests

| ID | Test | Type |
|---|---|---|
| TC-048 | Operator logs in with valid seeded credentials and reaches `/dashboard` | Functional |
| TC-049 | Login with a wrong password is rejected (no session) | Security |
| TC-050 | `/dashboard` without a session redirects to `/login` | Security |
| TC-051 | Stored operator password is a bcrypt hash, not plaintext | Security |

## 10. Documentation impact

- [x] Update architecture (`02_architecture.md`).
- [x] Update backlog (`05_backlog.md`).
- [x] Update API spec (`06_api.md`).
- [x] Update data model (`07_data_model.md`).
- [x] Update test plan (`08_test_plan.md`).
- [x] Update README.
- [x] Feature doc (this file).
- [ ] Release notes — on release to `main`.

## 11. Checklist before implementing

- [x] The feature has a clear objective.
- [x] It is linked to requirements (NFR-001/002/005, ADR-002).
- [x] It has acceptance criteria (TC-048…TC-051).
- [x] It has defined tests.
- [x] The technical impact is understood.
- [x] The user impact is understood.

## 12. Checklist before closing

- [x] Code implemented.
- [x] Tests executed (end-to-end login flow verified).
- [x] Acceptance criteria met.
- [ ] Pull request reviewed.
- [x] Documentation updated.
- [ ] Release notes updated.

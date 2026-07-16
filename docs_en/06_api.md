# API

## Authentication — Auth.js (`/api/auth/[...nextauth]`)

Operator authentication is handled by Auth.js (NextAuth v5) mounted at `/api/auth/*` (FEAT-003).
Login uses the **Credentials** provider (email + password); sessions are JWT-based. There is no public
sign-up — operators are seeded (NF-2).

### Relevant routes

| Route | Method | Purpose |
|---|---|---|
| `/api/auth/csrf` | GET | Returns the CSRF token required to sign in |
| `/api/auth/callback/credentials` | POST | Verifies email + password; on success sets the session cookie |
| `/api/auth/session` | GET | Returns the current session (or `null` if unauthenticated) |
| `/api/auth/signout` | POST | Clears the session |

### Sign-in (credentials)

Request (form-encoded): `csrfToken`, `email`, `password`.

- **Success:** session cookie set; `GET /api/auth/session` returns `{ user: { name, email }, expires }`.
- **Invalid credentials:** no session is created; `GET /api/auth/session` returns `null`.

### Access control

Protected routes (e.g. `/dashboard*`) are guarded by `src/middleware.ts`: an unauthenticated request
is redirected (307) to `/login`. The roster is never reachable without a session (NFR-002 / NF-8).

### Related requirements

- NFR-001 (password hashing), NFR-002 (protected access), ADR-002 (stack), NF-8 (operator auth).

<!-- Business endpoints (trips, participants, reminders, agency docs, …) will be documented here as
     the funnel features (FEAT-004+) are built. -->

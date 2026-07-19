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

## Trip and participant mutations — Next.js Server Actions (FEAT-004)

There are no REST endpoints for trips/participants. Mutations are Next.js **Server Actions**
(`"use server"` functions), consistent with FEAT-003's `signOut` pattern. Each action calls
`requireOperator()` first (`src/lib/authz.ts`) — an unauthenticated call is rejected the same way an
unauthenticated page load is (NFR-002 / NF-8).

| Action | File | Purpose |
|---|---|---|
| `createTrip(formData)` | `src/app/dashboard/trips/actions.ts` | FR-003: persists a trip and its per-transition deadlines |
| `addParticipant(tripId, formData)` | `src/app/dashboard/trips/[tripId]/actions.ts` | FR-004: adds a participant to a trip |
| `withdrawParticipant(tripId, participantId, formData)` | `src/app/dashboard/trips/[tripId]/actions.ts` | Terminal Withdrawn/Declined state (§6.4) |
| `markContractSent(participantId, operatorEmail)` | `src/lib/participants.ts` (inline action on the roster page) | Board-action gate into "Contract sent" (FR-003 AC2) |
| `applyTransitionFlag(participantId, flag, value, operatorEmail)` | `src/lib/participants.ts` (inline action on the roster page) | FR-005: sets/clears `contractSigned`/`depositConfirmed`; `confirmed` is derived, never set directly |
| `markF2Complete(participantId, operatorEmail)` | `src/lib/participants.ts` (inline action on the roster page) | FR-002: records F2 status only (never the sensitive F2 answers, ADR-001); only callable from Contract signed/Deposit confirmed/Confirmed |

Overdue flagging (FR-006) is not an endpoint — it is computed on demand (`src/lib/funnel.ts`,
`isParticipantOverdue`) when the roster page renders, per `02_architecture.md`'s "computed on
demand" principle.

## Reminders — Next.js Server Actions (FEAT-005)

Also Server Actions, not REST. Every action calls `requireOperator()` first.

| Action | File | Purpose |
|---|---|---|
| `recordNudge(tripId, participantId)` | `src/app/dashboard/trips/[tripId]/push/actions.ts` | FR-009: sets `lastRemindedAt`, increments `reminderCount` |
| `snoozeParticipant(tripId, participantId, formData)` | same | FR-009: sets `snoozedUntil` N days out |
| `dismissParticipantToday(tripId, participantId)` | same | FR-009: snoozes until the start of the next UTC day (dismiss = snooze 1 day, same field) |

The daily push list (FR-008) and the reminder message (FR-007) are not endpoints either — computed
on demand by `src/lib/reminders.ts` (`buildPushList`, `renderReminderMessage`) when the push page
renders. Copy-to-clipboard (FR-007 AC2) happens entirely client-side in `copy-button.tsx`; no server
round-trip, no PII in a URL.

## F1 public registration — Next.js Server Action (FEAT-001)

A single **public** Server Action, the only one that does not call `requireOperator()` — by design,
participants never log in (NF-2/NF-8).

| Action | File | Purpose |
|---|---|---|
| `registerParticipant(tripId, formData)` | `src/app/apply/[tripId]/actions.ts` | FR-001: validates the F1 submission (`src/lib/f1Registration.ts`) and creates the participant at `Registered (F1)` |

The form itself is a public route, `src/app/apply/[tripId]/page.tsx` — not under `/dashboard`, so
`src/middleware.ts` does not (and must not) protect it. An unknown `tripId` 404s. No PII is placed in
the URL; the trip is identified only by its opaque UUID in the path.

<!-- Remaining business features (agency docs, price tiers, …) will be documented here as
     the corresponding FEATs are built. -->

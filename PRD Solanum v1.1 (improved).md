# PRD SOLANUM — v1.1 (Improved)

*Product Requirements Document*

Prepared for: Student Executive Boards (mesa directiva)
Status: **Draft v1.1** | Supersedes: Draft v1.0 (10 jul 2026) | Date: 10 jul 2026

---

> **How to read this revision.** v1.1 keeps everything v1.0 already did well (MoSCoW requirements, data model, workflows, non-goals, phasing, kill criteria) and closes the gaps found in a structured review of v1.0. **Content that was absent or ambiguous in v1.0 and is newly *proposed* here is tagged `[PROPOSED — confirm]`.** These are defaults to unblock the build; the team should confirm or overwrite them. Items the source left genuinely open (legal signing, full Tec compliance) remain open — now with structure around them. Nothing here invents field data: where a number or fact is unknown it is marked as such, not filled in.

---

## 0. Document control

| Field | Value |
| ----- | ----- |
| Product | Solanum |
| Version | Draft v1.1 (revision of v1.0) |
| Author / maintainer | *[PROPOSED — name the builder/maintainer who owns this doc]* |
| Reviewers | Exec board, LEAD |
| Status | Draft — pending sign-off |

**Revision history**

| Version | Date | Change |
| ----- | ----- | ----- |
| v1.0 | 10 jul 2026 | Initial draft. |
| v1.1 | 10 jul 2026 | Added glossary, canonical state machine with terminal drop state, reminder-engine semantics, privacy/legal section (LFPDPPP), operator auth, participant data management, per-requirement acceptance criteria, v1 definition-of-done, UX/IA section, expanded metrics, and PM hygiene (owners, dates, traceability). Fixed the §1↔§3.2 state inconsistency and the 3.3 numbering. Clarified that **LEAD is the mesa directiva** (same actor as the primary user), per team confirmation. |

**Sign-off** (approval gate before Phase 1 build)

| Role | Name | Approved |
| ----- | ----- | ----- |
| Exec board lead | | ☐ |
| LEAD (reference) | | ☐ |
| Builder / maintainer | | ☐ |

---

## 1. Glossary & definitions

*(New in v1.1 — v1.0 used these terms without defining them.)*

- **Mesa directiva / exec board.** The 2–3 student volunteers who operate Solanum end to end. The single primary user.
- **LEAD.** The **mesa directiva (exec board) itself** — specifically the real board used as the reference and first pilot, whose process seeds the initial templates and provides the field mission. LEAD is **not a separate actor** from the primary user; it is the concrete instance of the exec-board role. *(Confirmed by the team — resolves the v1.0 ambiguity that listed "the exec board" and "LEAD" as if they were distinct roles.)*
- **Participant.** A student moving through the funnel toward a confirmed trip seat.
- **Agency.** The external travel agency. Receives briefs and clean data, delivers itineraries and budgets. Never logs in.
- **Accompanying professor.** The faculty member required by the Tec on every trip; a mandatory attendee whose cost feeds the price/markup decision.
- **Funnel / state machine.** The ordered set of discrete participant states from *Interested* to *Ready for flights* (see §6).
- **F1 form / F2 form.** Phase-1 capture form (no sensitive data) and phase-2 form (sensitive data). "F2 complete" is the canonical term for the phase-2 milestone.
- **Price tier.** The agency's per-head price band, selected by group size; resolves live against the confirmed count.
- **Overdue transition.** A pending state transition whose deadline has passed (see §7).
- **Semana Tec / Vicerrectoría.** Tec institutional programs/offices relevant only to the deferred institution-as-customer path (out of v1 scope).
- **LFPDPPP.** *Ley Federal de Protección de Datos Personales en Posesión de los Particulares* — the Mexican data-protection law governing the student personal data Solanum stores.

---

## 2. Problem & context

### 2.1 Plain-language explanation

When a Tec student group organizes an academic trip, a small volunteer exec board has to move a large group of students from the moment they say "I'm interested" to the moment they're ready to board the plane. Between those two points there's an enormous, almost invisible amount of work: recruiting participants, getting them to sign contracts, confirming deposits, collecting documents, coordinating with a travel agency, and answering the same questions over and over. Today all of this happens by hand, across three places that don't talk to each other: WhatsApp for conversations, Excel for tracking, email for the formal parts.

Solanum gives the exec board a single clear view of where each student is in that process, and tells them exactly who to nudge today and with what message. It is not a travel agency, it does not move money, and it does not replace the group chat. It never sends anything on its own. The exec board stays in control of every decision and every message that goes out. All Solanum does is eliminate the manual chasing of participants that today eats up hours of volunteer work.

In one sentence: **a funnel tracker built to fit a student exec board, turning the chaos of chasing people by hand into an ordered list of who to contact and with what message, without touching money or sensitive data.**

### 2.2 The problem

Organizing an academic trip looks like task management, but it's really a conversion funnel chased by hand. The exec board is an intermediary: it recruits participants, coordinates with a travel agency, and runs compliance, but it is neither the agency nor the paying customer.

The dominant work is pushing each participant through discrete states, one by one, with individual reminder messages. Because nothing is connected, there's no single source of truth about where each person is, things fall through the cracks, and a handful of volunteers burn hours on repetitive coordination instead of on the trip itself.

A second problem runs in parallel: the board manages a stream of non-editable PDFs from the agency (itinerary, budget with tiered pricing by group size). Those documents get iterated repeatedly, so the board ends up with *n* versions of the same file and no clarity about which is current or which price tier applies right now.

**Core pain, ranked:** the manual pursuit of participant states is the most concrete, most frequent, and most automatable problem in the process. This is why the participant state machine sits at the center of v1. Verified and mapped first-hand by the team, using the LEAD case.

> **Canonical state flow (used verbatim everywhere in this document — see §6 for full detail):**
> Interested → Registered (F1) → Contract sent → Contract signed → Deposit confirmed → Confirmed → F2 complete → Ready for flights
> plus one terminal exit state: **Withdrawn/Declined** (reachable from any active state).

*(v1.1 fix: v1.0 stated a 7-state flow in its problem section and an 8-state flow in §3.2. The 8-state flow above is now canonical and is the only one used throughout.)*

---

## 3. Users & roles

One user operates everything; the surrounding roles receive outputs or provide context but don't operate the tool.

- **Primary user — the exec board / mesa directiva (2–3 people).** Runs the whole tool: funnel, agency documents, visits, distribution. Students volunteering their time, not professional trip planners, so the tool must fit the real, messy channels they already use. **LEAD is the specific mesa directiva serving as the reference board and first pilot — the same actor as the primary user, not a distinct role.** As that reference board it stress-tests the system, provides the playbook and the real field mission, and uses Solanum as an advanced configuration.
- **Output receiver — the travel agency.** Never logs in. Receives visit briefs and clean data, delivers itineraries and budgets.
- **Push recipient — the participant (student).** Receives reminders, itinerary, and notices. Minimal surface, no login in v1.
- **Mandatory attendee — the accompanying professor.** Required on every Tec trip. Their cost feeds the markup decision. Verified by the team.
- **Eventual customer — the institution (Tec).** Has budget and aggregate pain. Out of scope for v1; a mid-term sale conditioned on bottom-up traction.
- **Builder / maintainer.** *[PROPOSED — name a specific person.]* Owns the code, the README, and the handoff to the 2028 board.

**Population assumption:** *[PROPOSED — confirm]* the v1 pilot population is **university students who are legal adults**. If any participant may be a minor, a parental-consent branch must be added before the pilot (see §14). Record the confirmed answer in §23.

Design bar for every role: **NF-1** — a single volunteer, with no prior training, can run the tool.

---

## 4. Goals & non-goals

### 4.1 Goals

1. Give the board a single view of where each participant is in the funnel and which transition is overdue.
2. Generate the ready-to-send reminder message for each overdue participant, on the channel they already use (WhatsApp), without the tool sending it on its own in v1.
3. Track agency document versions and show which is current and which tier the group falls into, live, as the funnel fills.
4. Turn the itinerary and notices currently forwarded by hand into links or files produced from the tool.
5. Coordinate company and institution visits as a small pipeline, producing a brief for the agency.
6. Be simple enough for one person to run, and cheap and documented enough to hand off to next year's board.

### 4.2 Non-goals (v1)

- **No money.** The tool tracks payment *status* as a funnel state; it never processes funds. Participants pay the agency directly. *(Team assumption.)*
- **No sensitive data inside the product.** The tool tracks status ("F2 complete: yes/no"); passports and other sensitive documents keep flowing through the group's current channel. Bringing them inside is gated on data policy (O-3) and a serious security design. *(Note: names and WhatsApp handles ARE personal data and are governed by §14 even though no special-category data is stored — see the correction in §13.)*
- **No replacement for the group chat.** The student-facing surface is minimal and push-based.
- **No "AI-developed" as an external value proposition.** How it's built is not a selling point.

### 4.3 Goal → requirement traceability

| Goal | Primary requirements |
| ----- | ----- |
| G1 Single funnel view | F-2, F-4, F-7 |
| G2 Ready-to-send reminders | F-1, F-5, F-6, F-22 (cadence) |
| G3 Doc versions + live tier | F-10, F-11, F-12, F-13 |
| G4 Distribution as links/files | F-15, F-16, F-16.1 |
| G5 Visit pipeline + brief | F-17, F-18 |
| G6 One-person, cheap, portable | NF-1, NF-4, NF-5, NF-8 (auth), NF-9 (backup) |

---

## 5. Architecture principles

- **Generic core, context modules.** A generic core with nothing Tec-specific inside it, plus modules that activate by context.
- **Human-in-the-loop, never-sends.** The AI proposes and drafts; a human sends and decides. A real person is accountable for anything that reaches a participant or the agency (see §4 AI/human split, §17 workflows).
- **Design around the agency, not against it.** The agency won't change its PDF flow; the document layer manages version chaos rather than trying to eliminate it (O-5 may relax this).

---

## 6. Core: the participant state machine (heart of v1)

States are discrete. Every transition has an associated document or action, and a reminder attached to it (see §7). **This is the highest-priority scope item.**

### 6.1 Canonical flow

Interested → Registered (F1) → Contract sent → Contract signed → Deposit confirmed → Confirmed → F2 complete → Ready for flights

Plus one **terminal exit state** reachable from any active state: **Withdrawn/Declined**.

### 6.2 State detail

| # | State | Entry trigger | Artifact or action |
| ----- | ----- | ----- | ----- |
| 1 | Interested | Expressed interest | None |
| 2 | Registered (F1) | Submitted phase-1 form (no sensitive data) | Capture form |
| 3 | Contract sent | Board issues the contract | Contract document |
| 4 | Contract signed | Participant returns the signed contract | Signed contract (*how it's signed is open — O-2*) |
| 5 | Deposit confirmed | Initial payment made to the agency | Payment status only (no funds handled) |
| 6 | Confirmed | Contract signed **AND** deposit confirmed | Added to the confirmed group |
| 7 | F2 complete | Submitted phase-2 form (sensitive data) | Status flag only ("F2: yes/no") |
| 8 | Ready for flights | Passport handed off via current channel | Passport (flows outside the product in v1) |
| — | **Withdrawn/Declined** *(terminal)* | Board marks the participant as dropped/declined | Optional free-text drop reason |

### 6.3 Confirmed is derived, not hand-set

*(v1.1 fix — resolves the F-3 vs Appendix D contradiction.)* "Contract signed" and "Deposit confirmed" are **two independent flags** the board sets manually (F-3). When **both** are true, the tool **auto-derives** the *Confirmed* state and adds the participant to the confirmed-group distribution list. The board never sets "Confirmed" directly. A participant can be "Contract signed" without "Deposit confirmed" (and vice-versa); the tool shows the partial progress and keeps chasing the missing one.

### 6.4 Terminal drop/withdraw state (top-priority fix)

*(New in v1.1 — the single most important addition.)* A **Withdrawn/Declined** state is reachable from any active state.

- It is **excluded** from F-4 overdue-flagging, from the F-6 daily push list, and from the active funnel/confirmed counts.
- **Deleting a participant is NOT the way to drop them** — deletion corrupts the O-1 baseline metrics. Dropping = moving to Withdrawn/Declined; the record is retained (subject to §14 retention rules) so historical funnel numbers stay intact.
- Optionally capture a **drop reason** for the funnel view (e.g. "price", "schedule", "no reply").

> **Why this is the top fix:** in the 150→20 funnel the product is justified on, ~130 people do not convert. Without a terminal state they are flagged overdue forever and pollute the core daily list — recreating exactly the burnout Solanum exists to remove.

### 6.5 State regression / undo

*(New in v1.1.)* Transitions are **reversible**. The board can move a participant back one or more states (mis-click, refunded deposit, voided contract).

- Moving back clears the flags for the states left behind and updates per-transition timestamps accordingly.
- If a *Confirmed* participant loses "Deposit confirmed" (refund) or "Contract signed" (void), the tool **removes them from the confirmed-group distribution list and re-decrements the confirmed count** feeding the live price tier (F-13).
- All state changes (forward and back) are recorded with a timestamp and the acting operator (see §16 audit trail).

---

## 7. Reminder engine

**Rule (v1.0, retained):** for any participant whose current state has an **overdue** transition (past a board-set deadline), the tool outputs a pre-filled message for that specific transition, addressed to that participant, in WhatsApp format. The board copies it and sends it by hand in v1.

### 7.1 Per-transition deadline model

*(New in v1.1 — v1.0 dated only ~3 transitions against ~7 while claiming "every transition has a reminder attached.")* Each transition has a deadline source:

| Transition (from → to) | Deadline source `[PROPOSED — confirm]` |
| ----- | ----- |
| Interested → Registered (F1) | Trip-level "registration close" date, OR *days-after Interested* |
| Registered → Contract sent | Board action (no participant deadline; board task) |
| Contract sent → Contract signed | Trip-level "contract date" |
| Contract signed → Deposit confirmed | Trip-level "first-payment date" |
| Deposit confirmed → (F2 complete) | *days-after Deposit confirmed* |
| F2 complete → Ready for flights | Trip-level "flights/passport date" |

- **Timing semantics `[PROPOSED — confirm]`:** deadlines are either an **absolute date** (trip-level, e.g. first-payment date) or **relative** (N days after entering the current state). Each transition declares which.
- **Grace period `[PROPOSED — confirm]`:** default **0 days** (overdue the day after the deadline). Configurable per trip.
- **Timezone `[PROPOSED — confirm]`:** board-local time.
- **Late-joiner / rolling recruitment `[PROPOSED — confirm]`:** a participant who enters *after* a trip-wide deadline has already passed is **not** instantly flagged overdue; their relative clock starts at entry, or the board can set a per-participant deadline override.

### 7.2 Cadence, snooze, and "already nudged"

*(New in v1.1 — v1.0 had no throttling, and the data model discarded reminders, so the same people recurred forever.)*

- **Cadence `[PROPOSED — confirm]`:** an overdue participant re-appears on the daily list **once per day** until their state advances or they are snoozed/dropped.
- **Snooze / dismiss:** the board can snooze a participant for N days (e.g. "they said they'll pay Friday") or dismiss today's nudge.
- **`last_reminded_at`:** the tool records when each participant was last nudged (see §16), so the board can see "nudged today" and avoid double-chasing. A lightweight **reminder counter** accumulates per participant/mission for the metrics in §18 (body text is not stored long-term; only the count and timestamp).

### 7.3 Daily push list ordering (F-6)

*(New in v1.1 — v1.0 left ordering undefined.)* The "who to push today" list is **grouped by transition** and, within a group, **ordered by how overdue** (most overdue first). `[PROPOSED — confirm]`

### 7.4 Message templates

*(New in v1.1 — the actual output of the core feature was absent from v1.0, deferred to an un-included playbook.)*

- The tool ships with **one template per transition**, seeded from LEAD's playbook.
- **Language/tone `[PROPOSED — confirm]`: Spanish, informal-respectful** (matching how the board already talks to students on WhatsApp).
- **Interpolation fields:** `{first_name}`, `{transition}`, `{deadline}`, and where relevant `{amount}` / `{payment_reference}`.
- **Delivery mechanism:** **plain-text copy to clipboard**, pasted by the board into WhatsApp. *(NF-7 forbids PII in URLs, so pre-filled `wa.me/?text=` deep links carrying a name are out; plain-text copy-paste is the mechanism.)*

**Example (Contract signed → Deposit confirmed, first-payment overdue) `[PROPOSED — confirm wording]`:**
> "¡Hola {first_name}! Vi que ya tenemos tu contrato firmado 🙌 Para apartar tu lugar falta el depósito inicial, cuya fecha límite era {deadline}. ¿Nos ayudas a confirmarlo? Cualquier duda, aquí estoy."

---

## 8. Daily push list & funnel view

- **F-6 (Must):** the daily "who to push today, with what message" list (see §7.3 for ordering).
- **F-7 — promoted to core view:** the funnel counts per state (e.g. 150 interested → 20 confirmed). *(v1.1 note: §3/§6 call the funnel view part of the core, yet v1.0 filed F-7 as "Should." It is still labeled Should in Appendix A for scope-cut safety, but it is the recommended first "Should" to build; see §12.)*
- **Withdrawn/Declined** participants appear only in a separate "dropped" count, never in active counts or the push list.

---

## 9. Agency document layer & live price tier

- **Version register (F-10, F-11, F-12):** upload/register agency documents (itinerary, budget) with a version label and date; mark exactly **one** version of each type as "current" (others show superseded); record a free-text changelog of what changed.
- **Honesty note (retained):** this **manages** the version chaos rather than eliminating it. Eliminating it would require the agency to change how it works, which violates the agency-as-receiver principle (O-5).
- **Live price tier (F-13):** define the agency's price tiers by group size and show which tier the current confirmed count falls into, live.

### 9.1 Count & tier resolution rules

*(New in v1.1 — v1.0 left these ambiguous, which silently breaks the money-adjacent tier.)*

- **Confirmed count basis `[PROPOSED — confirm]`:** the count feeding the tier is the number of participants **at or past the *Confirmed* state** (cumulative: reached ≥ Confirmed), **excluding** Withdrawn/Declined. Using a single "current_state == Confirmed" read would wrongly *decrement* the count as people advance to F2 complete / Ready for flights — do not do that.
- **Accompanying professor:** **excluded** from the participant confirmed count for tier resolution *[PROPOSED — confirm]* (their cost feeds the markup decision separately).
- **Tier boundaries `[PROPOSED — confirm]`:** tiers must be **contiguous and non-overlapping**; boundary inclusivity is `min ≤ count ≤ max`. If the count matches no tier (e.g. below the smallest band), the tool shows "no tier / below minimum" rather than guessing.

---

## 10. Visit coordination & operational roster / compliance

- **Visit coordination (F-17, F-18):** a contact → confirmation → day-and-time pipeline for companies and institutions, with a **brief to the agency** as its output.
- **Operational roster (F-19):** a roster with **no sensitive fields** (names and contact handles only — governed by §14).
- **Accompanying professor (F-20):** flagged as a required attendee for the trip.
- **Institutional-compliance checklist (F-21, Won't v1):** full checklist (insurance, waivers, ratios) is gated on O-3 and O-4.

### Modules (activated by context, not core)

- **Community-service module (LEAD case):** project → external acceptance as an accreditation path → registration in the official form → hours accredited. A parallel process that doesn't touch trip planning. Built as the *one* module that tests the abstraction (see Risks).
- **Institutional-compliance module (hypothetical):** the requirements the Tec imposes. First confirmed content: the mandatory accompanying professor. The rest is open (O-3, O-4).

---

## 11. Participant data management

*(New in v1.1 — v1.0 had no edit/delete/dedup, so a typo'd handle sent reminders to the wrong person with no fix.)*

- **F-24 (Must):** Edit a participant's fields (name, contact handle) after creation.
- **F-25 (Must):** Delete a participant created in error. *(Deleting is for erroneous records only; genuine drops use the Withdrawn/Declined state — §6.4.)*
- **F-26 (Must):** Uniqueness & duplicate detection. **Contact handle** is the uniqueness key `[PROPOSED — confirm]`; on manual add (F-2) and CSV import (F-8) the tool flags duplicates instead of silently creating them.
- **F-27 (Should):** Re-import merge behavior — a re-imported CSV updates existing records by uniqueness key rather than duplicating.
- **Multi-trip scoping `[PROPOSED — confirm]`:** either add `Participant.trip_id` and scope all funnel/roster/tier queries by it, **or** declare v1 **single-trip only**. Recommendation: add `trip_id` (low cost, avoids a rebuild when the next mission starts).

---

## 12. Functional requirements (MoSCoW)

### 12.1 Funnel & reminders

- **F-1 (Must):** Create a trip and define its funnel deadlines (per-transition, per §7.1).
- **F-2 (Must):** Add participants and see each one's current state.
- **F-3 (Must):** Advance a participant to the next state manually (a checkbox/action per transition); *Confirmed* is auto-derived (§6.3); transitions are reversible (§6.5).
- **F-4 (Must):** Automatically flag participants whose current transition is overdue (excluding Withdrawn/Declined).
- **F-5 (Must):** Generate a pre-filled, per-participant reminder message tied to the overdue transition (§7.4).
- **F-6 (Must):** Produce a daily "who to push today, with what message" list, grouped and ordered per §7.3.
- **F-7 (Should — recommended first):** View the funnel in bulk as counts per state.
- **F-8 (Should):** Import initial participants from the existing capture form or a CSV (with dedup, F-26).
- **F-9 (Won't, v1):** Auto-send reminders through an integration.
- **F-22 (Must — new):** Reminder cadence, snooze/dismiss, and `last_reminded_at` tracking (§7.2).
- **F-23 (Should — new):** Drop-reason capture on Withdrawn/Declined (§6.4).

### 12.2 Agency document layer

- **F-10 (Must):** Upload/register agency documents with a version label and date.
- **F-11 (Must):** Mark exactly one version of each type as "current"; others show superseded.
- **F-12 (Should):** Record what changed between versions (free-text changelog).
- **F-13 (Must):** Define price tiers by group size; show which tier the current confirmed count falls into, live (rules per §9.1).
- **F-14 (Could):** Structured, machine-readable intake shared with the agency (gated on O-5).

### 12.3 Distribution

- **F-15 (Must):** Publish the current itinerary as a shareable link or file for the confirmed group.
- **F-16 (Should):** Publish notices and payment-plan-date reminders as shareable content.
- **F-16.1 (Should):** Generate content ideas and image prompts for promotional material.

### 12.4 Visit coordination

- **F-17 (Should):** Track visit targets through contact → confirmation → day and time.
- **F-18 (Should):** Generate a visit brief for the agency from confirmed visits.

### 12.5 Roster, compliance & data management

- **F-19 (Must):** Maintain an operational roster with no sensitive fields.
- **F-20 (Should):** Flag the mandatory accompanying professor as a required attendee.
- **F-21 (Won't, v1):** Full institutional-compliance checklist (gated on O-3, O-4).
- **F-24 / F-25 / F-26 (Must), F-27 (Should):** Participant edit / delete / dedup / merge (§11).

### 12.6 Acceptance criteria (per-Must, given/when/then)

*(New in v1.1 — v1.0 had no testable criteria. Pattern shown for the load-bearing Musts; extend to every Must before build.)*

- **F-4 (overdue flag):** *Given* a participant in "Contract sent" and a first-payment/contract deadline of yesterday, *when* the board opens the tool, *then* that participant is flagged overdue; *and* a Withdrawn participant with a past deadline is **not** flagged.
- **F-5 (message gen):** *Given* an overdue participant, *when* the board views them, *then* a WhatsApp-format message for that exact transition is shown with `{first_name}` and `{deadline}` interpolated and a working copy-to-clipboard action.
- **F-6 (daily list):** *Given* 3 overdue and 1 snoozed participant, *when* the board opens "push today," *then* exactly the 3 overdue appear, grouped by transition, most-overdue first, and the snoozed one is absent.
- **F-11 (current version):** *Given* three budget versions, *when* the board marks v3 current, *then* v1 and v2 show "superseded" and only v3 is served to distribution (F-15).
- **F-13 (live tier):** *Given* tiers [10–19: $X], [20–29: $Y] and 20 confirmed, *when* a 21st confirms, *then* the displayed tier stays [20–29]; *when* a confirmed participant is reverted below 20, *then* the tier re-resolves to [10–19].

---

## 13. Non-functional requirements

- **NF-1:** Single-operator simple. Usable by one person with no onboarding support. Made checkable in §15 (first-run flow, empty states, self-evident labels).
- **NF-2:** Push-based, minimal student surface. No **participant** login in v1.
- **NF-3:** Channel-native. Reminders formatted for WhatsApp; the tool never becomes a chat.
- **NF-4:** Cheap to host, few moving parts. **Hosting-cost ceiling `[PROPOSED — confirm]`: runs on free-tier / ≤ a stated monthly cap**, with a named funder if any cost is incurred. Built to hand off to the 2028 board.
- **NF-5:** Documented and portable. README **plus data export** — where the export is *tool/README + de-identified funnel metrics*, **not** a roster of past students' names and handles (see §14).
- **NF-6:** **No *special-category* / sensitive data at rest in v1** (no passports, no F2 underlying data — status flags only). **Correction:** names and WhatsApp handles **are** personal data under LFPDPPP and **are** stored; they are governed by §14, not exempt from it. v1.0's "no sensitive data" wording must not be read as "no legal duty."
- **NF-7:** Privacy-preserving defaults. No personal data in URLs; minimal collection.
- **NF-8 (Must — new):** **Board-operator authentication & access control.** Operators log in; the ~150-student roster is never reachable by an unauthenticated URL. *(NF-2 rules out only *participant* login — operators still need auth.)*
- **NF-9 (Should — new):** **Backup & durability.** Periodic/automated backup of the data store; a manual export is **not** a backup. State a minimum data-durability expectation.
- **NF-10 (Should — new):** **Concurrency model** for the 2–3 board members `[PROPOSED — confirm]`: shared workspace, last-write-wins, with per-operator identity recorded on state changes (§16).
- **NF-11 (Should — new):** **Form factor `[PROPOSED — confirm]`: mobile-first responsive** (the board lives in WhatsApp on their phones).

---

## 14. Privacy, data protection & legal

*(New in v1.1 — v1.0's repeated "no sensitive data" framing obscured that the pilot processes real student PII under LFPDPPP. This blocks lawful pilot approval, though not the build.)*

- **NF-12 (Must):** **Aviso de privacidad.** A one-paragraph privacy notice on the F1 capture form stating what is collected (name, contact handle), the purpose (trip coordination), the responsible party, and that data is not shared beyond the agency for trip logistics.
- **NF-13 (Must):** **Consent.** A consent checkbox captured at registration; store a **consent timestamp** on the Participant record. State the **legal basis** for processing.
- **NF-14 (Should):** **ARCO rights.** A stated process for Acceso, Rectificación, Cancelación, Oposición requests (rectification is largely covered by F-24 edit; cancellation by F-25 delete).
- **NF-15 (Must):** **Retention/deletion.** After a defined window post-trip `[PROPOSED — confirm, e.g. 90 days]`, participant PII is deleted or anonymized; only de-identified funnel metrics are retained for handoff/baseline.
- **Minors:** if the population is not adults-only (§3), add a parental-consent branch before the pilot.
- **Board legal personality / liability (elevated from O-2):** under what legal personality the board issues the participant contract, and its liability exposure, is a **risk-register item** (see §22), not merely an open question — it affects whether "contract signed" can be auto-registered and what the board is accountable for.

---

## 15. UX & information architecture

*(New in v1.1 — v1.0 set NF-1 as the whole value prop but specified no interface. Rated "inadequate" in review.)*

- **Form factor `[PROPOSED — confirm]`:** mobile-first responsive (see NF-11).
- **Screen inventory (each Must/Should maps to a named surface):**
  - **Dashboard / Push Today** — the daily list (F-6); the landing screen.
  - **Participants** — list + detail; state row with one-tap advance and overdue flag (F-2, F-3, F-4, F-24/25).
  - **Funnel** — counts per state (F-7).
  - **Documents** — version register + current/superseded + live tier (F-10–F-13).
  - **Distribution** — itinerary/notices as links/files (F-15, F-16, F-16.1).
  - **Visits** — pipeline + brief (F-17, F-18).
  - **Trip settings** — deadlines, tiers, templates (F-1).
- **Navigation model:** a single dashboard home with tabs to the surfaces above.
- **Core participant row (wireframe sketch):** `[Name] — [current state chip] — [⚠ overdue badge] — [Advance ▸] — [⋯ (snooze / move back / drop / edit)]`.
- **Empty / first-run / error states (Must for the four core flows):**
  - *Push Today empty:* "Nothing to push today ✅" as a **positive** confirmation, not a blank screen.
  - *No participants yet:* first-run prompt to add or import (links to F-2 / F-8).
  - *No deadlines set:* if F-1 deadlines were never set, F-4 cannot compute "overdue" — show a clear "Set trip deadlines to enable reminders" prompt instead of silently flagging nothing.
  - *Import/upload errors:* plain-language error + the next action (bad CSV row, duplicate handle, unsupported file).
- **NF-1 made checkable:** a first-run flow exists; every core screen has an empty state; labels are self-evident without a manual; the README is for **handoff**, not daily operation.

---

## 16. Data model (high level)

Sensitive fields are referenced by status only, never stored. **Bold** = new/changed in v1.1.

- **Trip:** id, name, destination(s), key dates (registration close, contract, first payment, flights), accompanying-professor flag, **per-transition deadline config**, **price-tier config**.
- **Participant:** id, **trip_id**, name, contact handle, current_state (**incl. Withdrawn/Declined**), per-transition timestamps, contract_signed (boolean), deposit_confirmed (boolean), F2_complete (boolean — no underlying sensitive data), **last_reminded_at**, **reminder_count**, **consent_timestamp**, **drop_reason (nullable)**.
- **AgencyDocument:** id, trip_id, type (itinerary/budget), version_label, date, is_current, changelog.
- **PriceTier:** id, trip_id, min_group_size, max_group_size, price_per_head; resolved live against the **cumulative confirmed count** (§9.1).
- **Visit:** id, trip_id, target, status (contacted/confirmed), datetime.
- **Reminder** (generated, not stored long-term): participant_id, transition, message_text. *(Only the count + `last_reminded_at` persist; body text does not.)*
- **AuditEntry (new):** id, participant_id, operator, from_state, to_state, timestamp — records every forward/back state change (supports NF-10 concurrency and §6.5 undo).

---

## 17. Key workflows

- **Daily chase:** the board opens the tool, sees the "push today" list (grouped, ordered, excluding dropped/snoozed), copies each pre-filled message, sends it on WhatsApp, advances states as replies come in, and drops non-responders to Withdrawn/Declined when appropriate.
- **New agency version:** the agency sends a new budget PDF; the board uploads it, labels the version, marks it current, notes what changed, and the tool re-resolves the current price tier against the cumulative confirmed count.
- **Confirmation:** the participant signs the contract and pays the agency; the board marks contract-signed and deposit-confirmed; the tool **auto-derives** *Confirmed* and adds them to the confirmed-group distribution list.
- **Flight readiness:** the participant completes F2 and hands off the passport via the current channel; the board flips F2 complete and Ready for flights; the tool shows the count of flight-ready participants for the agency.
- **Withdrawal (new):** a participant declines or goes dark past the grace period; the board moves them to Withdrawn/Declined (optional reason); they leave the push list and active counts but stay in the historical funnel.
- **Correction/refund (new):** a deposit is refunded or a contract voided; the board moves the participant back a state; the tool removes them from the confirmed group and re-resolves the tier.

---

## 18. Success metrics & pilot targets

*(Expanded in v1.1 — v1.0's flagship metric was stated in time units the plan never captured.)*

### 18.1 Primary success signal (made measurable)

- **Effort definition `[PROPOSED — confirm one`]:** either (a) **self-timed daily-chase minutes** logged by the board, or (b) **reminders-sent per confirmed head** as a proxy (captured cheaply via `reminder_count`, §16).
- **Baseline:** extend **O-1** to capture the *same* quantity for the prior mission (not just counts). Without this, "measurably less time" cannot be judged.
- **Target `[PROPOSED — confirm]`:** a stated numeric reduction (e.g. ≥ 40% fewer chase-minutes, or ≥ 30% fewer reminders per confirmed head) vs the prior mission.

### 18.2 Secondary signals (operationalized)

- **Source of truth:** a weekly binary check — "did the board keep a parallel Excel this week? yes/no." (Reinforced by the adoption risk in §22.)
- **Agency valued the briefs/data:** a post-brief 1–5 rating captured at least twice during the pilot.

### 18.3 Leading indicators (cheap, weekly)

- Days the push list was opened; % of transitions advanced in-tool. A defined floor triggers a mid-pilot check-in.

### 18.4 Kill criteria

- If the board reverts to a parallel Excel **AND** time saved is below a numeric "negligible" threshold `[PROPOSED — confirm, e.g. < 15% vs baseline]` across a full mission, execute the documented shutdown and hand the artifact to the next board. By design, that's still a win. *(v1.1 fix: define "negligible" numerically and state the AND/OR logic explicitly.)*

---

## 19. Definition of done / launch checklist

*(New in v1.1 — the explicit gate between Phase 1 build and Phase 2 pilot.)*

v1 is "done" and ready for the pilot when:

- ☐ Every **Must** requirement passes its acceptance criteria (§12.6) against **LEAD's real roster**.
- ☐ The terminal Withdrawn/Declined state, reminder cadence/snooze, and per-transition deadlines work end-to-end.
- ☐ Operator auth (NF-8) is in place; no unauthenticated URL exposes the roster.
- ☐ Privacy notice + consent (NF-12/13) live on the F1 form; retention rule (NF-15) configured.
- ☐ README + data export (NF-5) work and the export is de-identified.
- ☐ Empty/first-run/error states (§15) exist for the four core flows.
- ☐ Automated backup (NF-9) confirmed.

---

## 20. Phasing & roadmap

*(v1.1 adds target windows; anchor the pilot to the mission's real contract/first-payment/flight dates.)*

- **Phase 0 — Probes `[PROPOSED — ~2–3 weeks]`:** close the conversation-answerable open items (O-1, O-2, as much of O-3 and O-5 as possible) before writing product code.
- **Phase 1 — v1 build `[PROPOSED — ~4–6 weeks]`:** build the core (§6–§11) with LEAD's playbook as initial templates, plus the one community-service module. Exit on the §19 definition of done.
- **Phase 2 — Field pilot `[PROPOSED — anchored to the mission's registration→first-payment→flights window]`:** run on a real student-group mission; measure against the O-1 baseline (§18).
- **Phase 3 — Decision:** with pilot data, decide between (a) pursuing the institution (Tec) as customer, (b) exploring the agency channel, or (c) closing the project, documented and handed to the 2028 board. Option (c) is a win by design.
  - **Positive-path criteria `[PROPOSED — confirm]`:** pursue **Tec** if the pilot shows aggregate cross-group demand + institutional interest (O-6); pursue the **agency channel** if the agency-relationship layer (F-10–F-18) proved to be the differentiator and O-5 relaxed.

---

## 21. Open questions & dependencies

*(v1.1 adds an owner + due date to each and splits by what they block.)*

**Blocks the v1 build / pilot (close in Phase 0):**

| ID | Question | Owner | Due |
| ----- | ----- | ----- | ----- |
| O-1 | Real funnel numbers **and effort/time** from LEAD's last mission (interested→confirmed, # reminders, chase-time). Sets the pilot baseline. Close by pulling from existing forms/chats. | *[assign]* | *[date]* |
| O-2 | How the participant contract is issued, under what legal personality, and how it's signed today. Determines whether "contract signed" is auto-registerable or a manual check; feeds §14 liability. | *[assign]* | *[date]* |

**Blocks future scope (not v1):**

| ID | Question | Owner | Due |
| ----- | ----- | ----- | ----- |
| O-3 | Tec's administrative & data requirements for a student trip; whether sensitive data can ever come inside. | *[assign]* | *[date]* |
| O-4 | Which regulation mandates the accompanying professor and what else it requires (insurance, waivers, ratios). | *[assign]* | *[date]* |
| O-5 | Whether the agency would accept a structured intake or its PDF flow is non-negotiable. | *[assign]* | *[date]* |
| O-6 | Whether the Tec already has or plans an internal system for this (build-vs-buy). | *[assign]* | *[date]* |

---

## 22. Risks & mitigations

- **Adjacency to SquadTrip/WeTravel.** With the funnel at the center, the product nears trip-page/registration/participant-tracking territory. **Mitigation & positioning statement:** the defensible wedge is the **in-scope agency-relationship layer (F-10–F-18)** plus no payment processing and (later) institutional compliance — capabilities no competitor combines. **If v1 ends up being only the funnel, differentiation is insufficient** — tie this explicitly to O-6.
- **Generalizing before validating / fake modularity.** **Mitigation:** build the core against LEAD's real process; add exactly one module (community service) to test the abstraction, nothing more.
- **Adoption — the board reverts to Excel/WhatsApp.** **Mitigation:** NF-1, the source-of-truth signal (§18.2), and the net-time-saved bar. Empty/error states (§15) matter here — they're where an untrained volunteer gives up.
- **Handoff — the tool dies with this year's board.** **Mitigation:** NF-4, NF-5, NF-9, cheap hosting, README, backup, de-identified export.
- **Agency won't change (PDF flow non-negotiable).** **Mitigation:** design around the behavior (version register); O-5 may relax.
- **Legal / liability (new).** The board issues contracts under an unclear legal personality and stores student PII. **Mitigation:** close O-2, ship §14 (consent, retention, aviso de privacidad) before the pilot; treat as a launch blocker.
- **Minors in the population (new).** If not adults-only, parental consent is required. **Mitigation:** confirm §3 assumption; add the branch if needed.

---

## 23. Standing assumptions

- The student-group funnel mapped in the source doc is representative of this scope. *(Core hypothesis.)*
- The agency won't change how it works (PDFs); the product is designed around that behavior. *(O-5 may relax.)*
- Participants pay the agency directly; the intermediary handles no money. *(Team assumption.)*
- The board would adopt a tool that saves net time from the first use.
- There's a gap between what the Tec's official system covers and what the organizer needs. *(Hypothesis, O-3/O-6.)*
- **Pilot population is adults-only. `[PROPOSED — confirm; if false, add parental-consent branch]`**
- **The `[PROPOSED — confirm]`-tagged defaults throughout this document (grace period, timezone, cadence, form factor, retention window, uniqueness key, tier inclusivity, concurrency model, hosting ceiling) are placeholders chosen to unblock the build and must be confirmed or overwritten by the team before Phase 1.**

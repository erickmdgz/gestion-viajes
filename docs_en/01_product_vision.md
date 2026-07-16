# Product Vision

> Source of truth: `PRD Solanum v1.1 (improved).md` (repo root). This document transcribes the
> approved vision; unconfirmed items keep their `[PROPOSED — confirm]` markers.

## Problem

When a Tec student group organizes an academic trip, a small volunteer exec board (mesa directiva)
must move a large group of students from "I'm interested" to "ready to board the plane." Between those
two points there is an enormous, almost invisible amount of manual work: recruiting participants,
getting contracts signed, confirming deposits, collecting documents, coordinating with a travel
agency, and answering the same questions over and over.

Today this happens **by hand across three disconnected channels** — WhatsApp for conversations, Excel
for tracking, email for the formal parts. There is **no single source of truth** about where each
person is, so things fall through the cracks and a handful of volunteers burn hours on repetitive
chasing instead of on the trip itself. In essence it is not task management but **a conversion funnel
chased by hand**.

A second, parallel problem: the board manages a stream of non-editable PDFs from the agency
(itinerary, budget with tiered pricing by group size). These are iterated repeatedly, leaving *n*
versions of the same file and no clarity on which is current or which price tier applies right now.

> **In one sentence:** a funnel tracker built to fit a student exec board, turning the chaos of
> chasing people by hand into an ordered list of who to contact and with what message, without
> touching money or sensitive data.

## Target user

**One user operates everything;** the surrounding roles receive outputs or provide context but do not
operate the tool.

- **Primary user — the exec board / mesa directiva (2–3 volunteers).** Runs the whole tool (funnel,
  agency documents, visits, distribution). Students volunteering their time, not professional trip
  planners, so the tool must fit the messy channels they already use. *(LEAD = the specific mesa
  directiva serving as reference board and first pilot — the same actor as the primary user, not a
  separate role.)*
- **Output receiver — the travel agency.** Never logs in; receives visit briefs and clean data,
  delivers itineraries and budgets.
- **Push recipient — the participant (student).** Receives reminders, itinerary and notices. Minimal
  surface, **no login in v1**.
- **Mandatory attendee — the accompanying professor.** Required on every Tec trip; their cost feeds
  the markup decision.
- **Eventual customer — the institution (Tec).** Has budget and aggregate pain; **out of scope for
  v1**.
- **Builder / maintainer** `[PROPOSED — name a specific person]`. Owns the code, README and the
  handoff to the 2028 board.

**Population assumption** `[PROPOSED — confirm]`: the v1 pilot population is **university students who
are legal adults**. If any participant may be a minor, a parental-consent branch must be added before
the pilot.

## Main goal

Give the board a **single, clear view of where each participant is in the funnel**, and tell them
exactly **who to nudge today and with what message** — eliminating the manual chasing that eats
volunteer hours. The tool **never sends anything on its own in v1**: the board stays in control of
every decision and every message (human-in-the-loop).

## Initial scope

What v1 builds (goals G1–G6 of the PRD):

1. **Single funnel view** — where each participant is and which transition is overdue.
2. **Ready-to-send reminders** — the message for each overdue participant, on the channel they already
   use (WhatsApp); the tool does not send it by itself in v1.
3. **Agency document versions + live price tier** — track which document is current and which tier the
   group falls into, live, as the funnel fills.
4. **Distribution** — turn itinerary and notices currently forwarded by hand into links or files
   produced from the tool.
5. **Visit pipeline + brief** — coordinate company/institution visits as a small pipeline, producing a
   brief for the agency.
6. **One-person, cheap, portable** — simple enough for one volunteer to run, cheap and documented
   enough to hand off to next year's board.

The participant state machine (Interested → Registered (F1) → Contract sent → Contract signed →
Deposit confirmed → Confirmed → F2 complete → Ready for flights, plus terminal Withdrawn/Declined) is
the **heart of v1**. In this phase v1 runs **local-first** on a laptop (see
`decisions/ADR-002_technology_stack.md`).

## Out of scope

- **No money.** The tool tracks payment *status* as a funnel state; it never processes funds.
  Participants pay the agency directly.
- **No sensitive data inside the product.** The tool tracks status only ("F2 complete: yes/no");
  passports and other sensitive documents keep flowing through the group's current channel (see
  `decisions/ADR-001_f2_sensitive_data_not_stored.md`). *(Note: names and WhatsApp handles ARE personal
  data and are governed by the privacy section even though no special-category data is stored.)*
- **No replacement for the group chat.** The student-facing surface is minimal and push-based.
- **No "AI-developed" as an external value proposition.** How it's built is not a selling point.
- **The institution (Tec) as customer** — deferred beyond v1.

## Success criteria

- **Primary signal — less manual chasing vs. a baseline.** A stated numeric reduction
  `[PROPOSED — confirm]` (e.g. ≥ 40% fewer self-timed chase-minutes, or ≥ 30% fewer reminders per
  confirmed head) versus the prior mission. Requires capturing the same quantity for the prior mission
  as a baseline.
- **Secondary signals:** a weekly binary check — did the board keep a parallel Excel this week?
  (adoption); and the agency's rating of the briefs/data (1–5, captured at least twice during the
  pilot).
- **Leading indicators (weekly):** days the push list was opened; % of transitions advanced in-tool.
- **Kill criteria:** if the board reverts to a parallel Excel **and** time saved is below a numeric
  "negligible" threshold `[PROPOSED — confirm]` across a full mission, execute the documented shutdown
  and hand the artifact to the next board. By design, that is still a win.

## Main risks

- **Adjacency to existing tools (SquadTrip/WeTravel).** If v1 ends up being *only* the funnel,
  differentiation is insufficient. **Wedge:** the in-scope agency-relationship layer + no payment
  processing + (later) institutional compliance.
- **Generalizing before validating.** Build the core against LEAD's real process; add exactly one
  extra module (community service) to test the abstraction, nothing more.
- **Adoption — the board reverts to Excel/WhatsApp.** Mitigated by one-person simplicity, the
  source-of-truth signal, the net-time-saved bar, and good empty/error states.
- **Handoff — the tool dies with this year's board.** Mitigated by cheap hosting, README, backups and
  a de-identified export.
- **The agency won't change its PDF flow.** Design around it (version register) rather than fighting
  it.
- **Legal / liability.** The board issues contracts under an unclear legal personality and stores
  student PII. Close the legal question and ship consent, retention and privacy notice before the
  pilot — treated as a **launch blocker**.
- **Minors in the population.** If not adults-only, parental consent is required; confirm the
  population assumption and add the branch if needed.

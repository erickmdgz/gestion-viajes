# **PRD SOLANUM**

*Product Requirements Document*

Prepared for: Student Executive Boards

Status: Draft v1.0 | Date: 10 jul 2026

# **PRODUCT REQUIREMENTS DOCUMENT — SOLANUM**

### **Plain-language explanation (for someone who knows nothing about the project)**

When a Tec student group organizes an academic trip, a small volunteer executive board (mesa directiva) has to move a large group of students from the moment they say "I'm interested" to the moment they're ready to board the plane. Between those two points there's an enormous, almost invisible amount of work: recruiting participants, getting them to sign contracts, confirming deposits, collecting documents, coordinating with a travel agency, and answering the same questions over and over. Today all of this happens by hand, spread across three places that don't talk to each other: WhatsApp for conversations, Excel for tracking, and email for the formal parts.

Solanum is a lightweight tool that gives the exec board a single clear view of where each student is in that process, and tells them exactly who to nudge today and with what message. It is not a travel agency, it does not move money, and it does not replace the group chat they already use. It never sends anything on its own. The exec board stays in control of every decision and every message that goes out. All Solanum does is eliminate the manual chasing of participants that today eats up hours of volunteer work.

In one sentence: it's a funnel tracker built to fit a student exec board, turning the chaos of chasing people by hand into an ordered list of who to contact and with what message, without touching money or sensitive data.

### **1\. Problem**

Organizing an academic trip looks like task management, but it's really a conversion funnel chased by hand. The exec board acts as an intermediary: it recruits participants, coordinates with a travel agency, and runs compliance, but it is neither the agency nor the paying customer.

The dominant work isn't managing to-dos. It's pushing each participant through discrete states, one by one, with individual reminder messages. The state flow is:

**interested → registered → contract signed → deposit confirmed → confirmed → sensitive data complete → ready for flights**

Today the exec board pushes each of those transitions by hand, with reminders scattered across WhatsApp, Excel, and email. Because nothing is connected, there's no single source of truth about where each person is, things fall through the cracks, and a handful of volunteers burn hours on repetitive coordination instead of on the trip itself.

A second problem runs in parallel. The exec board manages a stream of non-editable PDFs sent by the agency (itinerary, budget with tiered pricing by group size). Those documents get iterated again and again, so the board ends up with n versions of the same file and no clarity about which is current or which price tier the group falls into at the moment.

The core pain, ranked: the manual pursuit of participant states is the most concrete, most frequent, and most automatable problem in the entire process. That's why this PRD places the participant state machine at the center of v1. This is verified and mapped first-hand by the team, using the LEAD case.

### **2\. Users**

The product has one user who operates everything and a set of surrounding roles that receive outputs or provide context but don't operate the tool.

**Primary user. The exec board (2 to 3 people).** Runs the whole tool: funnel, agency documents, visits, and distribution. They're students volunteering their time, not professional trip planners, so the tool has to fit the real, messy channels they already use rather than impose a new system on them.

**Reference and power user. LEAD.** Stress-tests the system, provides the playbook and the real field mission as the first pilot. Uses Solanum as an advanced configuration of the system.

**Output receiver. The travel agency.** Never logs in. Receives visit briefs and clean data, and delivers itineraries and budgets.

**Push recipient. The participant (student).** Receives reminders, itinerary, and notices. Minimal surface, no login in v1.

**Mandatory attendee. The accompanying professor.** Required on every Tec trip, including student-group trips. Their cost feeds the markup decision. This is verified by the team.

**Eventual customer. The institution (Tec).** Has budget and aggregate pain. Out of scope for v1. It's a mid-term sale conditioned on bottom-up traction.

The design bar for all of these roles is NF-1: a single volunteer, with no prior training, should be able to run the tool.

### **3\. The one core thing**

If the product does one thing well, it's this: **automate the recruitment-to-flight-ready funnel.**

Concretely, that's the participant state machine plus the reminder generator. For each person, the tool knows which state they're in, which transition is overdue against a board-set deadline, and produces the pre-filled WhatsApp message for that specific person and that specific transition. The output is a daily "who to push today, and with what message" list, backed by a funnel view (for example 150 interested to 20 confirmed). Everything else in the product exists to support this core, not to compete with it.

#### **3.1 Architecture principle**

A generic core with nothing Tec-specific inside it, plus modules that activate by context.

#### **3.2 The participant state machine (the heart of v1)**

States are discrete. Every transition has an associated document or action, and a reminder attached to it.

**Flow:**  
Interested → Registered (F1) → Contract sent → Contract signed → Deposit confirmed → Confirmed → F2 complete → Ready for flights

**State detail (state / entry trigger / associated artifact or action):**

| State | Entry trigger | Artifact or action |
| ----- | ----- | ----- |
| Interested | Expressed interest | None |
| Registered (F1) | Submitted phase-1 form (no sensitive data) | Capture form |
| Contract sent | Board issues the contract | Contract document |
| Contract signed | Participant returns the signed contract | Signed contract (how it's signed is open, see O-2) |
| Deposit confirmed | Initial payment made to the agency | Payment status only (no funds handled) |
| Confirmed | Contract signed plus deposit confirmed | Added to the confirmed group |
| F2 complete | Submitted phase-2 form (sensitive data) | Status flag only ("F2: yes/no") |
| Ready for flights | Passport handed off via current channel | Passport (flows outside the product in v1) |

**Reminder generation rule:** for any participant whose current state has an overdue transition (past a board-set deadline, for example the first-payment date), the tool outputs a pre-filled message for that specific transition, addressed to that participant, in WhatsApp format. The board copies and sends it by hand in v1.

#### **3.3 v1 core scope**

**5.1 Participant state machine plus reminder generator (highest priority).** The funnel tracker. For each person: which state they're in, which transition is overdue, and the message ready to send on the channel they already use. In v1 the tool doesn't send messages on its own, it produces the "who to push today and with what message" list.

**5.2 Agency document layer.** A version register for the PDFs the agency delivers (which is current, what changed, which is obsolete), and a live link between the confirmed-participant count and the budget's price tier, so the board sees in real time which cost scenario the group is in as the funnel fills. Honesty note: this manages the version hell rather than eliminating it. Eliminating it would require the agency to change how it works, which violates the agency-as-receiver principle (see O-5).

**5.3 Distribution to participants.** The itinerary and notices currently re-forwarded by hand to the confirmed group leave the tool as links or files ready to share.

**5.4 Visit coordination.** A contact → confirmation → day and time pipeline for companies and institutions, with the brief to the agency as its output.

**5.5 Operational roster.** A roster with no sensitive data, per the corresponding non-goal.

**5.6 Modules (activated by context, not core).**

* Community-service module (LEAD case): project → external acceptance as an accreditation path → registration in the official form → hours accredited. A parallel process that doesn't touch trip planning or execution.  
* Institutional-compliance module (hypothetical): the requirements the Tec imposes on a student trip. First confirmed content: the mandatory accompanying professor. The rest is open (see O-3 and O-4).

#### **3.4 Goals and non-goals**

**Goals:**

* Give the board a single view of where each participant is in the funnel and which transition is overdue.  
* Generate the ready-to-send reminder message for each overdue participant, on the channel they already use (WhatsApp), without the tool sending it on its own in v1.  
* Track agency document versions and show which is current and which tier the group falls into, live, as the funnel fills.  
* Turn the itinerary and notices currently forwarded by hand into links or files produced from the tool.  
* Coordinate company and institution visits as a small pipeline, producing a brief for the agency.  
* Be simple enough for one person to run, and cheap and documented enough to hand off to next year's board.

**Non-goals (v1):**

* No money. The tool tracks payment status as a funnel state, it never processes funds. Participants pay the agency directly. (Team assumption.)  
* No sensitive data inside the product. The tool tracks the status ("F2 complete: yes/no"), but passports and other sensitive documents keep flowing through the group's current channel. Bringing them inside is gated on data policy (O-3) and a serious security design.  
* No replacement for the group chat. The student-facing surface is minimal and push-based.  
* No "AI-developed" as an external value proposition. How it's built is not a selling point.

### **4\. AI's role**

The AI proposes and drafts. It never sends or decides.

What the AI does:

* Generates the per-participant reminder message tied to the overdue transition (F-5).  
* Produces the daily "who to push today, with what message" list (F-6).  
* Drafts distribution content, such as itinerary notices and payment-plan dates (F-15, F-16).  
* Suggests content ideas and image prompts to help the board create promotional material, for example stories or posts (F-16.1).  
* Organizes scattered information into a clear funnel state, so the board can see at a glance who is where.

The AI's hard limits in v1:

* It doesn't send messages on its own. Auto-send via integration is an explicit "Won't" for v1 (F-9).  
* It doesn't handle funds. Money flows straight from participant to agency.  
* It doesn't store sensitive data. It works only with status flags (F2 yes/no), never the underlying data (NF-6).  
* It puts no personal data in URLs and collects the minimum (NF-7).

The underlying idea is that the AI stays in a support role, not an autonomous one. It prepares the heavy, repetitive work so the person can decide fast.

### **5\. Humans' role**

Humans send and decide. The rule is that a real person is accountable for anything that reaches a participant or the agency.

What humans do:

* Review each AI-drafted message and send it by hand on WhatsApp (the board copies and pastes in v1).  
* Advance each participant's state as replies come in (F-3, one action or checkbox per transition).  
* Confirm signed contracts and deposits, and with that move the person to "confirmed."  
* Make all judgment calls, including cost and markup decisions.  
* Handle money outside the tool. Participants pay the agency directly, so no movement of funds passes through the product.  
* Handle sensitive data outside the tool. Passports and sensitive documents keep flowing through the group's current channel, moved by people, not by the product.  
* Upload and label the agency document versions, mark which is current, and note what changed (F-10 to F-12).

This separation of roles is deliberate and defines the product. The AI proposes or drafts, the person always sends or decides. That keeps human accountability over everything that goes out, and the tool never becomes a chat or a payment processor.

### **6\. Signal of working**

#### **6.1 Success (fall pilot / student-group mission)**

* The board used the tool as the source of truth, not as a mirror of a parallel Excel.  
* State-chasing took measurably less time than the previous mission (baseline: the funnel numbers, see O-1).  
* The agency valued the briefs and clean data it received.

#### **6.2 Baseline needed before the pilot**

Real funnel numbers from the last mission: how many interested enter, how many confirm, how many individual reminders a mission requires. If it's 25 to 20, manual chasing is annoying but cheap. If it's 150 to 20, the tracker pays for itself. This baseline is open item O-1.

#### **6.3 Kill criteria**

If the board reverts to a parallel Excel and the time saved is negligible across a full mission, execute the documented shutdown and hand the artifact to the next board. By design, that's still a win.

---

## **Appendices (full PRD detail)**

### **A. Functional requirements (MoSCoW: Must / Should / Could / Won't v1)**

#### **A.1 Funnel and reminders**

* F-1 (Must): Create a trip and define its funnel deadlines (for example contract date, first-payment date).  
* F-2 (Must): Add participants and see each one's current state.  
* F-3 (Must): Advance a participant to the next state manually (a checkbox or action per transition).  
* F-4 (Must): Automatically flag participants whose current transition is overdue.  
* F-5 (Must): Generate a pre-filled, per-participant reminder message tied to the overdue transition.  
* F-6 (Must): Produce a daily "who to push today, with what message" list.  
* F-7 (Should): View the funnel in bulk as counts per state (for example 150 interested to 20 confirmed).  
* F-8 (Should): Import initial participants from the existing capture form or a CSV.  
* F-9 (Won't, v1): Auto-send reminders through an integration.

#### **A.2 Agency document layer**

* F-10 (Must): Upload or register agency documents (itinerary, budget) with a version label and date.  
* F-11 (Must): Mark exactly one version of each document type as "current," others show as superseded.  
* F-12 (Should): Record what changed between versions (free-text changelog).  
* F-13 (Must): Define the agency's price tiers by group size and show which tier the current confirmed count falls into, live.  
* F-14 (Could): Structured, machine-readable intake shared with the agency (gated on agency willingness, O-5).

#### **A.3 Distribution**

* F-15 (Must): Publish the current itinerary as a shareable link or file for the confirmed group.  
* F-16 (Should): Publish notices and reminders of payment-plan dates as shareable content.  
* F-16.1 (Should): Generate content ideas and image prompts to help the board create promotional material (for example stories, posts).

#### **A.4 Visit coordination**

* F-17 (Should): Track visit targets through contact → confirmation → day and time.  
* F-18 (Should): Generate a visit brief for the agency from confirmed visits.

#### **A.5 Roster and compliance**

* F-19 (Must): Maintain an operational roster with no sensitive fields.  
* F-20 (Should): Flag the mandatory accompanying professor as a required attendee for the trip.  
* F-21 (Won't, v1): Full institutional-compliance checklist (insurance, waivers, ratios), a module gated on O-3 and O-4.

### **B. Non-functional requirements**

* NF-1: Single-operator simple. Must be usable by one person with no onboarding support. LEAD uses it as an advanced configuration, and the professor case (future) sets the simplicity bar.  
* NF-2: Push-based, minimal student surface. No participant login in v1.  
* NF-3: Channel-native. Reminders formatted for WhatsApp, the tool never becomes a chat.  
* NF-4: Cheap to host, few moving parts. Built to be handed off to the 2028 board.  
* NF-5: Documented and portable. README plus data export, so the board can leave with its data.  
* NF-6: No sensitive data at rest in v1. Status flags only.  
* NF-7: Privacy-preserving defaults. No personal data in URLs, minimal data collection.

### **C. Data model (high level)**

Sensitive fields are intentionally referenced by status only, not stored.

* **Trip:** id, name, destination(s), key dates (contract, first payment, flights), accompanying-professor flag.  
* **Participant:** id, name, contact handle, current\_state, per-transition timestamps, F2\_complete (boolean, no underlying sensitive data), payment\_status (boolean).  
* **AgencyDocument:** id, trip\_id, type (itinerary/budget), version\_label, date, is\_current, changelog.  
* **PriceTier:** id, trip\_id, min\_group\_size, max\_group\_size, price\_per\_head, resolved live against the confirmed count.  
* **Visit:** id, trip\_id, target, status (contacted/confirmed), datetime.  
* **Reminder** (generated, not stored long-term): participant\_id, transition, message\_text.

### **D. Key workflows**

* **Daily chase:** the board opens the tool, sees the "push today" list, copies each pre-filled message, sends it on WhatsApp, and advances states as replies come in.  
* **New agency version:** the agency sends a new budget PDF, the board uploads it, labels the version, marks it current, notes what changed, and the tool re-resolves the current price tier against the confirmed count.  
* **Confirmation:** the participant signs the contract and pays the agency, the board marks contract signed and deposit confirmed, and the tool moves them to confirmed and adds them to the confirmed-group distribution list.  
* **Flight readiness:** the participant completes F2 and hands off the passport via the current channel, the board flips F2 complete and ready for flights, and the tool shows the count of flight-ready participants for the agency.

### **E. Open questions and dependencies**

Scope is locked to the student group, which resolves the biggest architectural fork (here the funnel is core, not a module). The following open items gate future scope, not the v1 build.

* **O-1:** Real funnel numbers from LEAD's last mission (interested to confirmed, number of reminders). Blocks: quantifies the core's value and sets the pilot baseline. How to close: pull from existing forms and chats.  
* **O-2:** How the participant contract is issued, under what legal personality, and how it's signed today. Blocks: whether "contract signed" can be auto-registered or only a manual check. How to close: internal team answer, consult the Tec area if needed.  
* **O-3:** The Tec's administrative and data requirements for a student trip (beyond the confirmed mandatory professor). Blocks: compliance module content, and whether sensitive data can ever come inside. How to close: Tec regulations plus interviews.  
* **O-4:** Which regulation mandates the accompanying professor, and what else it requires (insurance, waivers, ratios, authorizations). Blocks: reconstructing the full compliance module. How to close: Tec regulations.  
* **O-5:** Whether the agency would accept a structured intake, or whether its PDF flow is non-negotiable. Blocks: the ceiling of the document layer (version register vs shared single source of truth). How to close: one meeting with the agency.  
* **O-6:** Whether the Tec already has or plans an internal system for this. Blocks: the strategic risk of a build-vs-buy incumbent. How to close: ask Semana Tec or Vicerrectoría once there's a pilot to show.

### **F. Risks and mitigations**

* **Adjacency to SquadTrip/WeTravel:** with the funnel at the center, the product nears trip-page, registration, and participant-tracking territory. Mitigation: defend the differentiators, which are (a) no payment processing, money goes straight to the agency, (b) the agency-relationship layer (versions, tiers, visit briefs) that no competitor has, and (c) institutional compliance. If v1 ends up being only the funnel, differentiation is insufficient.  
* **Generalizing before validating / fake modularity:** building abstractions the field never asked for. Mitigation: build the core against LEAD's real process, add exactly one module (community service) to test the abstraction, nothing more.  
* **Adoption:** the board reverts to Excel/WhatsApp. Mitigation: NF-1 (single-operator simple), the source-of-truth success metric, and the "net time saved from first use" bar.  
* **Handoff:** the tool dies with this year's board. Mitigation: NF-4 and NF-5, cheap hosting, few moving parts, README, and data export.  
* **Agency won't change:** the PDF flow is non-negotiable. Mitigation: design around the behavior (version register), not against it. O-5 may relax this.

### **G. Phasing**

* **Phase 0 — Probes:** close the open items answerable by conversation (O-1, O-2, and as much of O-3 and O-5 as possible) before writing product code.  
* **Phase 1 — v1:** build the scope-section core with LEAD's playbook as initial templates, plus one module (community service) to test the abstraction.  
* **Phase 2 — Field pilot:** run the tool on a real student-group mission, measure against the O-1 baseline.  
* **Phase 3 — Decision:** with pilot data, decide between (a) pursuing the institution as customer, (b) exploring the agency channel, or (c) closing the project, documented and handed to the 2028 board. Option (c) is already a win by design.

### **H. Standing assumptions**

* The student-group funnel mapped in the source doc is representative of this scope. (Core hypothesis for this scope.)  
* The agency won't change how it works (PDFs), the product is designed around that behavior, not against it. (O-5 may relax it.)  
* Participants pay the agency directly, the intermediary handles no money. (Team assumption.)  
* The board would adopt a tool that saves net time from the first use.  
* There's a gap between what the Tec's official system covers and what the organizer needs. (Hypothesis, O-3 and O-6.)


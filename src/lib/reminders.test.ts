import { describe, expect, it } from "vitest";
import { FUNNEL_STATES } from "@/lib/funnel";
import {
  buildPushList,
  computeSnoozedUntil,
  isNudgedToday,
  isSnoozed,
  renderReminderMessage,
  type ParticipantForPushList,
} from "@/lib/reminders";

const baseTrip = {
  contractDate: null as Date | null,
  contractSignedDeadlineDays: null as number | null,
  firstPaymentDate: null as Date | null,
  depositConfirmedDeadlineDays: null as number | null,
  gracePeriodDays: 0,
};

function makeParticipant(overrides: Partial<ParticipantForPushList> = {}): ParticipantForPushList {
  return {
    id: "p1",
    firstName: "Ana",
    currentState: FUNNEL_STATES.CONTRACT_SENT,
    withdrawn: false,
    contractSigned: false,
    depositConfirmed: false,
    stateChangedAt: new Date("2026-01-01T00:00:00Z"),
    snoozedUntil: null,
    lastRemindedAt: null,
    ...overrides,
  };
}

describe("renderReminderMessage (TC-016)", () => {
  const deadline = new Date("2026-02-01T00:00:00Z");

  it("interpolates first name and deadline for contractSigned", () => {
    const message = renderReminderMessage("contractSigned", "Ana", deadline);
    expect(message).toContain("Ana");
    expect(message).toContain("1 de febrero de 2026");
  });

  it("produces a distinct message for depositConfirmed (that exact transition)", () => {
    const contractMessage = renderReminderMessage("contractSigned", "Ana", deadline);
    const depositMessage = renderReminderMessage("depositConfirmed", "Ana", deadline);
    expect(depositMessage).not.toBe(contractMessage);
    expect(depositMessage).toContain("depósito");
  });

  it("never contains a URL or wa.me deep link (TC-017 content guarantee)", () => {
    for (const key of ["contractSigned", "depositConfirmed"] as const) {
      const message = renderReminderMessage(key, "Ana", deadline);
      expect(message).not.toMatch(/https?:\/\//);
      expect(message).not.toMatch(/wa\.me/);
    }
  });
});

describe("buildPushList (TC-018, TC-019)", () => {
  it("groups overdue participants by transition, most-overdue-first, excluding snoozed", () => {
    const now = new Date("2026-03-01T00:00:00Z");
    const overdueOld = makeParticipant({
      id: "old",
      currentState: FUNNEL_STATES.CONTRACT_SENT,
    });
    const overdueRecent = makeParticipant({
      id: "recent",
      currentState: FUNNEL_STATES.CONTRACT_SENT,
    });
    const snoozed = makeParticipant({
      id: "snoozed",
      currentState: FUNNEL_STATES.CONTRACT_SENT,
      snoozedUntil: new Date("2026-03-10T00:00:00Z"),
    });

    const trip = { ...baseTrip, contractDate: new Date("2026-01-01T00:00:00Z") };
    const groups = buildPushList([overdueOld, overdueRecent, snoozed], trip, now);

    const contractSignedGroup = groups.find((g) => g.key === "contractSigned")!;
    expect(contractSignedGroup.entries.map((e) => e.participant.id).sort()).toEqual(["old", "recent"]);
    expect(contractSignedGroup.entries.some((e) => e.participant.id === "snoozed")).toBe(false);
  });

  it("orders a group most-overdue-first when deadlines differ", () => {
    const now = new Date("2026-03-01T00:00:00Z");
    const soonOverdue = makeParticipant({ id: "soon", stateChangedAt: new Date("2026-02-01T00:00:00Z") });
    const longOverdue = makeParticipant({ id: "long", stateChangedAt: new Date("2025-12-01T00:00:00Z") });

    const trip = { ...baseTrip, contractSignedDeadlineDays: 10 };
    const groups = buildPushList([soonOverdue, longOverdue], trip, now);
    const entries = groups.find((g) => g.key === "contractSigned")!.entries;

    expect(entries.map((e) => e.participant.id)).toEqual(["long", "soon"]);
    expect(entries[0].daysOverdue).toBeGreaterThan(entries[1].daysOverdue);
  });

  it("excludes Withdrawn/Declined participants (TC-019)", () => {
    const now = new Date("2026-03-01T00:00:00Z");
    const withdrawn = makeParticipant({
      id: "withdrawn",
      currentState: FUNNEL_STATES.WITHDRAWN,
      withdrawn: true,
    });
    const trip = { ...baseTrip, contractDate: new Date("2026-01-01T00:00:00Z") };

    const groups = buildPushList([withdrawn], trip, now);
    expect(groups.every((g) => g.entries.length === 0)).toBe(true);
  });

  it("lists a participant in both groups when racing two deadlines at once", () => {
    const now = new Date("2026-03-01T00:00:00Z");
    const bothPending = makeParticipant({ id: "both" });
    const trip = {
      ...baseTrip,
      contractDate: new Date("2026-01-01T00:00:00Z"),
      firstPaymentDate: new Date("2026-01-15T00:00:00Z"),
    };

    const groups = buildPushList([bothPending], trip, now);
    expect(groups.every((g) => g.entries.some((e) => e.participant.id === "both"))).toBe(true);
  });
});

describe("isSnoozed / computeSnoozedUntil (TC-021)", () => {
  it("snoozing for N days excludes the participant until N days have passed", () => {
    const now = new Date("2026-01-01T00:00:00Z");
    const snoozedUntil = computeSnoozedUntil(3, now);

    expect(isSnoozed({ snoozedUntil }, now)).toBe(true);
    expect(isSnoozed({ snoozedUntil }, new Date("2026-01-02T12:00:00Z"))).toBe(true);
    expect(isSnoozed({ snoozedUntil }, new Date("2026-01-04T00:00:00Z"))).toBe(false);
  });

  it("a participant with no snooze is never considered snoozed", () => {
    expect(isSnoozed({ snoozedUntil: null }, new Date())).toBe(false);
  });
});

describe("dismiss-as-snooze(1) semantics (TC-022)", () => {
  it("hides the participant for the rest of today and shows them again tomorrow", () => {
    const now = new Date("2026-01-01T15:00:00Z");
    const dismissedUntil = computeSnoozedUntil(1, now);

    expect(isSnoozed({ snoozedUntil: dismissedUntil }, new Date("2026-01-01T23:59:00Z"))).toBe(true);
    expect(isSnoozed({ snoozedUntil: dismissedUntil }, new Date("2026-01-02T00:00:00Z"))).toBe(false);
  });
});

describe("isNudgedToday (TC-020)", () => {
  it("is true only for the same UTC day", () => {
    const now = new Date("2026-01-05T10:00:00Z");
    expect(isNudgedToday(new Date("2026-01-05T00:00:01Z"), now)).toBe(true);
    expect(isNudgedToday(new Date("2026-01-04T23:59:59Z"), now)).toBe(false);
    expect(isNudgedToday(null, now)).toBe(false);
  });
});

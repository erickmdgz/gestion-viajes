import { describe, expect, it } from "vitest";
import {
  FUNNEL_STATES,
  deriveState,
  isConfirmed,
  resolveTransitionDeadline,
  getPendingTransitions,
  isParticipantOverdue,
} from "@/lib/funnel";

describe("deriveState", () => {
  it("stays at the pre-contract state with no flags set", () => {
    expect(
      deriveState(FUNNEL_STATES.REGISTERED_F1, {
        contractSigned: false,
        depositConfirmed: false,
        withdrawn: false,
      }),
    ).toBe(FUNNEL_STATES.REGISTERED_F1);
  });

  it("advances to Contract signed when only that flag is set", () => {
    expect(
      deriveState(FUNNEL_STATES.CONTRACT_SENT, {
        contractSigned: true,
        depositConfirmed: false,
        withdrawn: false,
      }),
    ).toBe(FUNNEL_STATES.CONTRACT_SIGNED);
  });

  it("auto-derives Confirmed when both flags are true (TC-011)", () => {
    expect(
      deriveState(FUNNEL_STATES.CONTRACT_SIGNED, {
        contractSigned: true,
        depositConfirmed: true,
        withdrawn: false,
      }),
    ).toBe(FUNNEL_STATES.CONFIRMED);
  });

  it("regresses to the remaining flag's state when the other is cleared (TC-012)", () => {
    expect(
      deriveState(FUNNEL_STATES.CONFIRMED, {
        contractSigned: true,
        depositConfirmed: false,
        withdrawn: false,
      }),
    ).toBe(FUNNEL_STATES.CONTRACT_SIGNED);
  });

  it("floors at Contract sent when both flags are cleared, never below it", () => {
    expect(
      deriveState(FUNNEL_STATES.CONFIRMED, {
        contractSigned: false,
        depositConfirmed: false,
        withdrawn: false,
      }),
    ).toBe(FUNNEL_STATES.CONTRACT_SENT);
  });

  it("withdrawn wins unconditionally regardless of other flags", () => {
    expect(
      deriveState(FUNNEL_STATES.CONFIRMED, {
        contractSigned: true,
        depositConfirmed: true,
        withdrawn: true,
      }),
    ).toBe(FUNNEL_STATES.WITHDRAWN);
  });
});

describe("isConfirmed", () => {
  it("is true only when both flags are true", () => {
    expect(isConfirmed({ contractSigned: true, depositConfirmed: true })).toBe(true);
    expect(isConfirmed({ contractSigned: true, depositConfirmed: false })).toBe(false);
  });
});

describe("resolveTransitionDeadline", () => {
  const enteredAt = new Date("2026-01-01T00:00:00Z");

  it("prefers the absolute date when set", () => {
    const absolute = new Date("2026-02-01T00:00:00Z");
    expect(resolveTransitionDeadline(absolute, 10, enteredAt)).toEqual(absolute);
  });

  it("falls back to N days after enteredAt when no absolute date is set", () => {
    const deadline = resolveTransitionDeadline(null, 10, enteredAt);
    expect(deadline?.toISOString()).toBe("2026-01-11T00:00:00.000Z");
  });

  it("returns null when neither source is set", () => {
    expect(resolveTransitionDeadline(null, null, enteredAt)).toBeNull();
  });
});

describe("getPendingTransitions / isParticipantOverdue", () => {
  const baseTrip = {
    contractDate: null as Date | null,
    contractSignedDeadlineDays: null as number | null,
    firstPaymentDate: null as Date | null,
    depositConfirmedDeadlineDays: null as number | null,
    gracePeriodDays: 0,
  };

  it("flags a participant overdue the day after a past deadline (TC-013)", () => {
    const participant = {
      currentState: FUNNEL_STATES.CONTRACT_SENT,
      withdrawn: false,
      contractSigned: false,
      depositConfirmed: false,
      stateChangedAt: new Date("2026-01-01T00:00:00Z"),
    };
    const trip = { ...baseTrip, contractDate: new Date("2026-01-10T00:00:00Z") };
    const now = new Date("2026-01-12T00:00:00Z");

    expect(isParticipantOverdue(participant, trip, now)).toBe(true);
  });

  it("does not flag a Withdrawn/Declined participant even with a past deadline (TC-014)", () => {
    const participant = {
      currentState: FUNNEL_STATES.WITHDRAWN,
      withdrawn: true,
      contractSigned: false,
      depositConfirmed: false,
      stateChangedAt: new Date("2026-01-01T00:00:00Z"),
    };
    const trip = { ...baseTrip, contractDate: new Date("2026-01-10T00:00:00Z") };
    const now = new Date("2026-01-12T00:00:00Z");

    expect(isParticipantOverdue(participant, trip, now)).toBe(false);
  });

  it("does not flag a pre-contract participant (no clock runs before Contract sent)", () => {
    const participant = {
      currentState: FUNNEL_STATES.REGISTERED_F1,
      withdrawn: false,
      contractSigned: false,
      depositConfirmed: false,
      stateChangedAt: new Date("2020-01-01T00:00:00Z"),
    };
    const trip = { ...baseTrip, contractDate: new Date("2020-02-01T00:00:00Z") };

    expect(isParticipantOverdue(participant, trip, new Date("2026-01-01T00:00:00Z"))).toBe(false);
  });

  it("is not overdue before the deadline has passed", () => {
    const participant = {
      currentState: FUNNEL_STATES.CONTRACT_SENT,
      withdrawn: false,
      contractSigned: false,
      depositConfirmed: false,
      stateChangedAt: new Date("2026-01-01T00:00:00Z"),
    };
    const trip = { ...baseTrip, contractDate: new Date("2026-06-01T00:00:00Z") };

    expect(isParticipantOverdue(participant, trip, new Date("2026-01-02T00:00:00Z"))).toBe(false);
  });

  it("can race two pending transitions at once while sitting at Contract sent", () => {
    const participant = {
      currentState: FUNNEL_STATES.CONTRACT_SENT,
      withdrawn: false,
      contractSigned: false,
      depositConfirmed: false,
      stateChangedAt: new Date("2026-01-01T00:00:00Z"),
    };
    const trip = {
      ...baseTrip,
      contractDate: new Date("2026-02-01T00:00:00Z"),
      firstPaymentDate: new Date("2026-03-01T00:00:00Z"),
    };

    const pending = getPendingTransitions(participant, trip, new Date("2026-01-15T00:00:00Z"));
    expect(pending.map((t) => t.key)).toEqual(["contractSigned", "depositConfirmed"]);
  });
});

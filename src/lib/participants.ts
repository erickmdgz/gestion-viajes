import { prisma } from "@/lib/prisma";
import type { Participant } from "@prisma/client";
import { FUNNEL_STATES, type FunnelState, deriveState, isConfirmed } from "@/lib/funnel";
import { computeSnoozedUntil } from "@/lib/reminders";
import type { F1RegistrationInput } from "@/lib/f1Registration";

const PRE_CONTRACT_STATES: string[] = [FUNNEL_STATES.INTERESTED, FUNNEL_STATES.REGISTERED_F1];

export type NewParticipantInput = {
  firstName: string;
  lastName: string;
  email: string;
  initialState: typeof FUNNEL_STATES.INTERESTED | typeof FUNNEL_STATES.REGISTERED_F1;
};

// Board-manual add path (FR-004). Participants may also enter via the F1
// form (FR-001, a separate FEAT) — this is the board-side path only.
export function addParticipantRecord(
  tripId: string,
  data: NewParticipantInput,
  operatorEmail: string,
): Promise<Participant> {
  return prisma.participant.create({
    data: {
      tripId,
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      currentState: data.initialState,
      stateChangedAt: new Date(),
      stateChangedBy: operatorEmail,
    },
  });
}

// Public self-registration path (FR-001, FEAT-001). No operator acts here —
// `stateChangedBy` stays null — unlike the board-manual path (FR-004).
export function registerParticipantViaF1(
  tripId: string,
  data: F1RegistrationInput,
): Promise<Participant> {
  const now = new Date();
  return prisma.participant.create({
    data: {
      tripId,
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      preferredName: data.preferredName || null,
      studentId: data.studentId,
      age: data.age,
      career: data.career,
      semester: data.semester,
      phone: data.phone,
      instagram: data.instagram || null,
      nationality: data.nationality,
      passportStatus: data.passportStatus,
      visaStatus: data.visaStatus,
      whatsappGroupConsent: data.whatsappGroupConsent,
      privacyConsent: data.privacyConsent,
      consentTimestamp: now,
      currentState: FUNNEL_STATES.REGISTERED_F1,
      stateChangedAt: now,
    },
  });
}

// Board action moving a participant out of the pre-contract states. This is
// the only path into "Contract sent" — no participant deadline applies to
// this transition (FR-003 AC2); the overdue clock only starts afterward.
export async function markContractSent(
  participantId: string,
  operatorEmail: string,
): Promise<Participant> {
  const participant = await prisma.participant.findUniqueOrThrow({ where: { id: participantId } });
  if (!PRE_CONTRACT_STATES.includes(participant.currentState)) {
    throw new Error(`Cannot mark contract sent from state "${participant.currentState}"`);
  }
  return prisma.participant.update({
    where: { id: participantId },
    data: {
      currentState: FUNNEL_STATES.CONTRACT_SENT,
      stateChangedAt: new Date(),
      stateChangedBy: operatorEmail,
    },
  });
}

// Sets or clears an independent transition flag (FR-005). Requires the
// participant to have already reached "Contract sent" — the board never
// sets Confirmed directly; it is always derived from the two flags.
export async function applyTransitionFlag(
  participantId: string,
  flag: "contractSigned" | "depositConfirmed",
  value: boolean,
  operatorEmail: string,
): Promise<Participant> {
  const participant = await prisma.participant.findUniqueOrThrow({ where: { id: participantId } });
  if (PRE_CONTRACT_STATES.includes(participant.currentState)) {
    throw new Error("Cannot set a transition flag before the contract has been sent");
  }

  const flags = {
    contractSigned: flag === "contractSigned" ? value : participant.contractSigned,
    depositConfirmed: flag === "depositConfirmed" ? value : participant.depositConfirmed,
    withdrawn: participant.withdrawn,
  };

  return prisma.participant.update({
    where: { id: participantId },
    data: {
      contractSigned: flags.contractSigned,
      depositConfirmed: flags.depositConfirmed,
      confirmed: isConfirmed(flags),
      currentState: deriveState(participant.currentState as FunnelState, flags),
      stateChangedAt: new Date(),
      stateChangedBy: operatorEmail,
    },
  });
}

// Terminal state (§6.4). Historical flags (contractSigned, depositConfirmed,
// confirmed) are kept as-is, not cleared, so the record still reflects how
// far the participant got before dropping. Dropping ≠ deleting (FR-024).
export function withdrawParticipantRecord(
  participantId: string,
  operatorEmail: string,
  dropReason: string | null,
): Promise<Participant> {
  return prisma.participant.update({
    where: { id: participantId },
    data: {
      withdrawn: true,
      currentState: FUNNEL_STATES.WITHDRAWN,
      dropReason,
      stateChangedAt: new Date(),
      stateChangedBy: operatorEmail,
    },
  });
}

// FR-009: records the nudge (timestamp + counter) without touching the
// funnel state — no `stateChangedBy`-equivalent here, since none of
// FR-009's acceptance criteria require recording who nudged/snoozed.
export function recordNudgeRecord(participantId: string): Promise<Participant> {
  return prisma.participant.update({
    where: { id: participantId },
    data: { lastRemindedAt: new Date(), reminderCount: { increment: 1 } },
  });
}

export function snoozeParticipantRecord(participantId: string, days: number): Promise<Participant> {
  return prisma.participant.update({
    where: { id: participantId },
    data: { snoozedUntil: computeSnoozedUntil(days) },
  });
}

// Dismiss = snooze for 1 day (start of the next UTC calendar day) — same
// `snoozedUntil` field, no separate "dismissed today" flag (FR-009).
export function dismissParticipantTodayRecord(participantId: string): Promise<Participant> {
  return snoozeParticipantRecord(participantId, 1);
}

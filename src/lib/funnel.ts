// Pure funnel state machine + overdue math (FEAT-004, FR-005/FR-006).
// No Prisma/Next imports here so this stays trivially unit-testable.

export const FUNNEL_STATES = {
  INTERESTED: "Interested",
  REGISTERED_F1: "Registered (F1)",
  CONTRACT_SENT: "Contract sent",
  CONTRACT_SIGNED: "Contract signed",
  DEPOSIT_CONFIRMED: "Deposit confirmed",
  CONFIRMED: "Confirmed",
  F2_COMPLETE: "F2 complete",
  WITHDRAWN: "Withdrawn/Declined",
} as const;

export type FunnelState = (typeof FUNNEL_STATES)[keyof typeof FUNNEL_STATES];

const PRE_CONTRACT_STATES: FunnelState[] = [
  FUNNEL_STATES.INTERESTED,
  FUNNEL_STATES.REGISTERED_F1,
];

export type TransitionFlags = {
  contractSigned: boolean;
  depositConfirmed: boolean;
  withdrawn: boolean;
};

// Derives current_state from the flags (§6.3/§6.5, FR-005). `confirmed` is
// never hand-set; a regression floors at "Contract sent" — it never falls
// back to a pre-contract state once the board has sent the contract.
export function deriveState(
  currentState: FunnelState,
  flags: TransitionFlags,
): FunnelState {
  if (flags.withdrawn) return FUNNEL_STATES.WITHDRAWN;
  if (flags.contractSigned && flags.depositConfirmed) return FUNNEL_STATES.CONFIRMED;
  if (flags.depositConfirmed) return FUNNEL_STATES.DEPOSIT_CONFIRMED;
  if (flags.contractSigned) return FUNNEL_STATES.CONTRACT_SIGNED;
  if (PRE_CONTRACT_STATES.includes(currentState)) return currentState;
  return FUNNEL_STATES.CONTRACT_SENT;
}

export function isConfirmed(flags: Pick<TransitionFlags, "contractSigned" | "depositConfirmed">): boolean {
  return flags.contractSigned && flags.depositConfirmed;
}

export type ParticipantForOverdue = {
  currentState: string;
  withdrawn: boolean;
  contractSigned: boolean;
  depositConfirmed: boolean;
  stateChangedAt: Date;
};

export type TripForOverdue = {
  contractDate: Date | null;
  contractSignedDeadlineDays: number | null;
  firstPaymentDate: Date | null;
  depositConfirmedDeadlineDays: number | null;
  gracePeriodDays: number;
};

// Absolute date wins when set; otherwise N days after `enteredAt`; otherwise
// there is no deadline for this transition (FR-003).
export function resolveTransitionDeadline(
  absoluteDate: Date | null,
  relativeDays: number | null,
  enteredAt: Date,
): Date | null {
  if (absoluteDate) return absoluteDate;
  if (relativeDays != null) {
    const deadline = new Date(enteredAt);
    deadline.setUTCDate(deadline.getUTCDate() + relativeDays);
    return deadline;
  }
  return null;
}

export type PendingTransition = {
  key: "contractSigned" | "depositConfirmed";
  label: string;
  deadline: Date | null;
  overdue: boolean;
};

// Plain UTC calendar-day arithmetic (no timezone-aware library) — v1
// accepts a few hours of error near a midnight boundary; Trip.timezone is
// persisted but not yet consumed here (see docs_en/07_data_model.md).
function isPastDeadline(deadline: Date, gracePeriodDays: number, now: Date): boolean {
  const cutoff = new Date(deadline);
  cutoff.setUTCDate(cutoff.getUTCDate() + gracePeriodDays + 1);
  return now >= cutoff;
}

// Returns the still-pending transition(s) for a participant who has at
// least reached "Contract sent" (no clock runs before that board action —
// FR-003 AC2). A participant sitting at "Contract sent" can be racing both
// deadlines at once. Withdrawn participants are excluded (FR-006).
export function getPendingTransitions(
  participant: ParticipantForOverdue,
  trip: TripForOverdue,
  now: Date = new Date(),
): PendingTransition[] {
  if (participant.withdrawn) return [];
  if (PRE_CONTRACT_STATES.includes(participant.currentState as FunnelState)) return [];

  const pending: PendingTransition[] = [];

  if (!participant.contractSigned) {
    const deadline = resolveTransitionDeadline(
      trip.contractDate,
      trip.contractSignedDeadlineDays,
      participant.stateChangedAt,
    );
    pending.push({
      key: "contractSigned",
      label: "Contract signed",
      deadline,
      overdue: deadline != null && isPastDeadline(deadline, trip.gracePeriodDays, now),
    });
  }

  if (!participant.depositConfirmed) {
    const deadline = resolveTransitionDeadline(
      trip.firstPaymentDate,
      trip.depositConfirmedDeadlineDays,
      participant.stateChangedAt,
    );
    pending.push({
      key: "depositConfirmed",
      label: "Deposit confirmed",
      deadline,
      overdue: deadline != null && isPastDeadline(deadline, trip.gracePeriodDays, now),
    });
  }

  return pending;
}

export function isParticipantOverdue(
  participant: ParticipantForOverdue,
  trip: TripForOverdue,
  now: Date = new Date(),
): boolean {
  return getPendingTransitions(participant, trip, now).some((t) => t.overdue);
}

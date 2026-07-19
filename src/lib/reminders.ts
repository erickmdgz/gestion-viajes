// Pure daily-push-list logic + reminder message templates (FEAT-005,
// FR-007/FR-008/FR-009). No Prisma/Next imports here, same convention as
// funnel.ts.

import {
  getPendingTransitions,
  type ParticipantForOverdue,
  type TripForOverdue,
  type PendingTransition,
} from "@/lib/funnel";

export type TransitionKey = PendingTransition["key"];

export type ParticipantForPushList = ParticipantForOverdue & {
  id: string;
  firstName: string;
  snoozedUntil: Date | null;
  lastRemindedAt: Date | null;
};

export type PushListEntry = {
  participant: ParticipantForPushList;
  transition: PendingTransition;
  daysOverdue: number;
};

export type PushListGroup = {
  key: TransitionKey;
  label: string;
  entries: PushListEntry[];
};

const GROUP_ORDER: TransitionKey[] = ["contractSigned", "depositConfirmed"];
const GROUP_LABELS: Record<TransitionKey, string> = {
  contractSigned: "Contract signed",
  depositConfirmed: "Deposit confirmed",
};

// Same-UTC-day comparison — a snooze/reminder timestamp from a previous day
// never counts as "today" once the UTC date has rolled over.
function isSameUtcDay(a: Date, b: Date): boolean {
  return (
    a.getUTCFullYear() === b.getUTCFullYear() &&
    a.getUTCMonth() === b.getUTCMonth() &&
    a.getUTCDate() === b.getUTCDate()
  );
}

export function isSnoozed(participant: { snoozedUntil: Date | null }, now: Date = new Date()): boolean {
  return participant.snoozedUntil != null && now < participant.snoozedUntil;
}

export function isNudgedToday(lastRemindedAt: Date | null, now: Date = new Date()): boolean {
  return lastRemindedAt != null && isSameUtcDay(lastRemindedAt, now);
}

// Start of the UTC calendar day `days` days from now. Dismissing today's
// nudge is `computeSnoozedUntil(1, now)` — the same field, no separate
// "dismissed" flag (§7.2, FR-009).
export function computeSnoozedUntil(days: number, now: Date = new Date()): Date {
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  start.setUTCDate(start.getUTCDate() + days);
  return start;
}

function daysOverdue(deadline: Date, now: Date): number {
  return Math.floor((now.getTime() - deadline.getTime()) / 86_400_000);
}

// Grouped by transition, most-overdue-first within each group, excluding
// withdrawn and snoozed/dismissed participants (FR-008). A participant
// racing both deadlines at once can legitimately appear in both groups.
export function buildPushList(
  participants: ParticipantForPushList[],
  trip: TripForOverdue,
  now: Date = new Date(),
): PushListGroup[] {
  const byKey: Record<TransitionKey, PushListEntry[]> = {
    contractSigned: [],
    depositConfirmed: [],
  };

  for (const participant of participants) {
    if (participant.withdrawn) continue;
    if (isSnoozed(participant, now)) continue;

    for (const transition of getPendingTransitions(participant, trip, now)) {
      if (!transition.overdue || !transition.deadline) continue;
      byKey[transition.key].push({
        participant,
        transition,
        daysOverdue: daysOverdue(transition.deadline, now),
      });
    }
  }

  return GROUP_ORDER.map((key) => ({
    key,
    label: GROUP_LABELS[key],
    entries: byKey[key].sort(
      (a, b) => a.transition.deadline!.getTime() - b.transition.deadline!.getTime(),
    ),
  }));
}

const SPANISH_MONTHS = [
  "enero", "febrero", "marzo", "abril", "mayo", "junio",
  "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
];

function formatDeadlineEs(deadline: Date): string {
  return `${deadline.getUTCDate()} de ${SPANISH_MONTHS[deadline.getUTCMonth()]} de ${deadline.getUTCFullYear()}`;
}

// One template per transition (§7.4, FR-007). Spanish, informal-respectful
// draft copy — [PROPOSED — confirm], the team should review the exact
// wording. No {amount}/{payment_reference}: Solanum has no price/payment
// fields yet (FR-013 is a separate, not-yet-built feature).
const REMINDER_TEMPLATES: Record<TransitionKey, (firstName: string, deadline: string) => string> = {
  contractSigned: (firstName, deadline) =>
    `Hola ${firstName}, te escribimos de la mesa directiva del viaje. Vimos que la firma del ` +
    `contrato sigue pendiente; la fecha límite era el ${deadline}. ¿Nos ayudas a firmarlo en cuanto ` +
    `puedas? Cualquier duda, aquí estamos. ¡Gracias!`,
  depositConfirmed: (firstName, deadline) =>
    `Hola ${firstName}, te escribimos de la mesa directiva del viaje. Vimos que la confirmación del ` +
    `depósito sigue pendiente; la fecha límite era el ${deadline}. ¿Nos ayudas a confirmarlo en ` +
    `cuanto puedas? Cualquier duda, aquí estamos. ¡Gracias!`,
};

export function renderReminderMessage(
  transitionKey: TransitionKey,
  firstName: string,
  deadline: Date,
): string {
  return REMINDER_TEMPLATES[transitionKey](firstName, formatDeadlineEs(deadline));
}

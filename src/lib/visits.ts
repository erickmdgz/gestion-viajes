import { prisma } from "@/lib/prisma";
import type { Visit } from "@prisma/client";

export const VISIT_STATUSES = {
  CONTACT: "contact",
  CONFIRMED: "confirmed",
  SCHEDULED: "scheduled",
} as const;

export type NewVisitInput = {
  targetName: string;
  targetType: "company" | "institution" | null;
  notes: string | null;
};

// FR-017. Every visit starts at "contact" — the board hasn't confirmed
// anything with the target yet.
export function registerVisitRecord(tripId: string, data: NewVisitInput): Promise<Visit> {
  return prisma.visit.create({ data: { tripId, ...data, status: VISIT_STATUSES.CONTACT } });
}

export function listVisitsForTrip(tripId: string): Promise<Visit[]> {
  return prisma.visit.findMany({ where: { tripId }, orderBy: { createdAt: "asc" } });
}

// Board action advancing "contact" -> "confirmed". Rejects from any other
// status, mirroring the pre-contract/F2-eligibility gate pattern already
// used for participants.
export async function markVisitConfirmed(visitId: string): Promise<Visit> {
  const visit = await prisma.visit.findUniqueOrThrow({ where: { id: visitId } });
  if (visit.status !== VISIT_STATUSES.CONTACT) {
    throw new Error(`Cannot confirm a visit from status "${visit.status}"`);
  }
  return prisma.visit.update({ where: { id: visitId }, data: { status: VISIT_STATUSES.CONFIRMED } });
}

// Setting a day/time is what advances "confirmed" -> "scheduled" (FR-017
// AC2). Only callable once the target is confirmed.
export async function scheduleVisit(
  visitId: string,
  scheduledDate: Date,
  scheduledTime: string,
): Promise<Visit> {
  const visit = await prisma.visit.findUniqueOrThrow({ where: { id: visitId } });
  if (visit.status !== VISIT_STATUSES.CONFIRMED) {
    throw new Error(`Cannot schedule a visit from status "${visit.status}"`);
  }
  return prisma.visit.update({
    where: { id: visitId },
    data: { status: VISIT_STATUSES.SCHEDULED, scheduledDate, scheduledTime },
  });
}

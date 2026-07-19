import { prisma } from "@/lib/prisma";
import type { Participant, Trip } from "@prisma/client";

export type NewTripInput = {
  name: string;
  registrationClose: Date | null;
  contractDate: Date | null;
  contractSignedDeadlineDays: number | null;
  firstPaymentDate: Date | null;
  depositConfirmedDeadlineDays: number | null;
  flightsDate: Date | null;
  gracePeriodDays: number;
  timezone: string;
};

export function createTripRecord(data: NewTripInput): Promise<Trip> {
  return prisma.trip.create({ data });
}

export function listTrips(): Promise<Trip[]> {
  return prisma.trip.findMany({ orderBy: { createdAt: "desc" } });
}

// Used by the public F1 page (FEAT-001) — avoids loading participant data
// for an unauthenticated route that only needs to confirm the trip exists.
export function getTripById(tripId: string): Promise<Trip | null> {
  return prisma.trip.findUnique({ where: { id: tripId } });
}

export type TripWithParticipants = Trip & { participants: Participant[] };

export function getTripWithParticipants(tripId: string): Promise<TripWithParticipants | null> {
  return prisma.trip.findUnique({
    where: { id: tripId },
    include: { participants: { orderBy: { createdAt: "asc" } } },
  });
}

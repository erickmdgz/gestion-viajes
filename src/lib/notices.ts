import { prisma } from "@/lib/prisma";
import type { Notice } from "@prisma/client";
import { getCurrentDocument } from "@/lib/agencyDocuments";

const ITINERARY_TYPE = "itinerary";

// FR-014: publishing is gated on a current itinerary document already
// existing (mirrors TC-031's own precondition). Idempotent — publishing
// again just refreshes publishedAt, no "already published" error.
export async function publishItinerary(tripId: string): Promise<Notice> {
  const current = await getCurrentDocument(tripId, ITINERARY_TYPE);
  if (!current) {
    throw new Error("No current itinerary document to publish");
  }
  return prisma.notice.upsert({
    where: { tripId_type: { tripId, type: ITINERARY_TYPE } },
    update: { publishedAt: new Date() },
    create: {
      tripId,
      type: ITINERARY_TYPE,
      contentRef: `/share/${tripId}/itinerary`,
      publishedAt: new Date(),
    },
  });
}

export function getItineraryNotice(tripId: string): Promise<Notice | null> {
  return prisma.notice.findUnique({ where: { tripId_type: { tripId, type: ITINERARY_TYPE } } });
}

// The live lookup the public share page resolves against on every visit —
// not a snapshot. When the board marks a new version current later
// (FR-011), this starts returning the new fileRef with no republish step,
// which is what makes FR-014's TC-032 true.
export async function resolvePublishedItineraryFileRef(tripId: string): Promise<string | null> {
  const notice = await getItineraryNotice(tripId);
  if (!notice?.publishedAt) return null;
  const current = await getCurrentDocument(tripId, ITINERARY_TYPE);
  return current?.fileRef ?? null;
}

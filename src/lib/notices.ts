import { prisma } from "@/lib/prisma";
import type { Notice } from "@prisma/client";
import { getCurrentDocument } from "@/lib/agencyDocuments";

const ITINERARY_TYPE = "itinerary";

// FR-014: publishing is gated on a current itinerary document already
// existing (mirrors TC-031's own precondition). Idempotent — publishing
// again just refreshes publishedAt, no "already published" error.
//
// Itinerary is a single mutable "current" slot per (trip, type) — unlike
// notice/payment-reminder (FEAT-009), which accumulate as a feed. That
// singleton behavior is enforced here in application code (find the
// existing row, or create one) rather than a DB unique constraint, since
// the constraint would incorrectly block the feed types from having more
// than one row per (trip, type).
export async function publishItinerary(tripId: string): Promise<Notice> {
  const current = await getCurrentDocument(tripId, ITINERARY_TYPE);
  if (!current) {
    throw new Error("No current itinerary document to publish");
  }
  const existing = await getItineraryNotice(tripId);
  if (existing) {
    return prisma.notice.update({ where: { id: existing.id }, data: { publishedAt: new Date() } });
  }
  return prisma.notice.create({
    data: {
      tripId,
      type: ITINERARY_TYPE,
      contentRef: `/share/${tripId}/itinerary`,
      publishedAt: new Date(),
    },
  });
}

export function getItineraryNotice(tripId: string): Promise<Notice | null> {
  return prisma.notice.findFirst({ where: { tripId, type: ITINERARY_TYPE } });
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

export type NoticeType = "notice" | "payment-reminder";
export type NewNoticeInput = { type: NoticeType; body: string };

// FR-015: free text authored directly in Solanum. Each publish is its own
// permanent row — a feed, not a slot — unlike publishItinerary above.
export function publishNotice(tripId: string, data: NewNoticeInput): Promise<Notice> {
  return prisma.notice.create({
    data: {
      tripId,
      type: data.type,
      body: data.body,
      contentRef: `/share/${tripId}/notices`,
      publishedAt: new Date(),
    },
  });
}

export function listPublishedNotices(tripId: string): Promise<Notice[]> {
  return prisma.notice.findMany({
    where: { tripId, type: { in: ["notice", "payment-reminder"] }, publishedAt: { not: null } },
    orderBy: { publishedAt: "desc" },
  });
}

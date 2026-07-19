import { prisma } from "@/lib/prisma";
import type { AgencyDocument } from "@prisma/client";

export type NewAgencyDocumentInput = {
  type: string;
  versionLabel: string;
  date: Date;
  changelog: string | null;
  fileRef: string | null;
};

// FR-010. `isCurrent` always starts false — FR-010 (register) and FR-011
// (mark current) are deliberately separate actions; keeping the isCurrent
// write to a single code path (markDocumentCurrent) is what lets that
// function guarantee the "exactly one per type" invariant.
export function registerDocumentRecord(
  tripId: string,
  data: NewAgencyDocumentInput,
): Promise<AgencyDocument> {
  return prisma.agencyDocument.create({ data: { tripId, ...data, isCurrent: false } });
}

export function listDocumentsForTrip(tripId: string): Promise<AgencyDocument[]> {
  return prisma.agencyDocument.findMany({
    where: { tripId },
    orderBy: [{ type: "asc" }, { date: "desc" }],
  });
}

// FR-014: the live lookup a published share link resolves against. Exact
// string match on `type` — SQLite's `=` is case-sensitive and Prisma's
// `mode: "insensitive"` isn't supported on SQLite; documented constraint,
// not engineered around (see docs_en/07_data_model.md).
export function getCurrentDocument(tripId: string, type: string): Promise<AgencyDocument | null> {
  return prisma.agencyDocument.findFirst({ where: { tripId, type, isCurrent: true } });
}

// FR-011: exactly one is_current per (trip, type), always — atomic via a
// transaction so a concurrent board member never observes two currents or
// zero for the same type.
export async function markDocumentCurrent(documentId: string): Promise<void> {
  const doc = await prisma.agencyDocument.findUniqueOrThrow({ where: { id: documentId } });
  await prisma.$transaction([
    prisma.agencyDocument.updateMany({
      where: { tripId: doc.tripId, type: doc.type, id: { not: documentId } },
      data: { isCurrent: false },
    }),
    prisma.agencyDocument.update({ where: { id: documentId }, data: { isCurrent: true } }),
  ]);
}

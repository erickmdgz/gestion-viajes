import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { PrismaClient } from "@prisma/client";
import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const dbPath = path.resolve(__dirname, "../../prisma/test-notices.db");
process.env.DATABASE_URL = `file:${dbPath}`;

execSync("npx prisma db push --skip-generate --accept-data-loss", {
  cwd: path.resolve(__dirname, "../.."),
  env: process.env,
  stdio: "ignore",
});

const prisma = new PrismaClient();

const { publishItinerary, getItineraryNotice, resolvePublishedItineraryFileRef } =
  await import("@/lib/notices");
const { registerDocumentRecord, markDocumentCurrent } = await import("@/lib/agencyDocuments");
const { createTripRecord } = await import("@/lib/trips");

async function seedTrip() {
  return createTripRecord({
    name: "Test trip",
    registrationClose: null,
    contractDate: null,
    contractSignedDeadlineDays: null,
    firstPaymentDate: null,
    depositConfirmedDeadlineDays: null,
    flightsDate: null,
    gracePeriodDays: 0,
    timezone: "America/Mexico_City",
  });
}

beforeEach(async () => {
  await prisma.notice.deleteMany();
  await prisma.agencyDocument.deleteMany();
  await prisma.trip.deleteMany();
});

afterAll(async () => {
  await prisma.$disconnect();
  fs.rmSync(dbPath, { force: true });
});

describe("resolvePublishedItineraryFileRef", () => {
  it("returns null when nothing was ever published", async () => {
    const trip = await seedTrip();
    expect(await resolvePublishedItineraryFileRef(trip.id)).toBeNull();
  });
});

describe("publishItinerary (TC-031)", () => {
  it("rejects publishing when there is no current itinerary document", async () => {
    const trip = await seedTrip();
    await expect(publishItinerary(trip.id)).rejects.toThrow();
  });

  it("publishes and resolves to the current itinerary document's fileRef", async () => {
    const trip = await seedTrip();
    const v1 = await registerDocumentRecord(trip.id, {
      type: "itinerary",
      versionLabel: "v1",
      date: new Date("2026-01-01T00:00:00Z"),
      changelog: null,
      fileRef: "https://drive.example.com/v1",
    });
    await markDocumentCurrent(v1.id);

    const notice = await publishItinerary(trip.id);
    expect(notice.publishedAt).not.toBeNull();
    expect(notice.contentRef).toBe(`/share/${trip.id}/itinerary`);

    expect(await resolvePublishedItineraryFileRef(trip.id)).toBe("https://drive.example.com/v1");
  });
});

describe("live resolution across a version change (TC-032)", () => {
  it("serves the new current version without a republish step", async () => {
    const trip = await seedTrip();
    const v1 = await registerDocumentRecord(trip.id, {
      type: "itinerary",
      versionLabel: "v1",
      date: new Date("2026-01-01T00:00:00Z"),
      changelog: null,
      fileRef: "https://drive.example.com/v1",
    });
    await markDocumentCurrent(v1.id);
    await publishItinerary(trip.id);

    expect(await resolvePublishedItineraryFileRef(trip.id)).toBe("https://drive.example.com/v1");

    const v2 = await registerDocumentRecord(trip.id, {
      type: "itinerary",
      versionLabel: "v2",
      date: new Date("2026-02-01T00:00:00Z"),
      changelog: "Updated day 3",
      fileRef: "https://drive.example.com/v2",
    });
    await markDocumentCurrent(v2.id);

    // No call to publishItinerary again -- the same published link now
    // resolves to v2 purely because v2 is current.
    expect(await resolvePublishedItineraryFileRef(trip.id)).toBe("https://drive.example.com/v2");
  });
});

describe("getItineraryNotice / re-publishing", () => {
  it("is idempotent -- publishing twice does not error and keeps one notice row", async () => {
    const trip = await seedTrip();
    const v1 = await registerDocumentRecord(trip.id, {
      type: "itinerary",
      versionLabel: "v1",
      date: new Date("2026-01-01T00:00:00Z"),
      changelog: null,
      fileRef: "https://drive.example.com/v1",
    });
    await markDocumentCurrent(v1.id);

    await publishItinerary(trip.id);
    await publishItinerary(trip.id);

    const notices = await prisma.notice.findMany({ where: { tripId: trip.id } });
    expect(notices).toHaveLength(1);
  });
});

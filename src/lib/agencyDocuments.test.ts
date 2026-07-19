import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { PrismaClient } from "@prisma/client";
import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const dbPath = path.resolve(__dirname, "../../prisma/test-agency-documents.db");
process.env.DATABASE_URL = `file:${dbPath}`;

execSync("npx prisma db push --skip-generate --accept-data-loss", {
  cwd: path.resolve(__dirname, "../.."),
  env: process.env,
  stdio: "ignore",
});

const prisma = new PrismaClient();

const { registerDocumentRecord, listDocumentsForTrip, markDocumentCurrent } =
  await import("@/lib/agencyDocuments");
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
  await prisma.agencyDocument.deleteMany();
  await prisma.trip.deleteMany();
});

afterAll(async () => {
  await prisma.$disconnect();
  fs.rmSync(dbPath, { force: true });
});

describe("registerDocumentRecord (TC-023)", () => {
  it("persists a document, not current by default, listed under its type", async () => {
    const trip = await seedTrip();

    await registerDocumentRecord(trip.id, {
      type: "itinerary",
      versionLabel: "v1",
      date: new Date("2026-01-01T00:00:00Z"),
      changelog: null,
      fileRef: null,
    });

    const documents = await listDocumentsForTrip(trip.id);
    expect(documents).toHaveLength(1);
    expect(documents[0].type).toBe("itinerary");
    expect(documents[0].isCurrent).toBe(false);
  });
});

describe("markDocumentCurrent (TC-025, TC-026)", () => {
  it("supersedes the previous current version of the same type", async () => {
    const trip = await seedTrip();
    const v1 = await registerDocumentRecord(trip.id, {
      type: "budget",
      versionLabel: "v1",
      date: new Date("2026-01-01T00:00:00Z"),
      changelog: null,
      fileRef: null,
    });
    const v2 = await registerDocumentRecord(trip.id, {
      type: "budget",
      versionLabel: "v2",
      date: new Date("2026-02-01T00:00:00Z"),
      changelog: null,
      fileRef: null,
    });
    const v3 = await registerDocumentRecord(trip.id, {
      type: "budget",
      versionLabel: "v3",
      date: new Date("2026-03-01T00:00:00Z"),
      changelog: null,
      fileRef: null,
    });

    await markDocumentCurrent(v3.id);
    let documents = await listDocumentsForTrip(trip.id);
    expect(documents.find((d) => d.id === v3.id)?.isCurrent).toBe(true);
    expect(documents.find((d) => d.id === v1.id)?.isCurrent).toBe(false);
    expect(documents.find((d) => d.id === v2.id)?.isCurrent).toBe(false);

    // Marking a different version current afterward: exactly one remains current.
    await markDocumentCurrent(v2.id);
    documents = await listDocumentsForTrip(trip.id);
    const currentOnes = documents.filter((d) => d.isCurrent);
    expect(currentOnes).toHaveLength(1);
    expect(currentOnes[0].id).toBe(v2.id);
  });

  it("does not affect documents of a different type", async () => {
    const trip = await seedTrip();
    const itinerary = await registerDocumentRecord(trip.id, {
      type: "itinerary",
      versionLabel: "v1",
      date: new Date("2026-01-01T00:00:00Z"),
      changelog: null,
      fileRef: null,
    });
    const budget = await registerDocumentRecord(trip.id, {
      type: "budget",
      versionLabel: "v1",
      date: new Date("2026-01-01T00:00:00Z"),
      changelog: null,
      fileRef: null,
    });

    await markDocumentCurrent(itinerary.id);
    const documents = await listDocumentsForTrip(trip.id);
    expect(documents.find((d) => d.id === budget.id)?.isCurrent).toBe(false);
  });
});

describe("changelog (TC-027)", () => {
  it("stores and returns a free-text changelog note with its version", async () => {
    const trip = await seedTrip();

    const doc = await registerDocumentRecord(trip.id, {
      type: "itinerary",
      versionLabel: "v2",
      date: new Date("2026-01-01T00:00:00Z"),
      changelog: "Added the museum visit on day 3.",
      fileRef: null,
    });

    const documents = await listDocumentsForTrip(trip.id);
    expect(documents.find((d) => d.id === doc.id)?.changelog).toBe("Added the museum visit on day 3.");
  });
});

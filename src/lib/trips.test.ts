import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { PrismaClient } from "@prisma/client";
import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

// Exercises the real Prisma write path against a throwaway SQLite file
// (catches wiring bugs the pure funnel.test.ts unit tests can't).
const dbPath = path.resolve(__dirname, "../../prisma/test-trips.db");
process.env.DATABASE_URL = `file:${dbPath}`;

execSync("npx prisma db push --skip-generate --accept-data-loss", {
  cwd: path.resolve(__dirname, "../.."),
  env: process.env,
  stdio: "ignore",
});

const prisma = new PrismaClient();

const { createTripRecord, listTrips, getTripWithParticipants } = await import("@/lib/trips");

beforeEach(async () => {
  await prisma.participant.deleteMany();
  await prisma.trip.deleteMany();
});

afterAll(async () => {
  await prisma.$disconnect();
  fs.rmSync(dbPath, { force: true });
});

describe("createTripRecord / listTrips (TC-006, TC-007)", () => {
  it("persists a trip with an absolute deadline and a relative fallback", async () => {
    const trip = await createTripRecord({
      name: "Spring mission",
      registrationClose: null,
      contractDate: new Date("2026-02-01T00:00:00Z"),
      contractSignedDeadlineDays: null,
      firstPaymentDate: null,
      depositConfirmedDeadlineDays: 15,
      flightsDate: null,
      gracePeriodDays: 0,
      timezone: "America/Mexico_City",
    });

    expect(trip.contractDate).toEqual(new Date("2026-02-01T00:00:00Z"));
    expect(trip.depositConfirmedDeadlineDays).toBe(15);

    const trips = await listTrips();
    expect(trips).toHaveLength(1);
  });

  it("allows a trip with no participant deadline on the board-action transition", async () => {
    const trip = await createTripRecord({
      name: "No registration-close deadline",
      registrationClose: null,
      contractDate: new Date("2026-02-01T00:00:00Z"),
      contractSignedDeadlineDays: null,
      firstPaymentDate: new Date("2026-03-01T00:00:00Z"),
      depositConfirmedDeadlineDays: null,
      flightsDate: null,
      gracePeriodDays: 0,
      timezone: "America/Mexico_City",
    });

    expect(trip.registrationClose).toBeNull();
  });
});

describe("getTripWithParticipants", () => {
  it("includes participants ordered by creation", async () => {
    const trip = await createTripRecord({
      name: "Trip with participants",
      registrationClose: null,
      contractDate: null,
      contractSignedDeadlineDays: null,
      firstPaymentDate: null,
      depositConfirmedDeadlineDays: null,
      flightsDate: null,
      gracePeriodDays: 0,
      timezone: "America/Mexico_City",
    });
    await prisma.participant.create({
      data: { tripId: trip.id, firstName: "Ana", lastName: "Ruiz", email: "ana@example.com" },
    });

    const found = await getTripWithParticipants(trip.id);
    expect(found?.participants).toHaveLength(1);
    expect(found?.participants[0].firstName).toBe("Ana");
  });

  it("returns null for a missing trip", async () => {
    expect(await getTripWithParticipants("does-not-exist")).toBeNull();
  });
});

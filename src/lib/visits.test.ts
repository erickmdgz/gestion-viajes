import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { PrismaClient } from "@prisma/client";
import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const dbPath = path.resolve(__dirname, "../../prisma/test-visits.db");
process.env.DATABASE_URL = `file:${dbPath}`;

execSync("npx prisma db push --skip-generate --accept-data-loss", {
  cwd: path.resolve(__dirname, "../.."),
  env: process.env,
  stdio: "ignore",
});

const prisma = new PrismaClient();

const { registerVisitRecord, markVisitConfirmed, scheduleVisit, listVisitsForTrip, VISIT_STATUSES } =
  await import("@/lib/visits");
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
  await prisma.visit.deleteMany();
  await prisma.trip.deleteMany();
});

afterAll(async () => {
  await prisma.$disconnect();
  fs.rmSync(dbPath, { force: true });
});

describe("registerVisitRecord (TC-035, stage 1)", () => {
  it("creates a visit at status contact", async () => {
    const trip = await seedTrip();

    const visit = await registerVisitRecord(trip.id, {
      targetName: "Acme Corp",
      targetType: "company",
      notes: null,
    });

    expect(visit.status).toBe(VISIT_STATUSES.CONTACT);

    const visits = await listVisitsForTrip(trip.id);
    expect(visits).toHaveLength(1);
  });
});

describe("markVisitConfirmed", () => {
  it("advances contact -> confirmed", async () => {
    const trip = await seedTrip();
    const visit = await registerVisitRecord(trip.id, {
      targetName: "Acme Corp",
      targetType: "company",
      notes: null,
    });

    const confirmed = await markVisitConfirmed(visit.id);
    expect(confirmed.status).toBe(VISIT_STATUSES.CONFIRMED);
  });

  it("rejects confirming a visit that isn't at contact", async () => {
    const trip = await seedTrip();
    const visit = await registerVisitRecord(trip.id, {
      targetName: "Acme Corp",
      targetType: "company",
      notes: null,
    });
    await markVisitConfirmed(visit.id);

    await expect(markVisitConfirmed(visit.id)).rejects.toThrow();
  });
});

describe("scheduleVisit (TC-036)", () => {
  it("sets the scheduled date/time and advances confirmed -> scheduled", async () => {
    const trip = await seedTrip();
    const visit = await registerVisitRecord(trip.id, {
      targetName: "Acme Corp",
      targetType: "company",
      notes: null,
    });
    await markVisitConfirmed(visit.id);

    const scheduled = await scheduleVisit(visit.id, new Date("2026-05-01T00:00:00Z"), "10:00");

    expect(scheduled.status).toBe(VISIT_STATUSES.SCHEDULED);
    expect(scheduled.scheduledDate).toEqual(new Date("2026-05-01T00:00:00Z"));
    expect(scheduled.scheduledTime).toBe("10:00");
  });

  it("rejects scheduling a visit that hasn't been confirmed yet", async () => {
    const trip = await seedTrip();
    const visit = await registerVisitRecord(trip.id, {
      targetName: "Acme Corp",
      targetType: "company",
      notes: null,
    });

    await expect(
      scheduleVisit(visit.id, new Date("2026-05-01T00:00:00Z"), "10:00"),
    ).rejects.toThrow();
  });
});

describe("full pipeline (TC-035, end to end)", () => {
  it("records status at each of the three stages", async () => {
    const trip = await seedTrip();
    const visit = await registerVisitRecord(trip.id, {
      targetName: "Museo de Historia",
      targetType: "institution",
      notes: "Contact via email first",
    });
    expect(visit.status).toBe(VISIT_STATUSES.CONTACT);

    const confirmed = await markVisitConfirmed(visit.id);
    expect(confirmed.status).toBe(VISIT_STATUSES.CONFIRMED);

    const scheduled = await scheduleVisit(visit.id, new Date("2026-06-15T00:00:00Z"), "14:30");
    expect(scheduled.status).toBe(VISIT_STATUSES.SCHEDULED);
  });
});

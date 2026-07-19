import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { PrismaClient } from "@prisma/client";
import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { FUNNEL_STATES } from "@/lib/funnel";

const dbPath = path.resolve(__dirname, "../../prisma/test-participants.db");
process.env.DATABASE_URL = `file:${dbPath}`;

execSync("npx prisma db push --skip-generate --accept-data-loss", {
  cwd: path.resolve(__dirname, "../.."),
  env: process.env,
  stdio: "ignore",
});

const prisma = new PrismaClient();

const { addParticipantRecord, markContractSent, applyTransitionFlag, withdrawParticipantRecord } =
  await import("@/lib/participants");
const { createTripRecord } = await import("@/lib/trips");

const OPERATOR = "board@solanum.local";

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
  await prisma.participant.deleteMany();
  await prisma.trip.deleteMany();
});

afterAll(async () => {
  await prisma.$disconnect();
  fs.rmSync(dbPath, { force: true });
});

describe("addParticipantRecord (TC-008, TC-009)", () => {
  it("creates the participant with an initial state and stamps the operator", async () => {
    const trip = await seedTrip();
    const participant = await addParticipantRecord(
      trip.id,
      {
        firstName: "Ana",
        lastName: "Ruiz",
        email: "ana@example.com",
        initialState: FUNNEL_STATES.REGISTERED_F1,
      },
      OPERATOR,
    );

    expect(participant.currentState).toBe(FUNNEL_STATES.REGISTERED_F1);
    expect(participant.stateChangedBy).toBe(OPERATOR);
  });
});

describe("markContractSent", () => {
  it("moves a pre-contract participant to Contract sent", async () => {
    const trip = await seedTrip();
    const participant = await addParticipantRecord(
      trip.id,
      { firstName: "Ana", lastName: "Ruiz", email: "ana@example.com", initialState: FUNNEL_STATES.REGISTERED_F1 },
      OPERATOR,
    );

    const updated = await markContractSent(participant.id, OPERATOR);
    expect(updated.currentState).toBe(FUNNEL_STATES.CONTRACT_SENT);
  });

  it("rejects marking contract sent twice", async () => {
    const trip = await seedTrip();
    const participant = await addParticipantRecord(
      trip.id,
      { firstName: "Ana", lastName: "Ruiz", email: "ana@example.com", initialState: FUNNEL_STATES.REGISTERED_F1 },
      OPERATOR,
    );
    await markContractSent(participant.id, OPERATOR);

    await expect(markContractSent(participant.id, OPERATOR)).rejects.toThrow();
  });
});

describe("applyTransitionFlag (TC-010, TC-011, TC-012)", () => {
  it("advances the participant and records the operator + timestamp", async () => {
    const trip = await seedTrip();
    const participant = await addParticipantRecord(
      trip.id,
      { firstName: "Ana", lastName: "Ruiz", email: "ana@example.com", initialState: FUNNEL_STATES.REGISTERED_F1 },
      OPERATOR,
    );
    await markContractSent(participant.id, OPERATOR);

    const updated = await applyTransitionFlag(participant.id, "contractSigned", true, OPERATOR);
    expect(updated.currentState).toBe(FUNNEL_STATES.CONTRACT_SIGNED);
    expect(updated.stateChangedBy).toBe(OPERATOR);
  });

  it("auto-derives Confirmed once both flags are true", async () => {
    const trip = await seedTrip();
    const participant = await addParticipantRecord(
      trip.id,
      { firstName: "Ana", lastName: "Ruiz", email: "ana@example.com", initialState: FUNNEL_STATES.REGISTERED_F1 },
      OPERATOR,
    );
    await markContractSent(participant.id, OPERATOR);
    await applyTransitionFlag(participant.id, "contractSigned", true, OPERATOR);
    const confirmed = await applyTransitionFlag(participant.id, "depositConfirmed", true, OPERATOR);

    expect(confirmed.confirmed).toBe(true);
    expect(confirmed.currentState).toBe(FUNNEL_STATES.CONFIRMED);
  });

  it("regresses and re-derives confirmed=false when a flag is cleared", async () => {
    const trip = await seedTrip();
    const participant = await addParticipantRecord(
      trip.id,
      { firstName: "Ana", lastName: "Ruiz", email: "ana@example.com", initialState: FUNNEL_STATES.REGISTERED_F1 },
      OPERATOR,
    );
    await markContractSent(participant.id, OPERATOR);
    await applyTransitionFlag(participant.id, "contractSigned", true, OPERATOR);
    await applyTransitionFlag(participant.id, "depositConfirmed", true, OPERATOR);

    const regressed = await applyTransitionFlag(participant.id, "depositConfirmed", false, OPERATOR);
    expect(regressed.confirmed).toBe(false);
    expect(regressed.currentState).toBe(FUNNEL_STATES.CONTRACT_SIGNED);
  });

  it("rejects setting a flag before the contract has been sent", async () => {
    const trip = await seedTrip();
    const participant = await addParticipantRecord(
      trip.id,
      { firstName: "Ana", lastName: "Ruiz", email: "ana@example.com", initialState: FUNNEL_STATES.REGISTERED_F1 },
      OPERATOR,
    );

    await expect(applyTransitionFlag(participant.id, "contractSigned", true, OPERATOR)).rejects.toThrow();
  });
});

describe("withdrawParticipantRecord", () => {
  it("marks the participant withdrawn without deleting the record", async () => {
    const trip = await seedTrip();
    const participant = await addParticipantRecord(
      trip.id,
      { firstName: "Ana", lastName: "Ruiz", email: "ana@example.com", initialState: FUNNEL_STATES.REGISTERED_F1 },
      OPERATOR,
    );

    const withdrawn = await withdrawParticipantRecord(participant.id, OPERATOR, "Changed plans");
    expect(withdrawn.withdrawn).toBe(true);
    expect(withdrawn.currentState).toBe(FUNNEL_STATES.WITHDRAWN);
    expect(withdrawn.dropReason).toBe("Changed plans");

    const stillExists = await prisma.participant.findUnique({ where: { id: participant.id } });
    expect(stillExists).not.toBeNull();
  });
});

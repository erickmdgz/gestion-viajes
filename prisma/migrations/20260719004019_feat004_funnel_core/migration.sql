-- CreateTable
CREATE TABLE "Operator" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Trip" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "registrationClose" DATETIME,
    "contractDate" DATETIME,
    "contractSignedDeadlineDays" INTEGER,
    "firstPaymentDate" DATETIME,
    "depositConfirmedDeadlineDays" INTEGER,
    "flightsDate" DATETIME,
    "gracePeriodDays" INTEGER NOT NULL DEFAULT 0,
    "timezone" TEXT NOT NULL DEFAULT 'America/Mexico_City',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Participant" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tripId" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "currentState" TEXT NOT NULL DEFAULT 'Registered (F1)',
    "contractSigned" BOOLEAN NOT NULL DEFAULT false,
    "depositConfirmed" BOOLEAN NOT NULL DEFAULT false,
    "confirmed" BOOLEAN NOT NULL DEFAULT false,
    "withdrawn" BOOLEAN NOT NULL DEFAULT false,
    "dropReason" TEXT,
    "stateChangedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "stateChangedBy" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Participant_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "Trip" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Operator_email_key" ON "Operator"("email");

-- CreateIndex
CREATE INDEX "Participant_tripId_idx" ON "Participant"("tripId");

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Participant" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tripId" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "preferredName" TEXT,
    "studentId" TEXT,
    "age" INTEGER,
    "career" TEXT,
    "semester" TEXT,
    "phone" TEXT,
    "instagram" TEXT,
    "nationality" TEXT,
    "passportStatus" TEXT,
    "visaStatus" TEXT,
    "whatsappGroupConsent" BOOLEAN,
    "privacyConsent" BOOLEAN,
    "consentTimestamp" DATETIME,
    "currentState" TEXT NOT NULL DEFAULT 'Registered (F1)',
    "contractSigned" BOOLEAN NOT NULL DEFAULT false,
    "depositConfirmed" BOOLEAN NOT NULL DEFAULT false,
    "confirmed" BOOLEAN NOT NULL DEFAULT false,
    "withdrawn" BOOLEAN NOT NULL DEFAULT false,
    "dropReason" TEXT,
    "f2Complete" BOOLEAN NOT NULL DEFAULT false,
    "f2CompletedAt" DATETIME,
    "f2VerifiedBy" TEXT,
    "snoozedUntil" DATETIME,
    "lastRemindedAt" DATETIME,
    "reminderCount" INTEGER NOT NULL DEFAULT 0,
    "stateChangedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "stateChangedBy" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Participant_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "Trip" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Participant" ("age", "career", "confirmed", "consentTimestamp", "contractSigned", "createdAt", "currentState", "depositConfirmed", "dropReason", "email", "firstName", "id", "instagram", "lastName", "lastRemindedAt", "nationality", "passportStatus", "phone", "preferredName", "privacyConsent", "reminderCount", "semester", "snoozedUntil", "stateChangedAt", "stateChangedBy", "studentId", "tripId", "visaStatus", "whatsappGroupConsent", "withdrawn") SELECT "age", "career", "confirmed", "consentTimestamp", "contractSigned", "createdAt", "currentState", "depositConfirmed", "dropReason", "email", "firstName", "id", "instagram", "lastName", "lastRemindedAt", "nationality", "passportStatus", "phone", "preferredName", "privacyConsent", "reminderCount", "semester", "snoozedUntil", "stateChangedAt", "stateChangedBy", "studentId", "tripId", "visaStatus", "whatsappGroupConsent", "withdrawn" FROM "Participant";
DROP TABLE "Participant";
ALTER TABLE "new_Participant" RENAME TO "Participant";
CREATE INDEX "Participant_tripId_idx" ON "Participant"("tripId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

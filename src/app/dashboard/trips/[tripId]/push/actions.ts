"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireOperator } from "@/lib/authz";
import {
  recordNudgeRecord,
  snoozeParticipantRecord,
  dismissParticipantTodayRecord,
} from "@/lib/participants";

export async function recordNudge(tripId: string, participantId: string): Promise<void> {
  await requireOperator();
  await recordNudgeRecord(participantId);
  revalidatePath(`/dashboard/trips/${tripId}/push`);
}

export async function snoozeParticipant(
  tripId: string,
  participantId: string,
  formData: FormData,
): Promise<void> {
  await requireOperator();
  const days = Number(formData.get("days"));

  if (!Number.isInteger(days) || days < 1) {
    redirect(
      `/dashboard/trips/${tripId}/push?error=${encodeURIComponent("Enter a whole number of days (1 or more)")}`,
    );
  }

  await snoozeParticipantRecord(participantId, days);
  revalidatePath(`/dashboard/trips/${tripId}/push`);
}

export async function dismissParticipantToday(tripId: string, participantId: string): Promise<void> {
  await requireOperator();
  await dismissParticipantTodayRecord(participantId);
  revalidatePath(`/dashboard/trips/${tripId}/push`);
}

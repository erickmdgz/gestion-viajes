"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireOperator } from "@/lib/authz";
import { addParticipantRecord, withdrawParticipantRecord } from "@/lib/participants";
import { FUNNEL_STATES } from "@/lib/funnel";

const addParticipantSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email"),
  initialState: z.enum([FUNNEL_STATES.INTERESTED, FUNNEL_STATES.REGISTERED_F1]),
});

// Board-manual add path (FR-004). The full F1 intake form is a separate,
// not-yet-built feature (FR-001) — this only takes enough to identify and
// contact the participant.
export async function addParticipant(tripId: string, formData: FormData): Promise<void> {
  const operator = await requireOperator();

  const parsed = addParticipantSchema.safeParse({
    firstName: formData.get("firstName")?.toString(),
    lastName: formData.get("lastName")?.toString(),
    email: formData.get("email")?.toString(),
    initialState: formData.get("initialState")?.toString() ?? FUNNEL_STATES.REGISTERED_F1,
  });

  if (!parsed.success) {
    redirect(`/dashboard/trips/${tripId}?error=${encodeURIComponent(parsed.error.issues[0].message)}`);
  }

  await addParticipantRecord(tripId, parsed.data, operator.email);
  revalidatePath(`/dashboard/trips/${tripId}`);
}

export async function withdrawParticipant(
  tripId: string,
  participantId: string,
  formData: FormData,
): Promise<void> {
  const operator = await requireOperator();
  const dropReason = formData.get("dropReason")?.toString() || null;

  await withdrawParticipantRecord(participantId, operator.email, dropReason);
  revalidatePath(`/dashboard/trips/${tripId}`);
}

"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireOperator } from "@/lib/authz";
import { registerVisitRecord, markVisitConfirmed, scheduleVisit } from "@/lib/visits";

const addVisitSchema = z.object({
  targetName: z.string().min(1, "Target name is required"),
  targetType: z.enum(["company", "institution"]).optional(),
  notes: z.string().optional(),
});

export async function addVisit(tripId: string, formData: FormData): Promise<void> {
  await requireOperator();

  const parsed = addVisitSchema.safeParse({
    targetName: formData.get("targetName")?.toString(),
    targetType: formData.get("targetType")?.toString() || undefined,
    notes: formData.get("notes")?.toString(),
  });

  if (!parsed.success) {
    redirect(
      `/dashboard/trips/${tripId}/visits?error=${encodeURIComponent(parsed.error.issues[0].message)}`,
    );
  }

  await registerVisitRecord(tripId, {
    targetName: parsed.data.targetName,
    targetType: parsed.data.targetType ?? null,
    notes: parsed.data.notes || null,
  });
  revalidatePath(`/dashboard/trips/${tripId}/visits`);
}

export async function confirmVisit(tripId: string, visitId: string): Promise<void> {
  await requireOperator();
  await markVisitConfirmed(visitId);
  revalidatePath(`/dashboard/trips/${tripId}/visits`);
}

const scheduleVisitSchema = z.object({
  scheduledDate: z.string().min(1, "Date is required").transform((v) => new Date(v)),
  scheduledTime: z.string().min(1, "Time is required"),
});

export async function scheduleVisitAction(
  tripId: string,
  visitId: string,
  formData: FormData,
): Promise<void> {
  await requireOperator();

  const parsed = scheduleVisitSchema.safeParse({
    scheduledDate: formData.get("scheduledDate")?.toString(),
    scheduledTime: formData.get("scheduledTime")?.toString(),
  });

  if (!parsed.success) {
    redirect(
      `/dashboard/trips/${tripId}/visits?error=${encodeURIComponent(parsed.error.issues[0].message)}`,
    );
  }

  await scheduleVisit(visitId, parsed.data.scheduledDate, parsed.data.scheduledTime);
  revalidatePath(`/dashboard/trips/${tripId}/visits`);
}

"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireOperator } from "@/lib/authz";
import { registerDocumentRecord, markDocumentCurrent } from "@/lib/agencyDocuments";
import { publishItinerary as publishItineraryRecord } from "@/lib/notices";

const addDocumentSchema = z.object({
  type: z.string().min(1, "Document type is required"),
  versionLabel: z.string().min(1, "Version label is required"),
  date: z.string().min(1, "Date is required").transform((v) => new Date(v)),
  fileRef: z.string().optional(),
  changelog: z.string().optional(),
});

export async function addDocument(tripId: string, formData: FormData): Promise<void> {
  await requireOperator();

  const parsed = addDocumentSchema.safeParse({
    type: formData.get("type")?.toString(),
    versionLabel: formData.get("versionLabel")?.toString(),
    date: formData.get("date")?.toString(),
    fileRef: formData.get("fileRef")?.toString(),
    changelog: formData.get("changelog")?.toString(),
  });

  if (!parsed.success) {
    redirect(
      `/dashboard/trips/${tripId}/documents?error=${encodeURIComponent(parsed.error.issues[0].message)}`,
    );
  }

  await registerDocumentRecord(tripId, {
    type: parsed.data.type,
    versionLabel: parsed.data.versionLabel,
    date: parsed.data.date,
    fileRef: parsed.data.fileRef || null,
    changelog: parsed.data.changelog || null,
  });
  revalidatePath(`/dashboard/trips/${tripId}/documents`);
}

export async function markCurrent(tripId: string, documentId: string): Promise<void> {
  await requireOperator();
  await markDocumentCurrent(documentId);
  revalidatePath(`/dashboard/trips/${tripId}/documents`);
}

export async function publishItinerary(tripId: string): Promise<void> {
  await requireOperator();
  try {
    await publishItineraryRecord(tripId);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Could not publish the itinerary";
    redirect(`/dashboard/trips/${tripId}/documents?error=${encodeURIComponent(message)}`);
  }
  revalidatePath(`/dashboard/trips/${tripId}/documents`);
}

"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireOperator } from "@/lib/authz";
import { createTripRecord } from "@/lib/trips";

const optionalDate = z
  .string()
  .optional()
  .transform((v) => (v ? new Date(v) : null));

const optionalInt = z
  .string()
  .optional()
  .transform((v) => (v ? Number.parseInt(v, 10) : null));

const createTripSchema = z.object({
  name: z.string().min(1, "Name is required"),
  registrationClose: optionalDate,
  contractDate: optionalDate,
  contractSignedDeadlineDays: optionalInt,
  firstPaymentDate: optionalDate,
  depositConfirmedDeadlineDays: optionalInt,
  flightsDate: optionalDate,
  gracePeriodDays: z
    .string()
    .optional()
    .transform((v) => (v ? Number.parseInt(v, 10) : 0)),
  timezone: z.string().min(1).default("America/Mexico_City"),
});

export async function createTrip(formData: FormData): Promise<void> {
  await requireOperator();

  const parsed = createTripSchema.safeParse({
    name: formData.get("name")?.toString(),
    registrationClose: formData.get("registrationClose")?.toString(),
    contractDate: formData.get("contractDate")?.toString(),
    contractSignedDeadlineDays: formData.get("contractSignedDeadlineDays")?.toString(),
    firstPaymentDate: formData.get("firstPaymentDate")?.toString(),
    depositConfirmedDeadlineDays: formData.get("depositConfirmedDeadlineDays")?.toString(),
    flightsDate: formData.get("flightsDate")?.toString(),
    gracePeriodDays: formData.get("gracePeriodDays")?.toString(),
    timezone: formData.get("timezone")?.toString(),
  });

  if (!parsed.success) {
    redirect("/dashboard/trips/new?error=" + encodeURIComponent(parsed.error.issues[0].message));
  }

  const trip = await createTripRecord(parsed.data);
  revalidatePath("/dashboard");
  redirect(`/dashboard/trips/${trip.id}`);
}

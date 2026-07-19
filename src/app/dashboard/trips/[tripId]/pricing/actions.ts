"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireOperator } from "@/lib/authz";
import { createPriceTierRecord } from "@/lib/trips";

const addPriceTierSchema = z
  .object({
    minSize: z.coerce.number().int().min(0, "Min size must be 0 or more"),
    maxSize: z.coerce.number().int().min(0, "Max size must be 0 or more"),
    price: z.coerce.number().int().min(0, "Price must be 0 or more"),
  })
  .refine((data) => data.minSize <= data.maxSize, {
    message: "Min size must be less than or equal to max size",
    path: ["minSize"],
  });

export async function addPriceTier(tripId: string, formData: FormData): Promise<void> {
  await requireOperator();

  const parsed = addPriceTierSchema.safeParse({
    minSize: formData.get("minSize")?.toString(),
    maxSize: formData.get("maxSize")?.toString(),
    price: formData.get("price")?.toString(),
  });

  if (!parsed.success) {
    redirect(
      `/dashboard/trips/${tripId}/pricing?error=${encodeURIComponent(parsed.error.issues[0].message)}`,
    );
  }

  await createPriceTierRecord(tripId, parsed.data);
  revalidatePath(`/dashboard/trips/${tripId}/pricing`);
}

"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireOperator } from "@/lib/authz";
import { publishNotice } from "@/lib/notices";

const publishNoticeSchema = z.object({
  type: z.enum(["notice", "payment-reminder"], { message: "Select a valid type" }),
  body: z.string().min(1, "Content is required"),
});

export async function publishNoticeAction(tripId: string, formData: FormData): Promise<void> {
  await requireOperator();

  const parsed = publishNoticeSchema.safeParse({
    type: formData.get("type")?.toString(),
    body: formData.get("body")?.toString(),
  });

  if (!parsed.success) {
    redirect(
      `/dashboard/trips/${tripId}/notices?error=${encodeURIComponent(parsed.error.issues[0].message)}`,
    );
  }

  await publishNotice(tripId, parsed.data);
  revalidatePath(`/dashboard/trips/${tripId}/notices`);
}

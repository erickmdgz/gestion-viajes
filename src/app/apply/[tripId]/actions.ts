"use server";

import { redirect } from "next/navigation";
import { getTripById } from "@/lib/trips";
import { registerParticipantViaF1 } from "@/lib/participants";
import { validateF1Registration } from "@/lib/f1Registration";

// Public F1 submission (FR-001) — no requireOperator() here on purpose:
// participants never log in (NF-2/NF-8). Validation and the resulting
// write are the only guards on this route.
export async function registerParticipant(tripId: string, formData: FormData): Promise<void> {
  const trip = await getTripById(tripId);
  if (!trip) {
    redirect(`/apply/${tripId}?error=${encodeURIComponent("Este enlace de registro ya no es válido.")}`);
  }

  const result = validateF1Registration({
    email: formData.get("email")?.toString(),
    firstName: formData.get("firstName")?.toString(),
    lastName: formData.get("lastName")?.toString(),
    preferredName: formData.get("preferredName")?.toString(),
    studentId: formData.get("studentId")?.toString(),
    age: formData.get("age")?.toString(),
    career: formData.get("career")?.toString(),
    semester: formData.get("semester")?.toString(),
    phone: formData.get("phone")?.toString(),
    instagram: formData.get("instagram")?.toString(),
    nationality: formData.get("nationality")?.toString(),
    passportStatus: formData.get("passportStatus")?.toString(),
    visaStatus: formData.get("visaStatus")?.toString(),
    whatsappGroupConsent: formData.get("whatsappGroupConsent")?.toString(),
    privacyConsent: formData.get("privacyConsent") === "on",
  });

  if (!result.success) {
    redirect(`/apply/${tripId}?error=${encodeURIComponent(result.error)}`);
  }

  await registerParticipantViaF1(tripId, result.data);
  redirect(`/apply/${tripId}/thanks`);
}

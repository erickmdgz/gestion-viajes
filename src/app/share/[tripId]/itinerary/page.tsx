import { redirect } from "next/navigation";
import { resolvePublishedItineraryFileRef } from "@/lib/notices";

// Public share link (FR-014) — no session, not under /dashboard, so
// middleware.ts doesn't (and must not) protect it. Resolves live on every
// visit against whichever AgencyDocument is currently current for type
// "itinerary" (FR-011) — the link itself never changes (TC-032).
export default async function ShareItineraryPage({
  params,
}: {
  params: Promise<{ tripId: string }>;
}) {
  const { tripId } = await params;
  const fileRef = await resolvePublishedItineraryFileRef(tripId);

  if (fileRef) {
    redirect(fileRef);
  }

  return (
    <main>
      <h1>Itinerary</h1>
      <p>This itinerary isn&apos;t available yet.</p>
    </main>
  );
}

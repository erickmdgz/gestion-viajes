import Link from "next/link";
import { notFound } from "next/navigation";
import { getTripById } from "@/lib/trips";
import { generatePromoIdeas } from "@/lib/promo";
import { CopyButton } from "@/app/dashboard/trips/[tripId]/push/copy-button";

// Generate promotional content ideas and image prompts (FR-016). No
// action, no persistence -- "requesting content" is just viewing this
// page, computed on demand from the trip's own data.
export default async function TripPromoPage({
  params,
}: {
  params: Promise<{ tripId: string }>;
}) {
  const { tripId } = await params;
  const trip = await getTripById(tripId);
  if (!trip) notFound();

  const ideas = generatePromoIdeas(trip.name, trip.registrationClose);

  return (
    <main className="wide">
      <h1>Promo ideas — {trip.name}</h1>
      <p>
        <Link href={`/dashboard/trips/${tripId}`}>&larr; Back to roster</Link>
      </p>
      <p>Draft ideas for the team to review — nothing here is final material.</p>

      {ideas.map((idea) => (
        <section key={idea.angle} className="card">
          <h2>{idea.angle}</h2>
          <p>{idea.caption}</p>
          <CopyButton text={idea.caption} />

          <p>
            <strong>Image prompt</strong>
          </p>
          <pre>{idea.imagePrompt}</pre>
          <CopyButton text={idea.imagePrompt} />
        </section>
      ))}
    </main>
  );
}

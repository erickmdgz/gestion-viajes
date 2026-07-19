import Link from "next/link";
import { notFound } from "next/navigation";
import { getTripById } from "@/lib/trips";
import { listDocumentsForTrip } from "@/lib/agencyDocuments";
import { getItineraryNotice } from "@/lib/notices";
import { addDocument, markCurrent, publishItinerary } from "@/app/dashboard/trips/[tripId]/documents/actions";
import { CopyButton } from "@/app/dashboard/trips/[tripId]/push/copy-button";

// Agency document layer (FR-010/011/012): register versions by type, mark
// exactly one per type as current, and show each version's changelog.
export default async function TripDocumentsPage({
  params,
  searchParams,
}: {
  params: Promise<{ tripId: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { tripId } = await params;
  const { error } = await searchParams;
  const trip = await getTripById(tripId);
  if (!trip) notFound();

  const documents = await listDocumentsForTrip(tripId);
  const types = Array.from(new Set(documents.map((d) => d.type)));
  const itineraryNotice = await getItineraryNotice(tripId);

  const addDocumentForTrip = addDocument.bind(null, tripId);
  const markCurrentForTrip = markCurrent.bind(null, tripId);
  const publishItineraryForTrip = publishItinerary.bind(null, tripId);

  return (
    <main className="wide">
      <h1>Documents — {trip.name}</h1>
      <p>
        <Link href={`/dashboard/trips/${tripId}`}>&larr; Back to roster</Link>
      </p>

      <section className="card">
        <h2>Itinerary sharing</h2>
        {itineraryNotice?.publishedAt ? (
          <>
            <p>Published {itineraryNotice.publishedAt.toISOString().slice(0, 10)}.</p>
            <p>Share this link with the confirmed group — it always serves the current itinerary:</p>
            <pre>{itineraryNotice.contentRef}</pre>
            <CopyButton text={itineraryNotice.contentRef} />
          </>
        ) : (
          <>
            <p>Not published yet. Register an itinerary document and mark it current first.</p>
            <form action={publishItineraryForTrip}>
              <button type="submit">Publish itinerary</button>
            </form>
          </>
        )}
      </section>

      {documents.length === 0 && <p>No documents registered yet.</p>}

      {types.map((type) => (
        <section key={type} className="card">
          <h2>{type}</h2>
          {documents
            .filter((doc) => doc.type === type)
            .map((doc) => (
              <div key={doc.id} className="card">
                <p>
                  <strong>{doc.versionLabel}</strong> — {doc.date.toISOString().slice(0, 10)}
                  {doc.isCurrent && <span className="badge-current">CURRENT</span>}
                </p>
                {doc.changelog && <p>{doc.changelog}</p>}
                {doc.fileRef && (
                  <p>
                    <a href={doc.fileRef} target="_blank" rel="noreferrer">
                      {doc.fileRef}
                    </a>
                  </p>
                )}
                {!doc.isCurrent && (
                  <form action={markCurrentForTrip.bind(null, doc.id)}>
                    <button type="submit">Mark as current</button>
                  </form>
                )}
              </div>
            ))}
        </section>
      ))}

      <form className="card" action={addDocumentForTrip}>
        <h2>Add document version</h2>
        <label htmlFor="type">Type</label>
        <input id="type" name="type" type="text" list="document-type-suggestions" required />
        <datalist id="document-type-suggestions">
          <option value="itinerary" />
          <option value="budget" />
        </datalist>

        <label htmlFor="versionLabel">Version label</label>
        <input id="versionLabel" name="versionLabel" type="text" required />

        <label htmlFor="date">Date</label>
        <input id="date" name="date" type="date" required />

        <label htmlFor="fileRef">Link (optional)</label>
        <input id="fileRef" name="fileRef" type="url" />

        <label htmlFor="changelog">Changelog (optional)</label>
        <textarea id="changelog" name="changelog" rows={3} />

        <button type="submit">Add version</button>

        {error && <p className="error">{error}</p>}
      </form>
    </main>
  );
}

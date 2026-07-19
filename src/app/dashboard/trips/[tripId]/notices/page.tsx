import Link from "next/link";
import { notFound } from "next/navigation";
import { getTripById } from "@/lib/trips";
import { listPublishedNotices } from "@/lib/notices";
import { publishNoticeAction } from "@/app/dashboard/trips/[tripId]/notices/actions";

const TYPE_LABELS: Record<string, string> = {
  notice: "Notice",
  "payment-reminder": "Payment reminder",
};

// Publish notices and payment-date reminders (FR-015): a feed, not a
// single slot like itinerary — every publish is a new, permanent post.
export default async function TripNoticesPage({
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

  const notices = await listPublishedNotices(tripId);
  const publishNoticeForTrip = publishNoticeAction.bind(null, tripId);

  return (
    <main className="wide">
      <h1>Notices — {trip.name}</h1>
      <p>
        <Link href={`/dashboard/trips/${tripId}`}>&larr; Back to roster</Link>
      </p>

      {notices.length > 0 && (
        <p>
          Public feed: <code>/share/{tripId}/notices</code>
        </p>
      )}

      {notices.length === 0 ? (
        <p>No notices published yet.</p>
      ) : (
        notices.map((notice) => (
          <div key={notice.id} className="card">
            <p>
              <strong>{TYPE_LABELS[notice.type] ?? notice.type}</strong> —{" "}
              {notice.publishedAt?.toISOString().slice(0, 10)}
            </p>
            <p>{notice.body}</p>
          </div>
        ))
      )}

      <form className="card" action={publishNoticeForTrip}>
        <h2>Publish a notice</h2>
        <label htmlFor="type">Type</label>
        <select id="type" name="type" defaultValue="notice">
          <option value="notice">Notice</option>
          <option value="payment-reminder">Payment reminder</option>
        </select>

        <label htmlFor="body">Content</label>
        <textarea id="body" name="body" rows={4} required />

        <button type="submit">Publish</button>

        {error && <p className="error">{error}</p>}
      </form>
    </main>
  );
}

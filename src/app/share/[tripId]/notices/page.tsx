import { listPublishedNotices } from "@/lib/notices";

const TYPE_LABELS: Record<string, string> = {
  notice: "Notice",
  "payment-reminder": "Payment reminder",
};

// Public notices/payment-reminder feed (FR-015) — no session, not under
// /dashboard, so middleware.ts doesn't (and must not) protect it. Lists
// every published notice for the trip, most recent first.
export default async function ShareNoticesPage({
  params,
}: {
  params: Promise<{ tripId: string }>;
}) {
  const { tripId } = await params;
  const notices = await listPublishedNotices(tripId);

  return (
    <main>
      <h1>Notices</h1>
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
    </main>
  );
}

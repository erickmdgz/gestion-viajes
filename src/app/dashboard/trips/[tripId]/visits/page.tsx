import Link from "next/link";
import { notFound } from "next/navigation";
import { getTripById } from "@/lib/trips";
import { listVisitsForTrip, VISIT_STATUSES } from "@/lib/visits";
import { addVisit, confirmVisit, scheduleVisitAction } from "@/app/dashboard/trips/[tripId]/visits/actions";

// Visit coordination pipeline (FR-017): contact -> confirmed -> scheduled.
export default async function TripVisitsPage({
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

  const visits = await listVisitsForTrip(tripId);
  const addVisitForTrip = addVisit.bind(null, tripId);
  const confirmVisitForTrip = confirmVisit.bind(null, tripId);
  const scheduleVisitForTrip = scheduleVisitAction.bind(null, tripId);

  return (
    <main className="wide">
      <h1>Visits — {trip.name}</h1>
      <p>
        <Link href={`/dashboard/trips/${tripId}`}>&larr; Back to roster</Link>
      </p>

      <table>
        <thead>
          <tr>
            <th>Target</th>
            <th>Type</th>
            <th>Status</th>
            <th>Scheduled</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {visits.map((visit) => (
            <tr key={visit.id}>
              <td>{visit.targetName}</td>
              <td>{visit.targetType ?? "—"}</td>
              <td>{visit.status}</td>
              <td>
                {visit.scheduledDate
                  ? `${visit.scheduledDate.toISOString().slice(0, 10)} ${visit.scheduledTime}`
                  : "—"}
              </td>
              <td>
                {visit.status === VISIT_STATUSES.CONTACT && (
                  <form action={confirmVisitForTrip.bind(null, visit.id)}>
                    <button type="submit">Mark confirmed</button>
                  </form>
                )}
                {visit.status === VISIT_STATUSES.CONFIRMED && (
                  <form action={scheduleVisitForTrip.bind(null, visit.id)}>
                    <input type="date" name="scheduledDate" required aria-label="Scheduled date" />
                    <input type="time" name="scheduledTime" required aria-label="Scheduled time" />
                    <button type="submit">Schedule</button>
                  </form>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <form className="card" action={addVisitForTrip}>
        <h2>Add visit target</h2>
        <label htmlFor="targetName">Target name</label>
        <input id="targetName" name="targetName" type="text" required />

        <label htmlFor="targetType">Type</label>
        <select id="targetType" name="targetType" defaultValue="">
          <option value="">Not specified</option>
          <option value="company">Company</option>
          <option value="institution">Institution</option>
        </select>

        <label htmlFor="notes">Notes (optional)</label>
        <textarea id="notes" name="notes" rows={3} />

        <button type="submit">Add visit target</button>

        {error && <p className="error">{error}</p>}
      </form>
    </main>
  );
}

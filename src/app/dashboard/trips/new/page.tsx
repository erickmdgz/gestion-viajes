import Link from "next/link";
import { createTrip } from "@/app/dashboard/trips/actions";

// Create-trip form (FR-003): the board sets, per participant transition,
// either an absolute trip-level date or a relative "N days" fallback.
export default async function NewTripPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <main className="wide">
      <h1>New trip</h1>
      <p>
        <Link href="/dashboard">&larr; Back to trips</Link>
      </p>
      <form className="card" action={createTrip}>
        <label htmlFor="name">Trip name</label>
        <input id="name" name="name" type="text" required />

        <label htmlFor="registrationClose">Registration close (informational)</label>
        <input id="registrationClose" name="registrationClose" type="date" />

        <label htmlFor="contractDate">Contract deadline (absolute)</label>
        <input id="contractDate" name="contractDate" type="date" />

        <label htmlFor="contractSignedDeadlineDays">
          Contract deadline — days after Contract sent (used only if the date above is blank)
        </label>
        <input id="contractSignedDeadlineDays" name="contractSignedDeadlineDays" type="number" min="0" />

        <label htmlFor="firstPaymentDate">First payment deadline (absolute)</label>
        <input id="firstPaymentDate" name="firstPaymentDate" type="date" />

        <label htmlFor="depositConfirmedDeadlineDays">
          First payment deadline — days after Contract sent (used only if the date above is blank)
        </label>
        <input id="depositConfirmedDeadlineDays" name="depositConfirmedDeadlineDays" type="number" min="0" />

        <label htmlFor="flightsDate">Flights deadline (reserved for a later feature)</label>
        <input id="flightsDate" name="flightsDate" type="date" />

        <label htmlFor="gracePeriodDays">Grace period (days)</label>
        <input id="gracePeriodDays" name="gracePeriodDays" type="number" min="0" defaultValue={0} />

        <label htmlFor="timezone">Timezone</label>
        <input id="timezone" name="timezone" type="text" defaultValue="America/Mexico_City" />

        <button type="submit">Create trip</button>

        {error && <p className="error">{error}</p>}
      </form>
    </main>
  );
}

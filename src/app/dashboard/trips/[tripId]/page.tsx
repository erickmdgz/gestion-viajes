import Link from "next/link";
import { notFound } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getTripWithParticipants } from "@/lib/trips";
import { isParticipantOverdue, FUNNEL_STATES } from "@/lib/funnel";
import { requireOperator } from "@/lib/authz";
import { applyTransitionFlag, markContractSent } from "@/lib/participants";
import { addParticipant, withdrawParticipant } from "@/app/dashboard/trips/[tripId]/actions";

const PRE_CONTRACT_STATES: string[] = [FUNNEL_STATES.INTERESTED, FUNNEL_STATES.REGISTERED_F1];

// Trip roster (FR-004/FR-005/FR-006): shows each participant's current
// state, flags the ones with an overdue transition, and exposes the
// board actions that move them through the funnel.
export default async function TripRosterPage({
  params,
  searchParams,
}: {
  params: Promise<{ tripId: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { tripId } = await params;
  const { error } = await searchParams;
  const trip = await getTripWithParticipants(tripId);
  if (!trip) notFound();

  const addParticipantForTrip = addParticipant.bind(null, tripId);
  const withdrawParticipantForTrip = withdrawParticipant.bind(null, tripId);

  return (
    <main className="wide">
      <h1>{trip.name}</h1>
      <p>
        <Link href="/dashboard">&larr; Back to trips</Link> · <Link href={`/dashboard/trips/${tripId}/push`}>Push today &rarr;</Link>
      </p>

      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>State</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {trip.participants.map((participant) => {
            const overdue = !participant.withdrawn && isParticipantOverdue(participant, trip);
            const preContract = PRE_CONTRACT_STATES.includes(participant.currentState);

            return (
              <tr key={participant.id}>
                <td>
                  {participant.firstName} {participant.lastName}
                </td>
                <td>{participant.email}</td>
                <td>
                  {participant.currentState}
                  {overdue && <span className="badge-overdue">OVERDUE</span>}
                </td>
                <td>
                  {!participant.withdrawn && preContract && (
                    <form
                      action={async () => {
                        "use server";
                        const operator = await requireOperator();
                        await markContractSent(participant.id, operator.email);
                        revalidatePath(`/dashboard/trips/${tripId}`);
                      }}
                    >
                      <button type="submit">Mark contract sent</button>
                    </form>
                  )}

                  {!participant.withdrawn && !preContract && (
                    <>
                      <form
                        action={async () => {
                          "use server";
                          const operator = await requireOperator();
                          await applyTransitionFlag(
                            participant.id,
                            "contractSigned",
                            !participant.contractSigned,
                            operator.email,
                          );
                          revalidatePath(`/dashboard/trips/${tripId}`);
                        }}
                      >
                        <button type="submit">
                          {participant.contractSigned ? "Unmark" : "Mark"} contract signed
                        </button>
                      </form>

                      <form
                        action={async () => {
                          "use server";
                          const operator = await requireOperator();
                          await applyTransitionFlag(
                            participant.id,
                            "depositConfirmed",
                            !participant.depositConfirmed,
                            operator.email,
                          );
                          revalidatePath(`/dashboard/trips/${tripId}`);
                        }}
                      >
                        <button type="submit">
                          {participant.depositConfirmed ? "Unmark" : "Mark"} deposit confirmed
                        </button>
                      </form>
                    </>
                  )}

                  {!participant.withdrawn && (
                    <form action={withdrawParticipantForTrip.bind(null, participant.id)}>
                      <input type="text" name="dropReason" placeholder="Drop reason (optional)" />
                      <button type="submit">Withdraw</button>
                    </form>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <form className="card" action={addParticipantForTrip}>
        <h2>Add participant</h2>
        <label htmlFor="firstName">First name</label>
        <input id="firstName" name="firstName" type="text" required />

        <label htmlFor="lastName">Last name</label>
        <input id="lastName" name="lastName" type="text" required />

        <label htmlFor="email">Email</label>
        <input id="email" name="email" type="email" required />

        <label htmlFor="initialState">Initial state</label>
        <select id="initialState" name="initialState" defaultValue={FUNNEL_STATES.REGISTERED_F1}>
          <option value={FUNNEL_STATES.INTERESTED}>Interested</option>
          <option value={FUNNEL_STATES.REGISTERED_F1}>Registered (F1)</option>
        </select>

        <button type="submit">Add participant</button>

        {error && <p className="error">{error}</p>}
      </form>
    </main>
  );
}

import Link from "next/link";
import { notFound } from "next/navigation";
import { getTripWithParticipants } from "@/lib/trips";
import { buildPushList, renderReminderMessage, isNudgedToday } from "@/lib/reminders";
import { CopyButton } from "@/app/dashboard/trips/[tripId]/push/copy-button";
import { recordNudge, snoozeParticipant, dismissParticipantToday } from "@/app/dashboard/trips/[tripId]/push/actions";

// Daily push list (FR-008): who to contact today, grouped by transition,
// most-overdue-first, excluding Withdrawn/Declined and snoozed/dismissed
// participants. Each entry carries a drafted reminder message (FR-007)
// and the cadence controls (FR-009).
export default async function PushTodayPage({
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

  const groups = buildPushList(trip.participants, trip);
  const recordNudgeForTrip = recordNudge.bind(null, tripId);
  const snoozeParticipantForTrip = snoozeParticipant.bind(null, tripId);
  const dismissParticipantForTrip = dismissParticipantToday.bind(null, tripId);

  return (
    <main className="wide">
      <h1>Push today — {trip.name}</h1>
      <p>
        <Link href={`/dashboard/trips/${tripId}`}>&larr; Back to roster</Link>
      </p>

      {error && <p className="error">{error}</p>}

      {groups.every((group) => group.entries.length === 0) && <p>Nothing to push today.</p>}

      {groups.map(
        (group) =>
          group.entries.length > 0 && (
            <section key={group.key} className="card">
              <h2>{group.label}</h2>
              {group.entries.map(({ participant, transition, daysOverdue }) => {
                const message = renderReminderMessage(group.key, participant.firstName, transition.deadline!);
                const nudgedToday = isNudgedToday(participant.lastRemindedAt);

                return (
                  <div key={`${group.key}-${participant.id}`} className="card">
                    <p>
                      <strong>{participant.firstName}</strong> — {daysOverdue}{" "}
                      {daysOverdue === 1 ? "day" : "days"} overdue
                      {nudgedToday && <span className="badge-overdue">NUDGED TODAY</span>}
                    </p>
                    <pre>{message}</pre>
                    <CopyButton text={message} />

                    <form action={recordNudgeForTrip.bind(null, participant.id)}>
                      <button type="submit">Mark as nudged</button>
                    </form>

                    <form action={snoozeParticipantForTrip.bind(null, participant.id)}>
                      <input type="number" name="days" min="1" defaultValue={7} aria-label="Snooze days" />
                      <button type="submit">Snooze</button>
                    </form>

                    <form action={dismissParticipantForTrip.bind(null, participant.id)}>
                      <button type="submit">Dismiss today</button>
                    </form>
                  </div>
                );
              })}
            </section>
          ),
      )}
    </main>
  );
}

import Link from "next/link";
import { redirect } from "next/navigation";
import { auth, signOut } from "@/lib/auth";
import { listTrips } from "@/lib/trips";

// Protected route (see src/middleware.ts). Reached only with a valid session;
// demonstrates NFR-002. Lists trips and their funnel state (FEAT-004).
export default async function DashboardPage() {
  const session = await auth();
  // Defensive: middleware already guards this, but never render for no session.
  if (!session) redirect("/login");

  const trips = await listTrips();

  return (
    <main className="wide">
      <h1>Dashboard</h1>
      <p>Signed in as {session.user?.name ?? session.user?.email}.</p>

      <div className="card">
        <h2>Trips</h2>
        {trips.length === 0 ? (
          <p>No trips yet.</p>
        ) : (
          <ul>
            {trips.map((trip) => (
              <li key={trip.id}>
                <Link href={`/dashboard/trips/${trip.id}`}>{trip.name}</Link>
              </li>
            ))}
          </ul>
        )}
        <Link href="/dashboard/trips/new">
          <button type="button">Create trip</button>
        </Link>
      </div>

      <form
        action={async () => {
          "use server";
          await signOut({ redirectTo: "/login" });
        }}
      >
        <button type="submit">Sign out</button>
      </form>
    </main>
  );
}

import { redirect } from "next/navigation";
import { auth, signOut } from "@/lib/auth";

// Protected route (see src/middleware.ts). Reached only with a valid session;
// demonstrates NFR-002. The real funnel views build on this in later features.
export default async function DashboardPage() {
  const session = await auth();
  // Defensive: middleware already guards this, but never render for no session.
  if (!session) redirect("/login");

  return (
    <main>
      <h1>Dashboard</h1>
      <p>Signed in as {session.user?.name ?? session.user?.email}.</p>
      <div className="card">
        <p>
          This is a protected route. The participant funnel and daily push list
          will live here (FEAT-004+).
        </p>
        <form
          action={async () => {
            "use server";
            await signOut({ redirectTo: "/login" });
          }}
        >
          <button type="submit">Sign out</button>
        </form>
      </div>
    </main>
  );
}

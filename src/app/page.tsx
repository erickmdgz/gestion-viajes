import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

// Landing: if an operator is already signed in, go straight to the dashboard;
// otherwise offer the login link.
export default async function HomePage() {
  const session = await auth();
  if (session) redirect("/dashboard");

  return (
    <main>
      <h1>Solanum</h1>
      <p>Local-first academic-trip funnel tracker.</p>
      <div className="card">
        <p>Sign in to operate the funnel.</p>
        <Link href="/login">
          <button>Go to login</button>
        </Link>
      </div>
    </main>
  );
}

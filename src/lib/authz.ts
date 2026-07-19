import { auth } from "@/lib/auth";

// Every action touching trip/participant data must call this first — do
// not rely on middleware alone (02_architecture.md: operator auth required
// on every route/action, not just the page shell).
export async function requireOperator(): Promise<{ email: string; name: string }> {
  const session = await auth();
  if (!session?.user?.email) {
    throw new Error("Not authenticated");
  }
  return { email: session.user.email, name: session.user.name ?? session.user.email };
}

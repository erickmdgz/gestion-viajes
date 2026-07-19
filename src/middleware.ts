import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

// Protect operator-only routes: an unauthenticated request to a protected
// route is redirected to /login (NFR-002 / NF-8). The roster and future
// funnel views must never be reachable without a session.
export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const { pathname } = req.nextUrl;

  const isProtected = pathname.startsWith("/dashboard");

  if (isProtected && !isLoggedIn) {
    const loginUrl = new URL("/login", req.nextUrl.origin);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
});

export const config = {
  // Run on everything except Next internals and static assets.
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};

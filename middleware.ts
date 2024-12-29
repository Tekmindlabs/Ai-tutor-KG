import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const session = req.nextauth.token;
    const isOnboarded = session?.onboarded;
    const path = req.nextUrl.pathname;

    // Allow access to onboarding page only if not onboarded
    if (path === "/onboarding" && isOnboarded) {
      return NextResponse.redirect(new URL("/chat", req.url));
    }

    // Redirect to onboarding if not onboarded (except for onboarding page)
    if (!isOnboarded && path !== "/onboarding") {
      return NextResponse.redirect(new URL("/onboarding", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: [
    "/chat/:path*",
    "/knowledge/:path*",
    "/onboarding",
    "/api/chat/:path*",
    "/api/knowledge/:path*",
    "/api/onboarding",
  ],
};
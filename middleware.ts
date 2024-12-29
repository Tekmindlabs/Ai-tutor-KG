import authConfig from "./auth.config"
import NextAuth from "next-auth"

const { auth } = NextAuth(authConfig)

export default auth(async function middleware(req) {
  const session = await auth();
  const isOnboarded = session?.user?.onboarded;
  const path = req.nextUrl.pathname;

  if (path === "/onboarding" && isOnboarded) {
    return Response.redirect(new URL("/chat", req.url));
  }

  if (!isOnboarded && path !== "/onboarding") {
    return Response.redirect(new URL("/onboarding", req.url));
  }

  return null;
})

export const config = {
  matcher: [
    "/chat/:path*",
    "/knowledge/:path*",
    "/onboarding",
    "/api/chat/:path*",
    "/api/knowledge/:path*",
    "/api/onboarding",
  ],
}
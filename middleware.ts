// /middleware.ts
import { auth } from "@/auth"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export default auth((req) => {
  try {
    const isAuth = !!req.auth
    const isAuthPage = req.nextUrl.pathname.startsWith("/auth")

    // Add debugging
    console.log('Auth status:', isAuth);
    console.log('Current path:', req.nextUrl.pathname);

    if (isAuthPage) {
      if (isAuth) {
        return NextResponse.redirect(new URL("/dashboard", req.url))
      }
      return null
    }

    if (!isAuth) {
      let from = req.nextUrl.pathname;
      if (from !== "/") {
        return NextResponse.redirect(
          new URL(`/auth/signin?from=${from}`, req.url)
        );
      }
      return NextResponse.redirect(new URL("/auth/signin", req.url));
    }
    return null
  } catch (error) {
    console.error('Middleware error:', error);
    // Allow the request to continue in case of error
    return null;
  }
})

// Update matcher to exclude more paths
export const config = {
  matcher: [
    "/((?!auth|_next/static|_next/image|favicon.ico|api/auth).*)",
  ],
}
// /middleware.ts
import { auth } from "@/auth"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export default auth((req) => {
  const isAuth = !!req.auth
  const isAuthPage = req.nextUrl.pathname.startsWith("/auth")

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
})

// Update matcher to include all protected routes and exclude auth routes
export const config = {
  matcher: [
    "/((?!auth|_next/static|_next/image|favicon.ico).*)",
  ],
}
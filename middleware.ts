import { auth } from "@/auth"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export default auth((req) => {
  const isAuth = !!req.auth
  const isAuthPage = req.nextUrl.pathname.startsWith("/auth")

  if (isAuthPage) {
    if (isAuth) {
      return NextResponse.redirect(new URL("/chat", req.url))
    }
    return null
  }

  if (!isAuth) {
    return NextResponse.redirect(new URL("/auth/signin", req.url))
  }
  return null
})

// Keep your existing config
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
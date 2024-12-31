// middleware.ts
import { auth } from "@/auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  try {
    const session = await auth();
    
    // Public paths that don't require authentication
    const publicPaths = ["/api/auth", "/login", "/register", "/error", "/verify-request"];
    const isPublicPath = publicPaths.some(path => 
      request.nextUrl.pathname.startsWith(path)
    );

    // Handle authentication
    if (!session?.user && !isPublicPath) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("callbackUrl", request.url);
      return NextResponse.redirect(loginUrl);
    }

    // Handle onboarding
    if (session?.user && !session.user.onboarded && 
        !request.nextUrl.pathname.startsWith("/onboarding")) {
      return NextResponse.redirect(new URL("/onboarding", request.url));
    }

    return NextResponse.next();
  } catch (error) {
    console.error("Middleware error:", error);
    return NextResponse.redirect(new URL("/error", request.url));
  }
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
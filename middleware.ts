import { NextResponse } from "next/server";
import { auth } from "./auth";

export default auth((req) => {
  try {
    const isAuthenticated = !!req.auth;
    const isAuthPage = req.nextUrl.pathname.startsWith('/login');

    // Handle auth page access
    if (isAuthPage) {
      if (isAuthenticated) {
        return NextResponse.redirect(new URL('/', req.url));
      }
      return NextResponse.next();
    }

    // Handle protected routes
    if (!isAuthenticated) {
      return NextResponse.redirect(new URL('/login', req.url));
    }

    return NextResponse.next();
  } catch (error) {
    console.error('Middleware authentication error:', error);
    // Redirect to error page in case of authentication errors
    return NextResponse.redirect(new URL('/login', req.url));
  }
});

// Update the matcher configuration to exclude auth-related paths
export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|login|auth).*)',
  ],
};
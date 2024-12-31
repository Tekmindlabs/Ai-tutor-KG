import { NextResponse } from "next/server";
import { auth } from "./auth";

export default auth((req) => {
  const { pathname } = req.nextUrl;
  
  // Define public paths
  const isPublicPath = 
    pathname.startsWith('/api/auth') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/static') ||
    pathname.startsWith('/images') ||
    pathname.startsWith('/login') ||
    pathname.startsWith('/register') ||
    pathname.startsWith('/forgot-password') ||
    pathname === '/favicon.ico';

  if (isPublicPath) {
    return NextResponse.next();
  }

  // Check authentication
  if (!req.auth) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  return NextResponse.next();
});

// Simplified matcher configuration
export const config = {
  matcher: [
    '/((?!api/auth|_next/static|_next/image|favicon.ico|images|login|register|forgot-password).*)',
  ],
};
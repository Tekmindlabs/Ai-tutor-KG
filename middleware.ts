import { NextResponse } from "next/server";
import { auth } from "./auth";

export default auth((req) => {
  try {
    // Get the current path and auth status
    const { pathname, origin } = req.nextUrl;
    const isAuthenticated = !!req.auth;
    
    // Define authentication-related paths
    const authRoutes = ['/login', '/register', '/forgot-password'];
    const isAuthRoute = authRoutes.some(route => pathname.startsWith(route));
    
    // Define public paths that don't require authentication
    const publicPaths = [
      '/api/auth',
      '/_next',
      '/static',
      '/images',
      '/favicon.ico',
    ];
    const isPublicPath = publicPaths.some(path => pathname.startsWith(path));

    // Allow access to public paths without authentication
    if (isPublicPath) {
      return NextResponse.next();
    }

    // Handle authentication routes
    if (isAuthRoute) {
      // Redirect authenticated users to home page if they try to access auth routes
      if (isAuthenticated) {
        return NextResponse.redirect(new URL('/', req.url));
      }
      return NextResponse.next();
    }

    // Handle protected routes
    if (!isAuthenticated) {
      // Store the attempted URL to redirect back after login
      const callbackUrl = encodeURIComponent(pathname);
      return NextResponse.redirect(
        new URL(`/login?callbackUrl=${callbackUrl}`, origin)
      );
    }

    // Check for session expiration
    if (req.auth?.exp && Date.now() >= req.auth.exp * 1000) {
      return NextResponse.redirect(
        new URL('/login?error=SessionExpired', origin)
      );
    }

    // Allow access to protected routes for authenticated users
    return NextResponse.next();

  } catch (error) {
    console.error('Middleware authentication error:', error);
    
    // Enhanced error logging
    if (error instanceof Error) {
      console.error({
        message: error.message,
        stack: error.stack,
        path: req.nextUrl.pathname,
      });
    }

    // Redirect to error page with specific error message
    const errorMessage = encodeURIComponent(
      error instanceof Error ? error.message : 'Authentication failed'
    );
    
    return NextResponse.redirect(
      new URL(`/login?error=${errorMessage}`, req.url)
    );
  }
});

// Updated matcher configuration with more specific exclusions
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * 1. API routes that handle authentication
     * 2. Next.js static files
     * 3. Public assets
     * 4. Authentication-related pages
     */
    '/((?!api/auth|_next/static|_next/image|favicon.ico|images|login|register|forgot-password|auth).*)',
  ],
};
import type { NextAuthConfig } from "next-auth"

export const authConfig = {
  pages: {
    signIn: "/auth/signin",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user
      const isOnboardingPage = nextUrl.pathname.startsWith("/onboarding")
      const isAuthPage = nextUrl.pathname.startsWith("/auth")
      const isPublicPage = nextUrl.pathname === "/"

      // Allow public pages
      if (isPublicPage) return true

      // Redirect unauthenticated users to login page
      if (!isLoggedIn && !isAuthPage) {
        return false
      }

      // If the user is logged in and trying to access auth pages, 
      // redirect them to the dashboard or home page
      if (isLoggedIn && isAuthPage) {
        return Response.redirect(new URL("/", nextUrl))
      }

      return true
    },
  },
  providers: [], // Configure your auth providers here
} satisfies NextAuthConfig
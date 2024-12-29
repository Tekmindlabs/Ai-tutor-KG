// /app/api/auth/[...nextauth]/route.ts
import { handlers } from "@/auth"

export const { GET, POST } = handlers

// Add error handling for the auth handlers
export function middleware(request: Request) {
  try {
    return handlers.middleware?.(request)
  } catch (error) {
    console.error('Auth handler error:', error)
    return new Response('Internal Server Error', { status: 500 })
  }
}
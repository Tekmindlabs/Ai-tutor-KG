// lib/auth/protected-api.ts
import { auth } from "@/auth"
import { NextRequest } from "next/server"

export function withAuth(
  handler: (req: NextRequest, session: any) => Promise<Response>
) {
  return async (req: NextRequest) => {
    const session = await auth()

    if (!session?.user?.id) {
      return new Response("Unauthorized", { status: 401 })
    }

    return handler(req, session)
  }
}
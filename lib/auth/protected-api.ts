// lib/auth/protected-api.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth"; // Make sure this path matches your auth configuration

export function withAuth(
  handler: (req: NextRequest, session: any) => Promise<Response>
) {
  return async (req: NextRequest) => {
    try {
      const session = await auth();

      // Add additional validation
      if (!session) {
        return NextResponse.json(
          { error: "No session found" },
          { status: 401 }
        );
      }

      if (!session?.user?.id) {
        return NextResponse.json(
          { error: "Unauthorized" },
          { status: 401 }
        );
      }

      return handler(req, session);
    } catch (error) {
      console.error("API auth error:", error);
      // Add more detailed error response
      return NextResponse.json(
        { 
          error: "Authentication error",
          details: error instanceof Error ? error.message : "Unknown error"
        },
        { status: 500 }
      );
    }
  };
}
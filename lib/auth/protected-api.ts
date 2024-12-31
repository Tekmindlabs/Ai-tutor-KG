// lib/auth/protected-api.ts
import { auth } from "@/auth";
import { NextRequest, NextResponse } from "next/server";

export function withAuth(
  handler: (req: NextRequest, session: any) => Promise<Response>
) {
  return async (req: NextRequest) => {
    try {
      const session = await auth();

      if (!session?.user?.id) {
        return NextResponse.json(
          { error: "Unauthorized" },
          { status: 401 }
        );
      }

      return handler(req, session);
    } catch (error) {
      console.error("API auth error:", error);
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      );
    }
  };
}
import { NextRequest } from "next/server";
import { auth } from "@/auth";

export async function withAuth(
  handler: (req: NextRequest, session: any) => Promise<Response>
) {
  return async function (req: NextRequest) {
    const session = await auth();
    
    if (!session?.user?.id) {
      return new Response("Unauthorized", { status: 401 });
    }

    return handler(req, session);
  };
}
import { NextRequest } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return new Response("Unauthorized", { status: 401 });
    }

    const { email, contentId, contentType, permissions } = await req.json();
    
    // Find user by email
    const sharedWithUser = await prisma.user.findUnique({
      where: { email },
    });

    if (!sharedWithUser) {
      return new Response("User not found", { status: 404 });
    }

    const shared = await prisma.sharedContent.create({
      data: {
        ownerId: session.user.id,
        sharedWithId: sharedWithUser.id,
        contentType,
        contentId,
        permissions,
      },
    });

    return Response.json(shared);
  } catch (error) {
    console.error("Sharing error:", error);
    return new Response("Internal error", { status: 500 });
  }
}
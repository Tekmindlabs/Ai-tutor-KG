import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const data = await req.json();

    // Update user with onboarding data
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        ...data,
        onboarded: true,
      },
    });

    return NextResponse.json({ success: true, user: updatedUser });
  } catch (error) {
    console.error("Onboarding error:", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
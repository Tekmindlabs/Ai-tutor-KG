import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { userDetailsSchema } from "@/lib/validations/onboarding";
import { NextResponse } from "next/server";
import { sendEmail } from "@/lib/email/send";
import { welcomeEmail } from "@/lib/email/templates";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const validatedData = userDetailsSchema.parse(body);

    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        ...validatedData,
        onboarded: true,
        consentDate: new Date(),
      },
    });

    // Send welcome email
    await sendEmail({
      to: updatedUser.email!,
      template: welcomeEmail(updatedUser.name!)
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Onboarding error:", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
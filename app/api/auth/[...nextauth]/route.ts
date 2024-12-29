// /app/api/auth/[...nextauth]/route.ts
import NextAuth from "next-auth"
import EmailProvider from "next-auth/providers/email"
import GoogleProvider from "next-auth/providers/google"
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY);

const handler = NextAuth({
    providers: [
      EmailProvider({
        // Using Resend for sending emails
        server: {
          host: "smtp.resend.com",
          port: 465,
          auth: {
            user: "resend",
            pass: process.env.RESEND_API_KEY
          }
        },
        from: process.env.RESEND_FROM || "onboarding@resend.dev",
        maxAge: 24 * 60 * 60, // Magic links are valid for 24 hours
        // Custom sendVerificationRequest function using Resend
        async sendVerificationRequest({
          identifier: email,
          url,
          provider: { from }
        }) {
          try {
            const { data, error } = await resend.emails.send({
              from: from,
              to: email,
              subject: "Sign in to AI Tutor",
              html: `<p>Click here to sign in: <a href="${url}">Sign in</a></p>`
            });

            if (error) {
              throw new Error(error.message);
            }
          } catch (error) {
            throw new Error("Failed to send verification email");
          }
        }
      }),
      GoogleProvider({
        clientId: process.env.AUTH_GOOGLE_ID,
        clientSecret: process.env.AUTH_GOOGLE_SECRET,
      })
    ],
    callbacks: {
      async signIn({ user, account }) {
        if (!user.email) return false;
        return true;
      }
    }
});

export { handler as GET, handler as POST }
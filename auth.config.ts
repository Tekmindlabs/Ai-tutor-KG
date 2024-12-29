// auth.config.ts
import Google from "next-auth/providers/google";
import Email from "next-auth/providers/email";
import { NextAuthConfig } from "next-auth";
import { Session, User } from "next-auth";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email/send";
import { signInEmail, welcomeEmail } from "@/lib/email/templates";

// Custom type definitions
interface CustomSession extends Session {
  user?: {
    id: string;
    onboarded: boolean;
    email?: string | null;
    name?: string | null;
    image?: string | null;
  }
}

interface CustomUser extends User {
  id: string;
  onboarded?: boolean;
  name?: string | null;
}

export const authConfig: NextAuthConfig = {
  providers: [
    Email({
      server: {
        host: process.env.EMAIL_SERVER_HOST,
        port: Number(process.env.EMAIL_SERVER_PORT),
        auth: {
          user: process.env.EMAIL_SERVER_USER,
          pass: process.env.EMAIL_SERVER_PASSWORD,
        },
      },
      from: process.env.RESEND_FROM,
      maxAge: 24 * 60 * 60, // Magic links are valid for 24 hours
      async generateVerificationToken() {
        // Generate a random string of 32 characters
        return crypto.randomUUID();
      },
      // Customize the email sending process
      async sendVerificationRequest({
        identifier: email,
        url,
        provider: { server, from },
      }) {
        // Get user details if they exist
        const user = await prisma.user.findUnique({
          where: { email },
          select: { name: true, onboarded: true }
        });

        // Determine if this is a new user or existing user
        const template = user?.name 
          ? signInEmail(user.name, url)
          : welcomeEmail("there", url); // Generic greeting for new users

        try {
          await sendEmail({
            to: email,
            template: template
          });
        } catch (error) {
          console.error('Error sending verification email:', error);
          throw new Error('Failed to send verification email');
        }
      },
    }),
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
  ],
  callbacks: {
    async signIn({ 
      user, 
      account, 
      profile 
    }) {
      // Always allow Google sign-in
      if (account?.provider === "google") {
        return true;
      }

      // For email sign-in, ensure the email exists
      if (account?.provider === "email") {
        if (!user.email) return false;
        
        // Check if user exists
        const existingUser = await prisma.user.findUnique({
          where: { email: user.email },
        });

        // Allow sign in for both existing and new users
        return true;
      }

      return false;
    },

    async session({ 
      session, 
      user 
    }: { 
      session: CustomSession; 
      user: CustomUser 
    }): Promise<CustomSession> {
      if (session?.user) {
        session.user.id = user.id;
        
        // Fetch latest user data from database
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
          select: {
            id: true,
            onboarded: true,
            name: true,
            email: true,
          }
        });
        
        if (dbUser) {
          session.user.onboarded = dbUser.onboarded ?? false;
          session.user.name = dbUser.name ?? null;
          session.user.email = dbUser.email ?? null;
        }
      }
      return session;
    },

    async redirect({ 
      url, 
      baseUrl 
    }: { 
      url: string; 
      baseUrl: string 
    }): Promise<string> {
      // Handle various redirect scenarios
      if (url.startsWith(baseUrl)) {
        // Allow redirect to onboarding
        if (url.includes('/onboarding')) {
          return url;
        }
        
        // Check if user needs onboarding
        const session = await prisma.session.findFirst({
          where: {
            accessToken: url.split('token=')[1]
          },
          include: {
            user: true
          }
        });

        if (session?.user && !session.user.onboarded) {
          return `${baseUrl}/onboarding`;
        }

        // Redirect to welcome page after successful authentication
        return `${baseUrl}/welcome`;
      }
      return baseUrl;
    }
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
    verifyRequest: "/auth/verify-request", // Page shown after email is sent
  },
  events: {
    async createUser({ user }) {
      // Handle new user creation
      if (user.email) {
        try {
          await prisma.user.update({
            where: { id: user.id },
            data: {
              onboarded: false, // Ensure new users go through onboarding
            },
          });
        } catch (error) {
          console.error('Error updating new user:', error);
        }
      }
    },
  },
  debug: process.env.NODE_ENV === 'development',
} satisfies NextAuthConfig;

export default authConfig;
// auth.config.ts
import Google from "next-auth/providers/google";
import Email from "next-auth/providers/email";
import { NextAuthConfig } from "next-auth";
import { Session, User } from "next-auth";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email/send";
import { signInEmail, welcomeEmail } from "@/lib/email/templates";
import crypto from 'crypto';

// Custom type definitions
interface CustomSession extends Session {
  user?: {
    id: string;
    onboarded: boolean;
    email?: string | null;
    name?: string | null;
    image?: string | null;
    role?: string;
    preferences?: {
      language?: string;
      theme?: string;
    };
  }
}

interface CustomUser extends User {
  id: string;
  onboarded?: boolean;
  name?: string | null;
  role?: string;
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
        secure: true,
      },
      from: process.env.RESEND_FROM,
      maxAge: 24 * 60 * 60, // Magic links are valid for 24 hours
      async generateVerificationToken() {
        return crypto.randomUUID();
      },
      async sendVerificationRequest({
        identifier: email,
        url,
        provider: { server, from },
      }) {
        const user = await prisma.user.findUnique({
          where: { email },
          select: { 
            name: true, 
            onboarded: true,
            preferences: true 
          }
        });

        const template = user?.name 
          ? signInEmail(user.name, url)
          : welcomeEmail("there", url);

        try {
          await sendEmail({
            to: email,
            template: template,
            subject: user?.name ? "Sign in to AI Tutor" : "Welcome to AI Tutor"
          });
        } catch (error) {
          console.error('Error sending verification email:', error);
          throw new Error('Failed to send verification email');
        }
      },
    }),
    Google({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code"
        }
      }
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === "google") {
        try {
          // Update or create user profile with Google data
          await prisma.user.upsert({
            where: { email: user.email! },
            update: {
              name: user.name,
              image: user.image,
              lastLogin: new Date(),
            },
            create: {
              email: user.email!,
              name: user.name,
              image: user.image,
              onboarded: false,
              role: 'user',
            },
          });
          return true;
        } catch (error) {
          console.error('Error during Google sign in:', error);
          return false;
        }
      }

      if (account?.provider === "email") {
        if (!user.email) return false;
        
        try {
          const existingUser = await prisma.user.findUnique({
            where: { email: user.email },
          });

          if (!existingUser) {
            await prisma.user.create({
              data: {
                email: user.email,
                onboarded: false,
                role: 'user',
              },
            });
          }
          return true;
        } catch (error) {
          console.error('Error during email sign in:', error);
          return false;
        }
      }

      return false;
    },

    async session({ session, user }: { session: CustomSession; user: CustomUser }): Promise<CustomSession> {
      if (session?.user) {
        session.user.id = user.id;
        
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
          select: {
            id: true,
            onboarded: true,
            name: true,
            email: true,
            role: true,
            preferences: true,
          }
        });
        
        if (dbUser) {
          session.user.onboarded = dbUser.onboarded ?? false;
          session.user.name = dbUser.name;
          session.user.email = dbUser.email;
          session.user.role = dbUser.role;
          session.user.preferences = dbUser.preferences;
        }
      }
      return session;
    },

    async redirect({ url, baseUrl }): Promise<string> {
      if (url.startsWith(baseUrl)) {
        if (url.includes('/onboarding')) return url;
        
        const token = url.split('token=')[1];
        if (token) {
          const session = await prisma.session.findFirst({
            where: { accessToken: token },
            include: { user: true }
          });

          if (session?.user && !session.user.onboarded) {
            return `${baseUrl}/onboarding`;
          }
        }
        return `${baseUrl}/dashboard`;
      }
      return baseUrl;
    }
  },

  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
    verifyRequest: "/auth/verify-request",
  },

  events: {
    async createUser({ user }) {
      if (user.email) {
        try {
          await prisma.user.update({
            where: { id: user.id },
            data: {
              onboarded: false,
              role: 'user',
              preferences: {
                language: 'en',
                theme: 'light'
              }
            },
          });
        } catch (error) {
          console.error('Error updating new user:', error);
        }
      }
    },

    async signIn({ user }) {
      try {
        await prisma.user.update({
          where: { id: user.id },
          data: { lastLogin: new Date() },
        });
      } catch (error) {
        console.error('Error updating last login:', error);
      }
    },
  },

  debug: process.env.NODE_ENV === 'development',
} satisfies NextAuthConfig;

export default authConfig;
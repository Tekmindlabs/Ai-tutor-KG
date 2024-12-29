// /app/api/auth/[...nextauth]/route.ts
const handler = NextAuth({
    providers: [
      EmailProvider({
        server: {
          host: process.env.EMAIL_SERVER_HOST,
          port: process.env.EMAIL_SERVER_PORT,
          auth: {
            user: process.env.EMAIL_SERVER_USER,
            pass: process.env.EMAIL_SERVER_PASSWORD,
          },
        },
        from: process.env.RESEND_FROM,
        maxAge: 24 * 60 * 60, // Magic links are valid for 24 hours
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
import NextAuth from "next-auth"
import { config } from "@/lib/auth"

const handler = NextAuth(config);

export const { GET, POST } = handler;  // Note: Changed from 'handlers' to 'handler'
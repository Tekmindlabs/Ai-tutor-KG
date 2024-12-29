import NextAuth from "next-auth"
import { handlers } from "@/lib/auth"

// All configuration is now handled in auth.config.ts
export const { GET, POST } = handlers
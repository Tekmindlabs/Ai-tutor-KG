import NextAuth from "next-auth"
import { authConfig } from "@/auth.config"

const handler = NextAuth(authConfig)

// Change the export syntax to this:
export const GET = handler
export const POST = handler
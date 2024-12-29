import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";
import { handlers } from "@/auth"


const handler = NextAuth(authOptions);

export const { GET, POST } = handlers
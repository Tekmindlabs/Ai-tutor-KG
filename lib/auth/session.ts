import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { cache } from "react";


export const getSession = cache(async () => {

  return await getServerSession(authOptions);

});


export const getCurrentUser = cache(async () => {

  const session = await getSession();

  return session?.user;

});
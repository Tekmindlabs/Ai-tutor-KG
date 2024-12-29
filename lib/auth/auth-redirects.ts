import { auth } from "@/lib/auth"

export async function handleRedirect(url: string, baseUrl: string) {
  if (url.startsWith(baseUrl)) {
    const session = await auth();
    if (session?.user && !session.user.onboarded) {
      return `${baseUrl}/onboarding`;
    }
    return `${baseUrl}/chat`;
  }
  return baseUrl;
}
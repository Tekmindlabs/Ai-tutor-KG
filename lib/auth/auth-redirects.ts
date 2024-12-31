// lib/auth/auth-redirects.ts
export async function handleRedirect(url: string, baseUrl: string) {
  try {
    if (!url.startsWith(baseUrl)) {
      return baseUrl;
    }

    const session = await auth();
    
    // Add null check and type safety
    if (!session?.user) {
      return `${baseUrl}/auth/signin`;
    }

    if (!session.user.onboarded) {
      return `${baseUrl}/onboarding`;
    }

    return `${baseUrl}/chat`;
  } catch (error) {
    console.error("Redirect error:", error);
    // Fallback to base URL on error
    return baseUrl;
  }
}
import { headers } from 'next/headers'
import { auth } from '@/auth'  // Add this import statement
import { redirect } from 'next/navigation'

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  const headersList = headers();
  const pathname = headersList.get("x-pathname") || "";
  
  if (!session) {
    redirect("/api/auth/signin");
  }

  if (!session.user.onboarded && !pathname.includes("/onboarding")) {
    redirect("/onboarding");
  }

  return (
    <html lang="en">
      <body>
        <main className="min-h-screen bg-gradient-to-b from-white to-gray-100 dark:from-gray-900 dark:to-black">
          {children}
        </main>
      </body>
    </html>
  );
}
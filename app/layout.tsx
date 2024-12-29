// /app/layout.tsx
import { headers } from 'next/headers'
import { auth } from '@/auth'

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Remove the authentication check from root layout
  return (
    <html lang="en">
      <body>
        <main className="min-h-screen bg-gradient-to-b from-white to-gray-100 dark:from-gray-900 dark:to-black">
          {children}
        </main>
      </body>
    </html>
  )
}
// /app/layout.tsx
import { headers } from 'next/headers'
import { auth } from '@/auth'

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  try {
    return (
      <html lang="en">
        <head>
          {/* Add proper DOCTYPE */}
          <meta charSet="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
        </head>
        <body>
          <main className="min-h-screen bg-gradient-to-b from-white to-gray-100 dark:from-gray-900 dark:to-black">
            {children}
          </main>
        </body>
      </html>
    )
  } catch (error) {
    console.error('Layout error:', error)
    return (
      <html lang="en">
        <body>
          <div>Something went wrong. Please try again later.</div>
        </body>
      </html>
    )
  }
}
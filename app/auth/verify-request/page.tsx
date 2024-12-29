// /app/auth/verify-request/page.tsx
export default function VerifyRequest() {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-white to-gray-100 dark:from-gray-900 dark:to-black">
        <div className="max-w-md w-full space-y-8 p-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
              Check your email
            </h2>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              A sign in link has been sent to your email address. Please check your inbox and click the link to continue.
            </p>
          </div>
        </div>
      </div>
    );
  }
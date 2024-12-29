// /app/auth/error/page.tsx
export default function AuthError() {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-white to-gray-100 dark:from-gray-900 dark:to-black">
        <div className="max-w-md w-full space-y-8 p-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
              Authentication Error
            </h2>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              There was a problem signing you in. Please try again or contact support if the problem persists.
            </p>
            <a
              href="/auth/signin"
              className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Back to Sign In
            </a>
          </div>
        </div>
      </div>
    );
  }
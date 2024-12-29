export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-white to-gray-100 dark:from-gray-900 dark:to-black">
      <div className="max-w-4xl mx-auto text-center px-4">
        <h1 className="text-5xl font-bold mb-6">
          Welcome to AI Tutor
        </h1>
        <p className="text-xl mb-8">
          Your personalized learning companion powered by AI
        </p>
        
        <div className="space-x-4">
          <a 
            href="/onboarding" 
            className="inline-block px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Get Started
          </a>
          <a 
            href="/auth/signin" 
            className="inline-block px-8 py-3 bg-white text-blue-600 border border-blue-600 rounded-lg hover:bg-gray-50 transition"
          >
            Login
          </a>
        </div>
      </div>
    </div>
  );
}
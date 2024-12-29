"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function WelcomePage() {
  const { data: session } = useSession();
  const router = useRouter();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-white to-gray-100 dark:from-gray-900 dark:to-black">
      <div className="max-w-4xl mx-auto text-center px-4 space-y-8">
        <h1 className="text-5xl font-bold mb-6 animate-fade-in">
          Welcome back, {session?.user?.name}! 👋
        </h1>
        
        <p className="text-xl mb-8 text-gray-600 dark:text-gray-300">
          Ready to continue your learning journey?
        </p>
        
        <div className="space-y-4">
          <Button
            onClick={() => router.push('/chat')}
            className="px-8 py-6 text-lg bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all duration-300 transform hover:scale-105"
          >
            Let's Start Learning! 🚀
          </Button>
          
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Your AI tutor is ready to help you achieve your goals
          </p>
        </div>
      </div>
    </div>
  );
}
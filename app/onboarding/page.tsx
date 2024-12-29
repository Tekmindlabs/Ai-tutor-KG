"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Onboarding() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: "",
    phoneNumber: "",
    age: 0,
    interests: [] as string[],
    gdprConsent: false,
    email: "",
  });
  const router = useRouter();

  const questions = [
    {
      id: 1,
      text: "What's your name?",
      field: "name",
      type: "text",
    },
    {
      id: 2,
      text: "How old are you?",
      field: "age",
      type: "number",
    },
    {
      id: 3,
      text: "What are your learning interests?",
      field: "interests",
      type: "multiselect",
      options: ["Math", "Science", "Languages", "Programming", "Arts"],
    },
    {
      id: 4,
      text: "What's your email address?",
      field: "email",
      type: "email",
    },
  ];

  const handleAnswer = (answer: any) => {
    setFormData(prev => ({
      ...prev,
      [questions[step - 1].field]: answer
    }));
    
    if (step === questions.length) {
      completeOnboarding();
    } else {
      setStep(prev => prev + 1);
    }
  };

  const completeOnboarding = async () => {
    try {
      const response = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      
      if (response.ok) {
        router.push("/auth/signin");
      }
    } catch (error) {
      console.error("Onboarding error:", error);
    }
  };

  const currentQuestion = questions[step - 1];

  return (
    <div className="max-w-2xl mx-auto p-8">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <h2 className="text-2xl mb-6">{currentQuestion.text}</h2>
        
        {currentQuestion.type === "multiselect" ? (
          <div className="space-y-2">
            {currentQuestion.options?.map((option) => (
              <label key={option} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  value={option}
                  onChange={(e) => {
                    const newInterests = e.target.checked
                      ? [...formData.interests, option]
                      : formData.interests.filter(i => i !== option);
                    handleAnswer(newInterests);
                  }}
                />
                <span>{option}</span>
              </label>
            ))}
          </div>
        ) : (
          <input
            type={currentQuestion.type}
            className="w-full p-2 border rounded"
            onChange={(e) => handleAnswer(e.target.value)}
          />
        )}
        
        {currentQuestion.type !== "multiselect" && (
          <button
            onClick={() => handleAnswer(formData[currentQuestion.field])}
            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded"
          >
            Next
          </button>
        )}
      </div>
    </div>
  );
}
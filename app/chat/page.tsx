"use client";


import { useChat } from "ai/react";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ModelSelector } from "@/components/chat/model-selector";
import { ChatMessage } from "@/components/chat/chat-message";
import { InputControls } from "@/components/chat/input-controls";

export default function ChatPage() {

  const { data: session } = useSession({

    required: true,

    onUnauthenticated() {

      redirect("/auth/signin");

    },

  });


  const [model, setModel] = useState("gemini-pro");

  const { messages, handleSubmit, isLoading } = useChat({

    api: "/api/chat",

    body: { model },

  });


  const onSubmit = async (text: string, images?: File[]) => {

    const formData = new FormData();

    formData.append("message", text);

    // ... rest of your code

  };


  return (

  return (
    <div className="container mx-auto max-w-4xl py-8">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-bold">AI Tutor Chat</h1>
        <ModelSelector value={model} onValueChange={setModel} />
      </div>
      
      <Card className="flex h-[600px] flex-col">
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {messages.map((message) => (
              <ChatMessage key={message.id} message={message} />
            ))}
          </div>
        </ScrollArea>

        <div className="border-t p-4">
          <InputControls onSubmit={onSubmit} isLoading={isLoading} />
        </div>
      </Card>
    </div>
  );
}
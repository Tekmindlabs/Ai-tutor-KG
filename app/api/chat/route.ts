import { GoogleGenerativeAI } from "@google/generative-ai";
import { StreamingTextResponse } from "ai";
import { NextRequest } from "next/server";
import { withAuth } from "@/lib/auth/protected-api";
import { LangChainStream } from "ai/streams";
import { prisma } from "@/lib/prisma";
import { AgentGraph } from "@/lib/ai/agents";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY!);

export const POST = withAuth(async (req: NextRequest, session) => {
  try {
    const formData = await req.formData();
    const message = formData.get("message") as string;
    const images = formData.getAll("images") as File[];
    const model = formData.get("model") as string || "gemini-pro";

    const { stream, handlers } = LangChainStream();

    // Store the chat message
    await prisma.chat.create({
      data: {
        userId: session.user.id,
        message,
        response: "",
      },
    });

    const genModel = genAI.getGenerativeModel({ model });

    // Handle multimodal input
    const parts: any[] = [{ text: message }];
    
    if (images.length > 0 && model === "gemini-pro-vision") {
      for (const image of images) {
        const imageData = await image.arrayBuffer();
        parts.push({
          inlineData: {
            data: Buffer.from(imageData).toString("base64"),
            mimeType: image.type
          }
        });
      }
    }

    // Create agent graph for processing
    const workflow = new AgentGraph()
      .addNode("process_input", async (state: any) => {
        const result = await genModel.generateContent(parts);
        return {
          ...state,
          response: result.response.text(),
        };
      })
      .addNode("generate_speech", async (state: any) => {
        // Here you could integrate with a text-to-speech service
        // For now, we'll just pass through the text response
        handlers.onToken(state.response);
        return state;
      })
      .setEntryPoint("process_input")
      .addEdge("process_input", "generate_speech");

    // Execute workflow
    await workflow.execute({
      message,
      chatId: session.user.id,
    });

    return new StreamingTextResponse(stream);
  } catch (error) {
    console.error("Chat error:", error);
    return new Response("Internal error", { status: 500 });
  }
});
import { NextRequest, NextResponse } from "next/server";
import { getLLMResponse } from "@/helpers/llm_helper_api";
import { createImageFromPrompt } from "@/helpers/image_helper_generation";
import { getMemory, setMemory } from "@/helpers/memory_helper_manager";

 
const imageCache: { [key: string]: string } = {};

const generateConsistentImage = async (
  prompt: string,
  memoryKey: string
): Promise<string | null> => {
  
  if (imageCache[prompt]) {
    console.log("Using cached image for prompt:", prompt);
    return imageCache[prompt];
  }

  const memory = getMemory(memoryKey);
  const seed = memory?.seed || Math.floor(Math.random() * 1000000);  

   
  const imageBase64 = await createImageFromPrompt({
    prompt,
    steps: 20,
    n: 1,
    width: 1024,
    height: 768,
    seed,
  });

  if (imageBase64) {
    setMemory(memoryKey, {
      promptInfo: prompt,
      seed,
      imageUrl: imageBase64,
    });

     
    imageCache[prompt] = imageBase64;
  }

  return imageBase64;
};

const getClientIP = (req: NextRequest): string => {
    const forwardedFor = req.headers.get("X-Forwarded-For");
    return forwardedFor ? forwardedFor.split(",")[0] : "unknown";
  };

export async function POST(req: NextRequest) {
  try {
    const { conversation, persona } = await req.json();

    const llmResponse = await getLLMResponse({
      persona: persona || "You are a helpful AI assistant.",
      conversation,
    });

    let finalText = llmResponse.text;
    let imageBase64: string | null = null;

     
    const userLastMsg =
      conversation[conversation.length - 1]?.content.toLowerCase() || "";
    if (
      /(?:show|image|photo|picture|display|generate|create|draw|make).*/i.test(
        userLastMsg
      )
    ) {
      try {
        const subject = userLastMsg
          .replace(/show|me|an?|the|image|of|picture|photo/gi, "")
          .trim();
        const prompt = `High quality, detailed image of ${subject}`;

        console.log("Using prompt:", prompt);
        const clientIp=getClientIP(req)
        imageBase64 = await generateConsistentImage(prompt, clientIp);

        finalText += imageBase64
          ? "\nHere's the image you requested!"
          : "\nI apologize, but I couldn't generate the image at this time.";
      } catch (error) {
        console.error("Image generation error:", error);
        finalText +=
          "\nI encountered an error while trying to generate the image.";
      }
    }

    return NextResponse.json({ text: finalText, imageBase64 });
  } catch (error) {
    console.error("/api/chat error:", error);

    if (error instanceof Error) {
      return NextResponse.json({
        text: "I apologize, but I encountered an error.",
        error: error.message,
      });
    } else {
      return NextResponse.json({
        text: "I apologize, but I encountered an unexpected error.",
        error: "An unknown error occurred.",
      });
    }
  }
}

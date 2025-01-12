import Together from "together-ai";

export interface ImageGenerationParams {
  prompt: string;
  steps?: number;
  n?: number;
  width?: number;
  height?: number;
  seed?: number;
}

const together = new Together({
  apiKey: process.env.TOGETHER_API_KEY || "",
});

export async function createImageFromPrompt({
  prompt,
  steps = 4,
  n = 1,
  width = 1024,
  height = 768,
  seed,
}: ImageGenerationParams): Promise<string | null> {
  try {
    const response = await together.images.create({
      model: "black-forest-labs/FLUX.1-schnell-Free",
      prompt,
      width,
      height,
      steps: Math.min(steps, 4),
      n,
      seed,
      response_format: "base64",
    });

    return response?.data?.[0]?.b64_json || null;
  } catch (error) {
    console.error("generateImage error:", error);
    return null;
  }
}

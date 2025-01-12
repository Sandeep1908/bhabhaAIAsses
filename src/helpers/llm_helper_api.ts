interface ChatMessage {
    role: "system" | "user" | "assistant";
    content: string;
  }
  
  interface LLMRequest {
    persona: string;
    conversation: ChatMessage[];
  }
  
  interface LLMResponse {
    text: string;
  }
  
  const endpoint = "http://localhost:11434";  
  
  export async function getLLMResponse(req: LLMRequest): Promise<LLMResponse> {
    try {
      
      const combinedPrompt = `${req.persona}\n\n${req.conversation.map(msg => `${msg.role === "user" ? "Human" : "Assistant"}: ${msg.content}\n`).join("")}Assistant:`;
  
      console.log("Sending prompt to Ollama:", combinedPrompt);
  
      const response = await fetch(`${endpoint}/api/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "llama3.2:latest",
          prompt: combinedPrompt,
          stream: false,
        }),
      });
  
      if (!response.ok) {
        throw new Error(`Ollama API error: ${response.status} - ${response.statusText}`); // Include status text
      }
  
      const data = await response.json();
      console.log("Ollama response:", data);
  
      return { text: data.response || "" };
    } catch (error) {
      console.error("callLLM error:", error);
      return { text: "I apologize, but I'm having trouble responding right now." };
    }
  }
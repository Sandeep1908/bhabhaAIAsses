"use client";

import Image from "next/image";
import { useState, useRef, useEffect, useCallback } from "react";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  imageBase64?: string;
  timestamp?: number;
}

export default function HomePage() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content: "Hello there! How can I help you today?",
      timestamp: Date.now(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const persona =
    "You are Rancho, a character from 3 Idiots. You are an engineer, love art, and studied at Imperial College of Engineering. Answer questions humorously and create visuals when relevant.";

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    try {
      setIsLoading(true);
      const newUserMsg: ChatMessage = {
        role: "user",
        content: input,
        timestamp: Date.now(),
      };
      setMessages((prevMessages) => [...prevMessages, newUserMsg]);
      setInput("");

      const res = await fetch("/api/message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversation: [...messages, newUserMsg],
          persona,
        }),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        throw new Error(data.error || `HTTP error! status: ${res.status}`);
      }

      const newAssistantMsg: ChatMessage = {
        role: "assistant",
        content: data.text,
        imageBase64: data.imageBase64,
        timestamp: Date.now(),
      };

      setMessages((prevMessages) => [...prevMessages, newAssistantMsg]);
    } catch (error) {
      console.error("Chat error:", error);
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          role: "assistant",
          content: `Error: ${
            error instanceof Error ? error.message : "Something went wrong"
          }`,
          timestamp: Date.now(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <main className="bg-white min-h-screen flex flex-col">
      <div className="flex-grow px-4 py-10">
        <div className="max-w-5xl mx-auto">
          <div className="space-y-6 mb-6 max-h-[calc(100vh-200px)] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${
                  msg.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[80%] relative p-4 rounded-xl shadow-md 
                    ${
                      msg.role === "user"
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 text-gray-800"
                    }`}
                >
                  {msg.role === "assistant" && (
                    <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-2 h-2 bg-gray-200 rounded-full"></div>
                  )}
                  <p className="text-sm leading-relaxed">{msg.content}</p>
                  {msg.imageBase64 && (
                    <div className="mt-4">
                      <Image
                        src={`data:image/png;base64,${msg.imageBase64}`}
                        alt="Generated"
                        width={400}
                        height={300}
                        className="rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300"
                      />
                    </div>
                  )}
                  {msg.timestamp && (
                    <p className="text-xs opacity-50 mt-2">
                      {new Date(msg.timestamp).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  )}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
            {isLoading && (
              <div className="flex justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-blue-600 border-opacity-50"></div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="sticky bottom-0 left-0 w-full border-t border-gray-200 bg-white px-4 py-4">
        <div className="max-w-5xl mx-auto relative">
          <input
            type="text"
            className="w-full bg-gray-100 text-gray-800 p-4 pl-12 pr-14 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent placeholder-gray-400"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Send a message"
            disabled={isLoading}
          />
          <button
            onClick={handleSend}
            disabled={isLoading}
            className={`absolute right-4 top-1/2 -translate-y-1/2 px-4 py-2 font-medium text-white transition-colors duration-200 
              ${
                isLoading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700 active:bg-blue-800"
              }`}
          >
            {isLoading ? (
              <svg
                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            ) : (
              "Send"
            )}
          </button>
          <div className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full flex items-center justify-center bg-gray-200">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="w-4 h-4 text-gray-600"
            >
              <path
                fillRule="evenodd"
                d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 11h-3l-2.293 2.293a1 1 0 001.414 1.414L17 13.414V17a1 1 0 102 0v-3.586l.293.293a1 1 0 101.414-1.414L13.414 13H17a1 1 0 000-2h-3a.75.75 0 01-.75-.75 4.25 4.25 0 00-8.5 0 .75.75 0 01-.75.75h-3a1 1 0 000 2h3a7.001 7.001 0 003.062-5.062l-2.293-2.293a1 1 0 00-1.414-1.414L13 7.586V4a1 1 0 00-2 0v3.586l-.293-.293a1 1 0 00-1.414 1.414L7 7.586V4a1 1 0 00-2 0v3.586a.75.75 0 01-.75.75 4.25 4.25 0 00-8.5 0 .75.75 0 01-.75-.75h-3a1 1 0 100 2h3a1 1 0 000-2H3a.75.75 0 01-.75-.75 4.25 4.25 0 00-8.5 0 .75.75 0 01-.75.75h-3a1 1 0 000 2h3a1 1 0 00.93 1.364l2.293 2.293a1 1 0 001.414-1.414L7 10.414V17a1 1 0 102 0v-3.586l.293.293a1 1 0 001.414-1.414L13.414 13H17a1 1 0 100-2h-3z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        </div>
      </div>
    </main>
  );
}
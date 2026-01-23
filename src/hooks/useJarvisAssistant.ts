import { useState, useCallback } from "react";

interface JarvisResponse {
  confidence: string;
  message: string;
}

interface UseJarvisAssistantReturn {
  sendMessage: (message: string) => Promise<{ message: string; confidence?: string } | null>;
  isLoading: boolean;
  error: string | null;
}

const WEBHOOK_URL = "http://localhost:5678/webhook/Jarvis-AI-Assistant";

const useJarvisAssistant = (): UseJarvisAssistantReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendMessage = useCallback(async (message: string): Promise<{ message: string; confidence?: string } | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(WEBHOOK_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message }),
      });

      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }

      const data = await response.json();

      // Parse the nested response field which contains JSON string
      if (data?.response) {
        try {
          const parsed: JarvisResponse = typeof data.response === "string" 
            ? JSON.parse(data.response) 
            : data.response;
          
          return {
            message: parsed.message || "I couldn't process that request.",
            confidence: parsed.confidence,
          };
        } catch {
          // If parsing fails, try to use response directly as message
          return {
            message: typeof data.response === "string" ? data.response : "I couldn't process that request.",
          };
        }
      }

      return {
        message: "I received your message but couldn't generate a response.",
      };
    } catch (err) {
      console.error("Jarvis Assistant error:", err);
      setError(err instanceof Error ? err.message : "Unknown error");
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    sendMessage,
    isLoading,
    error,
  };
};

export default useJarvisAssistant;

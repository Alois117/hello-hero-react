import { useState, useCallback } from "react";
import { useAuthenticatedFetch } from "@/keycloak/hooks/useAuthenticatedFetch";
import { WEBHOOK_JARVIS_ASSISTANT_URL } from "@/config/env";
import { safeParseResponse } from "@/lib/safeFetch";

interface JarvisResponse {
  confidence: string;
  message: string;
}

interface UseJarvisAssistantReturn {
  sendMessage: (message: string) => Promise<{ message: string; confidence?: string } | null>;
  isLoading: boolean;
  error: string | null;
}

const WEBHOOK_URL = WEBHOOK_JARVIS_ASSISTANT_URL;

const useJarvisAssistant = (): UseJarvisAssistantReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { authenticatedFetch } = useAuthenticatedFetch();
  const sendMessage = useCallback(async (message: string): Promise<{ message: string; confidence?: string } | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await authenticatedFetch(WEBHOOK_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message }),
      });

      const result = await safeParseResponse<any>(response, WEBHOOK_URL);
      if (!result.ok) {
        throw new Error(result.userMessage);
      }

      const data = result.data;

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
      const safe = err instanceof Error ? err.message : "Jarvis is temporarily unavailable. Please try again.";
      console.error("[useJarvisAssistant] Error:", err);
      setError(safe);
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

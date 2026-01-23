import { useState, useRef, useEffect } from "react";
import { Send, Sparkles, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import useJarvisAssistant from "@/hooks/useJarvisAssistant";

interface Message {
  role: "user" | "assistant";
  content: string;
  confidence?: string;
}

interface ChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const ChatDrawer = ({ isOpen, onClose }: ChatDrawerProps) => {
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Hello! I'm your AI assistant. How can I help you today?" }
  ]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { sendMessage, isLoading } = useJarvisAssistant();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: "user", content: input };
    setMessages(prev => [...prev, userMessage]);
    const userInput = input;
    setInput("");

    const response = await sendMessage(userInput);

    if (response) {
      setMessages(prev => [...prev, { 
        role: "assistant", 
        content: response.message, 
        confidence: response.confidence 
      }]);
    } else {
      setMessages(prev => [...prev, { 
        role: "assistant", 
        content: "I'm having trouble connecting right now. Please try again later." 
      }]);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-20 right-4 sm:bottom-24 sm:right-6 w-[280px] sm:w-[320px] max-h-[70vh] glass-card rounded-xl border border-primary/20 shadow-xl flex flex-col z-50 animate-scale-in overflow-hidden">
      {/* Header */}
      <div className="p-3 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-primary/10">
            <Sparkles className="w-4 h-4 text-primary glow-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-sm">Jarvis AI</h3>
            <p className="text-xs text-muted-foreground">Your AI Assistant</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {messages.map((message, index) => (
          <div key={index} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"} animate-fade-in`}>
            <div className={`max-w-[85%] p-3 rounded-lg text-sm ${
              message.role === "user" ? "bg-primary/20 border border-primary/30" : "glass-card border border-border"
            }`}>
              {message.role === "assistant" && message.confidence && (
                <div className="flex items-center gap-1.5 mb-1.5">
                  <Bot className="w-3.5 h-3.5 text-primary" />
                  <Badge variant="outline" className="text-xs">{message.confidence}</Badge>
                </div>
              )}
              <p className="leading-relaxed">{message.content}</p>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start animate-fade-in">
            <div className="glass-card p-3 rounded-lg border border-border">
              <div className="flex gap-1.5">
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse" style={{ animationDelay: "0.2s" }} />
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse" style={{ animationDelay: "0.4s" }} />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-3 border-t border-border flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && handleSend()}
          placeholder="Ask me anything..."
          className="glass-input text-sm flex-1"
          disabled={isLoading}
        />
        <Button onClick={handleSend} className="neon-button px-3 py-2" disabled={isLoading}>
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

export default ChatDrawer;

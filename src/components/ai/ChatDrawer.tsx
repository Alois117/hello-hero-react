import { useState, useRef, useEffect } from "react";
import { Send, Sparkles, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import ModelSelector from "./ModelSelector";

interface Message {
  role: "user" | "assistant";
  content: string;
  confidence?: number;
}

interface ChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const ChatDrawer = ({ isOpen, onClose }: ChatDrawerProps) => {
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Hello! I'm your AI assistant. How can I help you today?", confidence: 98 }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = { role: "user", content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    setTimeout(() => {
      const responses = [
        "I've analyzed your system metrics. Everything looks healthy.",
        "I recommend scaling your database servers by 20%.",
        "I detected an anomaly in your network traffic. Want me to investigate?",
        "Your CPU usage has decreased by 15% after optimization.",
      ];

      const randomResponse = responses[Math.floor(Math.random() * responses.length)];
      const confidence = Math.floor(Math.random() * 15) + 85;

      setMessages(prev => [...prev, { role: "assistant", content: randomResponse, confidence }]);
      setIsTyping(false);
    }, 1000);
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
            <h3 className="font-semibold text-sm">AI Assistant</h3>
            <p className="text-xs text-muted-foreground">Jarvis AI</p>
          </div>
        </div>
        <ModelSelector />
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
                  <Badge variant="outline" className="text-xs">{message.confidence}% confident</Badge>
                </div>
              )}
              <p className="leading-relaxed">{message.content}</p>
            </div>
          </div>
        ))}
        {isTyping && (
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
        />
        <Button onClick={handleSend} className="neon-button px-3 py-2">
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

export default ChatDrawer;
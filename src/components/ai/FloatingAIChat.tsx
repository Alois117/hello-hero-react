import { useState } from "react";
import { MessageCircle, X, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import ChatDrawer from "./ChatDrawer";

const FloatingAIChat = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Floating Chat Button - Smaller and positioned to avoid header */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-4 right-4 h-12 w-12 rounded-full neon-button z-50 md:bottom-6 md:right-6 md:h-14 md:w-14"
        aria-label="Open AI Chat"
      >
        {isOpen ? (
          <X className="w-5 h-5 md:w-6 md:h-6" />
        ) : (
          <div className="relative">
            <MessageCircle className="w-5 h-5 md:w-6 md:h-6" />
            <Sparkles className="w-2 h-2 md:w-3 md:h-3 text-accent absolute -top-1 -right-1 animate-pulse-glow" />
          </div>
        )}
      </Button>

      {/* Chat Drawer - Ensure it doesn't overlap with header */}
      <ChatDrawer 
        isOpen={isOpen} 
        onClose={() => setIsOpen(false)} 
      />
    </>
  );
};

export default FloatingAIChat;
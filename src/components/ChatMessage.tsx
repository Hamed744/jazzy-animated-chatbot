import React, { useState, useEffect } from "react";
import { Bot, User, Copy, ThumbsUp, ThumbsDown, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface ChatMessageProps {
  message: {
    id: string;
    content: string;
    role: "user" | "assistant";
    timestamp: Date;
    isTyping?: boolean;
  };
  className?: string;
}

const TypingAnimation = () => {
  return (
    <div className="typing-dots flex items-center gap-1">
      <span className="w-2 h-2 bg-current rounded-full"></span>
      <span className="w-2 h-2 bg-current rounded-full"></span>
      <span className="w-2 h-2 bg-current rounded-full"></span>
    </div>
  );
};

const TypewriterText = ({ text, speed = 30 }: { text: string; speed?: number }) => {
  const [displayText, setDisplayText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timer = setTimeout(() => {
        setDisplayText(prev => prev + text[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, speed);
      return () => clearTimeout(timer);
    }
  }, [currentIndex, text, speed]);

  return (
    <div className="whitespace-pre-wrap">
      {displayText}
      {currentIndex < text.length && (
        <span className="animate-pulse">|</span>
      )}
    </div>
  );
};

export default function ChatMessage({ message, className }: ChatMessageProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [showTypewriter, setShowTypewriter] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (message.role === "assistant" && !message.isTyping) {
      const timer = setTimeout(() => setShowTypewriter(true), 100);
      return () => clearTimeout(timer);
    }
  }, [message.role, message.isTyping]);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      toast({
        title: "کپی شد!",
        description: "متن پیام در کلیپ‌بورد کپی شد.",
      });
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  const isUser = message.role === "user";

  return (
    <div
      className={cn(
        "group relative flex gap-4 p-4 message-slide-in message-hover",
        isUser ? "flex-row-reverse" : "flex-row",
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Avatar */}
      <div
        className={cn(
          "flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium scale-hover",
          isUser
            ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white glow-effect shimmer"
            : "bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 border-2 border-gray-300"
        )}
      >
        {isUser ? <User className="h-5 w-5" /> : <Bot className="h-5 w-5" />}
      </div>

      {/* Message Content */}
      <div className="flex-1 max-w-3xl">
        <div
          className={cn(
            "rounded-2xl px-4 py-3 text-sm leading-6 shadow-sm",
            isUser
              ? "message-bubble-user ml-12"
              : "message-bubble-bot mr-12"
          )}
        >
          {message.isTyping ? (
            <div className="flex items-center gap-2">
              <TypingAnimation />
              <span className="text-xs opacity-70">در حال تایپ...</span>
            </div>
          ) : showTypewriter && message.role === "assistant" ? (
            <TypewriterText text={message.content} />
          ) : (
            <div className="whitespace-pre-wrap">{message.content}</div>
          )}
        </div>

        {/* Message Actions */}
        {!message.isTyping && (
          <div
            className={cn(
              "flex items-center gap-2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity",
              isUser ? "justify-end" : "justify-start"
            )}
          >
            <span className="text-xs text-muted-foreground">
              {message.timestamp.toLocaleTimeString("fa-IR", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
            
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 hover:bg-muted"
                onClick={copyToClipboard}
              >
                <Copy className="h-3 w-3" />
              </Button>
              
              {!isUser && (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 hover:bg-muted"
                  >
                    <ThumbsUp className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 hover:bg-muted"
                  >
                    <ThumbsDown className="h-3 w-3" />
                  </Button>
                </>
              )}
              
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 hover:bg-muted"
              >
                <MoreHorizontal className="h-3 w-3" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
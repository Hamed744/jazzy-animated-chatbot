import React, { useState, useEffect, useRef } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Menu, Settings, MoreVertical } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import ChatSidebar from "./ChatSidebar";
import ChatMessage from "./ChatMessage";
import ChatInput from "./ChatInput";
import chatBackground from "@/assets/chat-background.jpg";

interface Message {
  id: string;
  content: string;
  role: "user" | "assistant";
  timestamp: Date;
  isTyping?: boolean;
}

interface Chat {
  id: string;
  title: string;
  timestamp: Date;
  messages: Message[];
  isStarred?: boolean;
}

export default function ChatInterface() {
  const [chats, setChats] = useState<Chat[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string | undefined>();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const currentChat = chats.find(chat => chat.id === currentChatId);
  const messages = currentChat?.messages || [];

  // Create initial chat on mount
  useEffect(() => {
    if (chats.length === 0) {
      createNewChat();
    }
  }, []);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const createNewChat = () => {
    const newChat: Chat = {
      id: `chat_${Date.now()}`,
      title: "چت جدید",
      timestamp: new Date(),
      messages: [],
      isStarred: false
    };

    setChats(prev => [newChat, ...prev]);
    setCurrentChatId(newChat.id);
    setIsSidebarOpen(false);

    toast({
      title: "چت جدید ایجاد شد",
      description: "چت جدید آماده استفاده است.",
    });
  };

  const selectChat = (chatId: string) => {
    setCurrentChatId(chatId);
    setIsSidebarOpen(false);
  };

  const deleteChat = (chatId: string) => {
    setChats(prev => prev.filter(chat => chat.id !== chatId));
    
    if (currentChatId === chatId) {
      const remainingChats = chats.filter(chat => chat.id !== chatId);
      setCurrentChatId(remainingChats[0]?.id);
      
      if (remainingChats.length === 0) {
        createNewChat();
      }
    }

    toast({
      title: "چت حذف شد",
      description: "چت با موفقیت حذف شد.",
    });
  };

  const toggleStarred = (chatId: string) => {
    setChats(prev =>
      prev.map(chat =>
        chat.id === chatId
          ? { ...chat, isStarred: !chat.isStarred }
          : chat
      )
    );
  };

  const updateChatTitle = (chatId: string, newTitle: string) => {
    setChats(prev =>
      prev.map(chat =>
        chat.id === chatId
          ? { ...chat, title: newTitle }
          : chat
      )
    );
  };

  const sendMessage = async (content: string, files?: File[]) => {
    if (!currentChatId || (!content.trim() && !files?.length)) return;

    const userMessage: Message = {
      id: `msg_${Date.now()}`,
      content,
      role: "user",
      timestamp: new Date()
    };

    // Add user message
    setChats(prev =>
      prev.map(chat =>
        chat.id === currentChatId
          ? {
              ...chat,
              messages: [...chat.messages, userMessage],
              timestamp: new Date()
            }
          : chat
      )
    );

    // Update chat title if it's the first message
    if (currentChat && currentChat.messages.length === 0 && content.trim()) {
      const title = content.slice(0, 50) + (content.length > 50 ? "..." : "");
      updateChatTitle(currentChatId, title);
    }

    // Show typing indicator
    setIsTyping(true);
    const typingMessage: Message = {
      id: "typing",
      content: "",
      role: "assistant",
      timestamp: new Date(),
      isTyping: true
    };

    setChats(prev =>
      prev.map(chat =>
        chat.id === currentChatId
          ? {
              ...chat,
              messages: [...chat.messages, typingMessage]
            }
          : chat
      )
    );

    // Simulate AI response
    setTimeout(() => {
      const responses = [
        "سلام! من یک دستیار هوشمند هستم. چگونه می‌توانم به شما کمک کنم؟",
        "این سوال بسیار جالبی است. بگذارید در مورد آن فکر کنم...",
        "متشکرم که با من در میان گذاشتید. این موضوع را بررسی می‌کنم.",
        "درک می‌کنم که به دنبال پاسخی هستید. اجازه دهید توضیح کاملی ارائه دهم.",
        "بسیار عالی! این نکته‌ای است که ارزش بحث دارد."
      ];

      const aiResponse: Message = {
        id: `msg_${Date.now()}_ai`,
        content: responses[Math.floor(Math.random() * responses.length)],
        role: "assistant",
        timestamp: new Date()
      };

      setChats(prev =>
        prev.map(chat =>
          chat.id === currentChatId
            ? {
                ...chat,
                messages: chat.messages.slice(0, -1).concat(aiResponse)
              }
            : chat
        )
      );

      setIsTyping(false);
    }, 1500 + Math.random() * 2000);
  };

  return (
    <div 
      className="flex h-screen w-full bg-gradient-to-br from-background to-muted/30 relative"
      style={{
        backgroundImage: `url(${chatBackground})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundBlendMode: 'overlay'
      }}
    >
      <div className="absolute inset-0 bg-background/90 backdrop-blur-sm" />
      
      <div className="relative flex w-full h-full z-10">
        {/* Sidebar */}
        <ChatSidebar
          isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        chats={chats}
        currentChatId={currentChatId}
        onSelectChat={selectChat}
        onNewChat={createNewChat}
        onDeleteChat={deleteChat}
          onToggleStarred={toggleStarred}
        />

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border bg-card/50 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsSidebarOpen(true)}
              className="md:hidden"
            >
              <Menu className="h-5 w-5" />
            </Button>
            
            <div>
              <h1 className="text-lg font-semibold gradient-text">
                {currentChat?.title || "چت‌بات هوشمند"}
              </h1>
              {isTyping && (
                <p className="text-xs text-muted-foreground animate-pulse">
                  در حال تایپ کردن...
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon">
              <Settings className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon">
              <MoreVertical className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Messages Area */}
        <ScrollArea className="flex-1 px-4">
          <div className="max-w-4xl mx-auto py-6 space-y-6">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center space-y-6 py-12">
                <div className="w-20 h-20 rounded-full bg-gradient-primary flex items-center justify-center shadow-glow">
                  <span className="text-2xl text-primary-foreground">🤖</span>
                </div>
                <div>
                  <h2 className="text-2xl font-bold gradient-text mb-2">
                    به چت‌بات هوشمند خوش آمدید!
                  </h2>
                  <p className="text-muted-foreground max-w-md mx-auto">
                    من اینجا هستم تا به سوالات شما پاسخ دهم، فایل‌هایتان را تحلیل کنم و در هر موضوعی که نیاز دارید کمکتان کنم.
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl">
                  {[
                    "سوال کلی بپرسید",
                    "فایلی برای تحلیل بفرستید", 
                    "درباره یک موضوع صحبت کنید",
                    "کمک در حل مسئله بخواهید"
                  ].map((suggestion, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      className="p-4 h-auto text-right justify-start hover:shadow-card transition-all duration-200"
                      onClick={() => sendMessage(suggestion)}
                    >
                      {suggestion}
                    </Button>
                  ))}
                </div>
              </div>
            ) : (
              messages.map((message) => (
                <ChatMessage key={message.id} message={message} />
              ))
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Input Area */}
        <ChatInput
          onSendMessage={sendMessage}
          disabled={isTyping}
          placeholder="پیام خود را بنویسید..."
          />
        </div>
      </div>
    </div>
  );
}
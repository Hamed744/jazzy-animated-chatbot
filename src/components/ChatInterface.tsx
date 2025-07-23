import React, { useState, useEffect, useRef } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Menu, Settings, MoreVertical } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import ChatSidebar from "./ChatSidebar";
import ChatMessage from "./ChatMessage";
import ChatInput from "./ChatInput";
import ModelSelector from "./ModelSelector";
import { sendToGemini } from "@/services/geminiService";
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
  const [selectedModel, setSelectedModel] = useState("gemini-1.5-flash");
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
      title: "گفتگوی جدید",
      timestamp: new Date(),
      messages: [],
      isStarred: false
    };

    setChats(prev => [newChat, ...prev]);
    setCurrentChatId(newChat.id);
    setIsSidebarOpen(false);

    toast({
      title: "گفتگوی جدید ایجاد شد",
      description: "گفتگوی جدید آماده استفاده است.",
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
      title: "گفتگو حذف شد",
      description: "گفتگو با موفقیت حذف شد.",
      variant: "destructive",
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

    // Get AI response from Gemini
    try {
      const chatHistory = currentChat?.messages?.filter(m => !m.isTyping) || [];
      const conversationHistory = [...chatHistory, userMessage].map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      const aiResponseText = await sendToGemini(conversationHistory, selectedModel);
      
      const aiResponse: Message = {
        id: `msg_${Date.now()}_ai`,
        content: aiResponseText,
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
    } catch (error) {
      console.error("Error getting AI response:", error);
      const errorMessage: Message = {
        id: `msg_${Date.now()}_error`,
        content: `متأسفم، خطایی رخ داد: ${error instanceof Error ? error.message : 'خطای نامشخص'}`,
        role: "assistant",
        timestamp: new Date()
      };

      setChats(prev =>
        prev.map(chat =>
          chat.id === currentChatId
            ? {
                ...chat,
                messages: chat.messages.slice(0, -1).concat(errorMessage)
              }
            : chat
        )
      );

      setIsTyping(false);
      toast({
        title: "خطا در دریافت پاسخ",
        description: "لطفاً دوباره تلاش کنید.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex h-screen w-full bg-background relative">
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-muted/20" />
      
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
        <div className="flex items-center justify-between p-3 border-b border-border bg-background">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsSidebarOpen(true)}
              className="md:hidden"
            >
              <Menu className="h-5 w-5" />
            </Button>
            
            <div className="text-center flex-1">
              <h1 className="text-lg font-semibold text-foreground">
                گفتگوی جدید
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <ModelSelector 
              selectedModel={selectedModel} 
              onModelChange={setSelectedModel} 
            />
            <Button variant="ghost" size="icon" className="w-8 h-8">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Messages Area */}
        <ScrollArea className="flex-1 px-4">
          <div className="max-w-4xl mx-auto py-6 space-y-6">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center space-y-8 py-20">
                <div className="w-12 h-12 rounded-full bg-foreground flex items-center justify-center">
                  <span className="text-xl text-background">G</span>
                </div>
                <div>
                  <h2 className="text-2xl text-foreground mb-2">
                    سلام، چت‌بات هوش مصنوعی آلفا
                  </h2>
                  <p className="text-muted-foreground text-lg">
                    چگونه می‌توانم به شما کمک کنم؟
                  </p>
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
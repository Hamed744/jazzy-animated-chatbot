import React, { useState } from "react";
import { 
  MessageSquare, 
  Plus, 
  Trash2, 
  Menu,
  X,
  History,
  Star,
  Archive
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface Chat {
  id: string;
  title: string;
  timestamp: Date;
  isStarred?: boolean;
}

interface ChatSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  chats: Chat[];
  currentChatId?: string;
  onSelectChat: (chatId: string) => void;
  onNewChat: () => void;
  onDeleteChat: (chatId: string) => void;
  onToggleStarred: (chatId: string) => void;
}

export default function ChatSidebar({
  isOpen,
  onToggle,
  chats,
  currentChatId,
  onSelectChat,
  onNewChat,
  onDeleteChat,
  onToggleStarred
}: ChatSidebarProps) {
  const [hoveredChat, setHoveredChat] = useState<string | null>(null);

  const formatDate = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return "امروز";
    if (days === 1) return "دیروز";
    if (days < 7) return `${days} روز پیش`;
    return date.toLocaleDateString("fa-IR");
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={onToggle}
        />
      )}
      
      {/* Sidebar */}
      <div
        className={cn(
          "fixed right-0 top-0 h-full w-80 bg-card border-l border-border z-50 transform transition-transform duration-300 ease-in-out md:relative md:transform-none",
          isOpen ? "translate-x-0" : "translate-x-full md:translate-x-0",
          !isOpen && "md:w-16"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          {isOpen && (
            <h2 className="text-lg font-semibold gradient-text">چت‌ها</h2>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggle}
            className="hover:bg-primary/10"
          >
            {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>

        {/* New Chat Button */}
        <div className="p-4">
          <Button
            onClick={onNewChat}
            className={cn(
              "bg-gradient-primary hover:shadow-glow transition-all duration-300",
              isOpen ? "w-full" : "w-8 h-8 p-0"
            )}
          >
            <Plus className="h-4 w-4" />
            {isOpen && <span className="mr-2">چت جدید</span>}
          </Button>
        </div>

        {/* Chat List */}
        <ScrollArea className="flex-1 px-2">
          <div className="space-y-2 pb-4">
            {chats.map((chat) => (
              <div
                key={chat.id}
                className={cn(
                  "group relative p-3 rounded-lg cursor-pointer transition-all duration-200 animate-slide-in-up",
                  currentChatId === chat.id
                    ? "bg-primary/10 border border-primary/20"
                    : "hover:bg-muted/50",
                  !isOpen && "w-12 h-12 p-2 mx-auto"
                )}
                onClick={() => onSelectChat(chat.id)}
                onMouseEnter={() => setHoveredChat(chat.id)}
                onMouseLeave={() => setHoveredChat(null)}
              >
                {isOpen ? (
                  <>
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <MessageSquare className="h-4 w-4 text-primary flex-shrink-0" />
                          {chat.isStarred && (
                            <Star className="h-3 w-3 text-yellow-500 fill-current" />
                          )}
                        </div>
                        <p className="text-sm font-medium truncate mt-1">
                          {chat.title}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatDate(chat.timestamp)}
                        </p>
                      </div>
                      
                      {hoveredChat === chat.id && (
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={(e) => {
                              e.stopPropagation();
                              onToggleStarred(chat.id);
                            }}
                          >
                            <Star 
                              className={cn(
                                "h-3 w-3",
                                chat.isStarred ? "text-yellow-500 fill-current" : ""
                              )} 
                            />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 hover:text-destructive"
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeleteChat(chat.id);
                            }}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <MessageSquare className="h-6 w-6 text-primary mx-auto" />
                )}
              </div>
            ))}
          </div>
        </ScrollArea>

        {/* Footer */}
        {isOpen && (
          <div className="border-t border-border p-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <History className="h-4 w-4" />
              <span>{chats.length} چت ذخیره شده</span>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
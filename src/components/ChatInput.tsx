import React, { useState, useRef, useCallback } from "react";
import { 
  Send, 
  Paperclip, 
  Mic, 
  Square,
  Smile,
  Image,
  FileText
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import FileUpload from "./FileUpload";

interface ChatInputProps {
  onSendMessage: (message: string, files?: File[]) => void;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
}

export default function ChatInput({
  onSendMessage,
  disabled = false,
  placeholder = "پیام خود را بنویسید...",
  className
}: ChatInputProps) {
  const [message, setMessage] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [showFileUpload, setShowFileUpload] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (message.trim() || attachedFiles.length > 0) {
      onSendMessage(message.trim(), attachedFiles);
      setMessage("");
      setAttachedFiles([]);
      setShowFileUpload(false);
      
      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const adjustTextareaHeight = useCallback(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, []);

  const handleFileSelect = (files: any[]) => {
    const fileList = files.map(f => f.file);
    setAttachedFiles(prev => [...prev, ...fileList]);
  };

  const toggleRecording = () => {
    setIsRecording(!isRecording);
    // Here you would integrate with speech recognition API
  };

  const isMessageEmpty = !message.trim() && attachedFiles.length === 0;

  return (
    <div className={cn("border-t border-border bg-background/95 backdrop-blur-sm", className)}>
      {/* File Upload Panel */}
      {showFileUpload && (
        <div className="p-4 border-b border-border animate-slide-in-up">
          <FileUpload
            onFilesSelected={handleFileSelect}
            maxFiles={3}
            maxSize={5}
            className="max-w-2xl mx-auto"
          />
        </div>
      )}

      {/* Attached Files Preview */}
      {attachedFiles.length > 0 && (
        <div className="p-3 border-b border-border">
          <div className="flex flex-wrap gap-2 max-w-2xl mx-auto">
            {attachedFiles.map((file, index) => (
              <div
                key={index}
                className="flex items-center gap-2 bg-muted rounded-lg px-3 py-2 text-sm animate-bounce-in"
              >
                {file.type.startsWith("image/") ? (
                  <Image className="h-4 w-4 text-primary" />
                ) : (
                  <FileText className="h-4 w-4 text-primary" />
                )}
                <span className="truncate max-w-32">{file.name}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-5 w-5 hover:text-destructive"
                  onClick={() => {
                    setAttachedFiles(prev => prev.filter((_, i) => i !== index));
                  }}
                >
                  ×
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="p-4">
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
          <div className="relative flex items-end gap-3 bg-card rounded-2xl border border-border shadow-card p-2">
            {/* Action Buttons - Left Side */}
            <div className="flex items-center gap-1">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className={cn(
                  "h-8 w-8 transition-all duration-200",
                  showFileUpload && "bg-primary/10 text-primary"
                )}
                onClick={() => setShowFileUpload(!showFileUpload)}
              >
                <Paperclip className="h-4 w-4" />
              </Button>
              
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className={cn(
                  "h-8 w-8 transition-all duration-200",
                  isRecording && "bg-red-100 text-red-600 animate-pulse"
                )}
                onClick={toggleRecording}
              >
                {isRecording ? <Square className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              </Button>
              
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8"
              >
                <Smile className="h-4 w-4" />
              </Button>
            </div>

            {/* Text Input */}
            <div className="flex-1">
              <Textarea
                ref={textareaRef}
                value={message}
                onChange={(e) => {
                  setMessage(e.target.value);
                  adjustTextareaHeight();
                }}
                onKeyPress={handleKeyPress}
                placeholder={isRecording ? "در حال ضبط صدا..." : placeholder}
                disabled={disabled || isRecording}
                className="min-h-[40px] max-h-[120px] resize-none border-0 bg-transparent text-right placeholder:text-right focus-visible:ring-0 focus-visible:ring-offset-0"
                style={{ height: "40px" }}
              />
            </div>

            {/* Send Button */}
            <Button
              type="submit"
              disabled={disabled || isMessageEmpty}
              className={cn(
                "h-8 w-8 rounded-full transition-all duration-200 p-0",
                !isMessageEmpty
                  ? "bg-gradient-primary hover:shadow-glow scale-100"
                  : "scale-90 opacity-50"
              )}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center justify-center gap-4 mt-3 text-xs text-muted-foreground">
            <span>Enter برای ارسال</span>
            <span>•</span>
            <span>Shift + Enter برای خط جدید</span>
            {isRecording && (
              <>
                <span>•</span>
                <span className="text-red-600 animate-pulse">در حال ضبط...</span>
              </>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
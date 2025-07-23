import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

interface ModelSelectorProps {
  selectedModel: string;
  onModelChange: (model: string) => void;
}

const models = [
  { id: "gemini-2.5-pro", name: "Gemini 2.5 Pro", description: "قدرتمندترین مدل با دقت بالا" },
  { id: "gemini-2.5-flash", name: "Gemini 2.5 Flash", description: "بهترین نسبت قیمت و عملکرد" },
  { id: "gemini-2.5-flash-lite", name: "Gemini 2.5 Flash-Lite", description: "مقرون به صرفه و سریع" },
  { id: "gemini-2.0-flash", name: "Gemini 2.0 Flash", description: "نسل بعدی سرعت و قابلیت‌ها" },
  { id: "gemini-2.0-flash-lite", name: "Gemini 2.0 Flash-Lite", description: "کارآمد و کم تأخیر" },
  { id: "gemini-1.5-flash", name: "Gemini 1.5 Flash", description: "سریع و همه منظوره" },
  { id: "gemini-1.5-pro", name: "Gemini 1.5 Pro", description: "استدلال پیچیده" },
  { id: "gemini-1.5-flash-8b", name: "Gemini 1.5 Flash-8B", description: "حجم بالا و هوش کمتر" },
];

export default function ModelSelector({ selectedModel, onModelChange }: ModelSelectorProps) {
  const currentModel = models.find(m => m.id === selectedModel);

  return (
    <Select value={selectedModel} onValueChange={onModelChange}>
      <SelectTrigger className="w-[140px] h-8 bg-background border border-border rounded-lg text-sm font-medium hover:bg-accent/50 transition-all duration-200">
        <SelectValue placeholder="انتخاب مدل">
          <div className="flex items-center gap-1">
            <span className="text-sm">{currentModel?.name}</span>
          </div>
        </SelectValue>
      </SelectTrigger>
      <SelectContent className="bg-background border-border shadow-lg rounded-lg">
        {models.map((model) => (
          <SelectItem 
            key={model.id} 
            value={model.id}
            className="hover:bg-accent cursor-pointer transition-colors text-right"
          >
            <div className="flex flex-col items-end gap-1">
              <span className="font-medium text-sm">{model.name}</span>
              <span className="text-xs text-muted-foreground">{model.description}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
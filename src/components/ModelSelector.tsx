import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

interface ModelSelectorProps {
  selectedModel: string;
  onModelChange: (model: string) => void;
}

const models = [
  { id: "gemini-1.5-flash", name: "Gemini 1.5 Flash", description: "سریع و کارآمد" },
  { id: "gemini-1.5-pro", name: "Gemini 1.5 Pro", description: "قدرتمند و دقیق" },
  { id: "gemini-1.0-pro", name: "Gemini 1.0 Pro", description: "پایدار و قابل اعتماد" },
];

export default function ModelSelector({ selectedModel, onModelChange }: ModelSelectorProps) {
  const currentModel = models.find(m => m.id === selectedModel);

  return (
    <div className="flex items-center gap-3 animate-fade-in">
      <Badge variant="secondary" className="text-xs">
        مدل هوش مصنوعی
      </Badge>
      <Select value={selectedModel} onValueChange={onModelChange}>
        <SelectTrigger className="w-[200px] bg-card border-border hover:bg-accent/50 transition-all duration-200">
          <SelectValue placeholder="انتخاب مدل">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">{currentModel?.name}</span>
            </div>
          </SelectValue>
        </SelectTrigger>
        <SelectContent className="bg-card border-border shadow-lg">
          {models.map((model) => (
            <SelectItem 
              key={model.id} 
              value={model.id}
              className="hover:bg-accent/50 cursor-pointer transition-colors"
            >
              <div className="flex flex-col items-end gap-1">
                <span className="font-medium">{model.name}</span>
                <span className="text-xs text-muted-foreground">{model.description}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
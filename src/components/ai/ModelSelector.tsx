import { useState } from "react";
import { ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

const models = [
  { id: "ollama", name: "Ollama (Local)", cost: "Free" },
  { id: "huggingface", name: "HuggingFace", cost: "Low" },
  { id: "groq", name: "Groq", cost: "Medium" },
  { id: "openai", name: "OpenAI GPT-4", cost: "High" },
];

const ModelSelector = () => {
  const [selectedModel, setSelectedModel] = useState(models[0]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <span className="text-xs">{selectedModel.name}</span>
          <ChevronDown className="w-3 h-3" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="glass-card">
        {models.map((model) => (
          <DropdownMenuItem
            key={model.id}
            onClick={() => setSelectedModel(model)}
            className="cursor-pointer"
          >
            <div className="flex items-center justify-between w-full">
              <span>{model.name}</span>
              <span className="text-xs text-muted-foreground ml-4">{model.cost}</span>
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ModelSelector;

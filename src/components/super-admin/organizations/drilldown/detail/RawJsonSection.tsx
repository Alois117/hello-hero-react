/**
 * RawJsonSection - Collapsible raw data section for advanced users
 */
import { useState } from "react";
import { ChevronDown, Code } from "lucide-react";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";

interface RawJsonSectionProps {
  data: unknown;
  label?: string;
}

const RawJsonSection = ({ data, label = "Raw Data" }: RawJsonSectionProps) => {
  const [isOpen, setIsOpen] = useState(false);

  if (!data || (typeof data === "object" && Object.keys(data as object).length === 0)) {
    return null;
  }

  return (
    <div className="border border-border/50 rounded-lg overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-3 text-sm text-muted-foreground hover:bg-muted/30 transition-colors"
        aria-expanded={isOpen}
        aria-label={`Toggle ${label}`}
      >
        <span className="flex items-center gap-2">
          <Code className="w-4 h-4" />
          {label}
        </span>
        <ChevronDown className={cn(
          "w-4 h-4 transition-transform duration-200",
          isOpen && "rotate-180"
        )} />
      </button>
      {isOpen && (
        <ScrollArea className="max-h-[300px]">
          <pre className="p-3 text-xs font-mono text-muted-foreground bg-muted/20 border-t border-border/30 overflow-x-auto whitespace-pre-wrap break-all">
            {JSON.stringify(data, null, 2)}
          </pre>
        </ScrollArea>
      )}
    </div>
  );
};

export default RawJsonSection;

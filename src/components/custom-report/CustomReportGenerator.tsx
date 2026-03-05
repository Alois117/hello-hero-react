import { useState } from "react";
import { format } from "date-fns";
import { CalendarIcon, X, Zap, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface CustomReportGeneratorProps {
  onGenerate: (from: Date, to: Date) => Promise<void>;
  isGenerating: boolean;
}

const CustomReportGenerator = ({ onGenerate, isGenerating }: CustomReportGeneratorProps) => {
  const [fromDate, setFromDate] = useState<Date | null>(null);
  const [toDate, setToDate] = useState<Date | null>(null);
  const [fromOpen, setFromOpen] = useState(false);
  const [toOpen, setToOpen] = useState(false);

  const isValidRange = fromDate && toDate && fromDate <= toDate;

  const handleGenerate = async () => {
    if (!fromDate || !toDate) return;
    await onGenerate(fromDate, toDate);
  };

  const handleClear = () => {
    setFromDate(null);
    setToDate(null);
  };

  return (
    <div className="glass-card p-4 rounded-xl border border-border/50">
      <div className="flex items-center gap-2 mb-4">
        <div className="p-2 rounded-lg bg-primary/10">
          <Zap className="w-4 h-4 text-primary" />
        </div>
        <div>
          <h3 className="font-semibold text-sm">Generate Custom Report</h3>
          <p className="text-xs text-muted-foreground">Select a date range to generate an on-demand report</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Popover open={fromOpen} onOpenChange={setFromOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-[160px] justify-start text-left font-normal border-border/50",
                !fromDate && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {fromDate ? format(fromDate, "PP") : "From date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={fromDate || undefined}
              onSelect={(date) => {
                setFromDate(date || null);
                setFromOpen(false);
              }}
              disabled={(date) => date > new Date()}
              initialFocus
              className="pointer-events-auto"
            />
          </PopoverContent>
        </Popover>

        <span className="text-muted-foreground text-sm">to</span>

        <Popover open={toOpen} onOpenChange={setToOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-[160px] justify-start text-left font-normal border-border/50",
                !toDate && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {toDate ? format(toDate, "PP") : "To date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={toDate || undefined}
              onSelect={(date) => {
                setToDate(date || null);
                setToOpen(false);
              }}
              disabled={(date) =>
                date > new Date() || (fromDate ? date < fromDate : false)
              }
              initialFocus
              className="pointer-events-auto"
            />
          </PopoverContent>
        </Popover>

        <div className="flex items-center gap-2 ml-auto">
          {(fromDate || toDate) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClear}
              className="text-muted-foreground hover:text-destructive"
            >
              <X className="w-4 h-4 mr-1" />
              Clear
            </Button>
          )}
          <Button
            onClick={handleGenerate}
            disabled={!isValidRange || isGenerating}
            className="neon-button"
            size="sm"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating…
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 mr-2" />
                Generate
              </>
            )}
          </Button>
        </div>
      </div>

      {fromDate && toDate && fromDate > toDate && (
        <p className="text-xs text-destructive mt-2">
          Start date must be before end date
        </p>
      )}
    </div>
  );
};

export default CustomReportGenerator;

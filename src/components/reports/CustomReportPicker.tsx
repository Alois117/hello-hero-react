import { useState } from "react";
import { format } from "date-fns";
import { CalendarIcon, X, FileSearch } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface CustomReportPickerProps {
  dateRange: { from: Date | null; to: Date | null };
  setDateRange: (range: { from: Date | null; to: Date | null }) => void;
  onGenerate: () => void;
  isLoading?: boolean;
}

const CustomReportPicker = ({
  dateRange,
  setDateRange,
  onGenerate,
  isLoading,
}: CustomReportPickerProps) => {
  const [fromOpen, setFromOpen] = useState(false);
  const [toOpen, setToOpen] = useState(false);

  const handleClear = () => {
    setDateRange({ from: null, to: null });
  };

  const isValidRange = dateRange.from && dateRange.to && dateRange.from <= dateRange.to;

  return (
    <div className="glass-card p-4 rounded-xl border border-border/50">
      <div className="flex items-center gap-2 mb-4">
        <div className="p-2 rounded-lg bg-primary/10">
          <FileSearch className="w-4 h-4 text-primary" />
        </div>
        <h3 className="font-semibold text-sm">Custom Reports</h3>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        {/* From Date */}
        <Popover open={fromOpen} onOpenChange={setFromOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-[160px] justify-start text-left font-normal border-border/50",
                !dateRange.from && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {dateRange.from ? format(dateRange.from, "PP") : "From date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={dateRange.from || undefined}
              onSelect={(date) => {
                setDateRange({ ...dateRange, from: date || null });
                setFromOpen(false);
              }}
              disabled={(date) => date > new Date()}
              initialFocus
              className="pointer-events-auto"
            />
          </PopoverContent>
        </Popover>

        <span className="text-muted-foreground">to</span>

        {/* To Date */}
        <Popover open={toOpen} onOpenChange={setToOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-[160px] justify-start text-left font-normal border-border/50",
                !dateRange.to && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {dateRange.to ? format(dateRange.to, "PP") : "To date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={dateRange.to || undefined}
              onSelect={(date) => {
                setDateRange({ ...dateRange, to: date || null });
                setToOpen(false);
              }}
              disabled={(date) =>
                date > new Date() || (dateRange.from ? date < dateRange.from : false)
              }
              initialFocus
              className="pointer-events-auto"
            />
          </PopoverContent>
        </Popover>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 ml-auto">
          {(dateRange.from || dateRange.to) && (
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
            onClick={onGenerate}
            disabled={!isValidRange || isLoading}
            className="neon-button"
            size="sm"
          >
            {isLoading ? "Loading..." : "Generate"}
          </Button>
        </div>
      </div>

      {/* Validation Message */}
      {dateRange.from && dateRange.to && dateRange.from > dateRange.to && (
        <p className="text-xs text-destructive mt-2">
          Start date must be before end date
        </p>
      )}
    </div>
  );
};

export default CustomReportPicker;

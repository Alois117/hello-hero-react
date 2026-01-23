"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { Calendar as CalendarIcon, X, Filter } from "lucide-react";
import { format } from "date-fns";
import { TransformedVeeamJob } from "@/hooks/useVeeamBackupAndReplication";

const timeRanges = [
  { label: "Last 1 hour", value: "1h" },
  { label: "Last 6 hours", value: "6h" },
  { label: "Last 24 hours", value: "24h" },
  { label: "Last 7 days", value: "7d" },
  { label: "Last 30 days", value: "30d" },
];

const statusOptions = ["Success", "Warning", "Failed"] as const;
const categoryOptions = ["BACKUP", "REPLICATION"] as const;

interface VeeamFiltersProps {
  filterStatus: TransformedVeeamJob["status"] | null;
  onFilterStatusChange: (status: TransformedVeeamJob["status"] | null) => void;
  selectedTimeRange: string;
  onTimeRangeChange: (range: string) => void;
  customDateFrom?: Date;
  onCustomDateFromChange: (date?: Date) => void;
  customDateTo?: Date;
  onCustomDateToChange: (date?: Date) => void;
  filterCategory: string | null;
  onFilterCategoryChange: (category: string | null) => void;
}

export default function VeeamFilters({
  filterStatus,
  onFilterStatusChange,
  selectedTimeRange,
  onTimeRangeChange,
  customDateFrom,
  onCustomDateFromChange,
  customDateTo,
  onCustomDateToChange,
  filterCategory,
  onFilterCategoryChange,
}: VeeamFiltersProps) {
  const [statusOpen, setStatusOpen] = useState(false);
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [timeOpen, setTimeOpen] = useState(false);

  const timeLabel = useMemo(() => {
    if (selectedTimeRange !== "custom") {
      return timeRanges.find(r => r.value === selectedTimeRange)?.label || "Time Range";
    }
    if (customDateFrom && customDateTo) {
      return `${format(customDateFrom, "MMM d, yyyy")} – ${format(customDateTo, "MMM d, yyyy")}`;
    }
    if (customDateFrom) return `From ${format(customDateFrom, "MMM d, yyyy")}`;
    if (customDateTo) return `To ${format(customDateTo, "MMM d, yyyy")}`;
    return "Custom range";
  }, [selectedTimeRange, customDateFrom, customDateTo]);

  const handleStatusSelect = (status: TransformedVeeamJob["status"]) => {
    // Toggle: if already selected → clear it
    onFilterStatusChange(filterStatus === status ? null : status);
    setStatusOpen(false);
  };

  const handleCategorySelect = (category: string) => {
    // Toggle: if already selected → clear it
    onFilterCategoryChange(filterCategory === category ? null : category);
    setCategoryOpen(false);
  };

  const clearStatus = () => {
    onFilterStatusChange(null);
    setStatusOpen(false);
  };

  const clearCategory = () => {
    onFilterCategoryChange(null);
    setCategoryOpen(false);
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Status Dropdown */}
      <DropdownMenu open={statusOpen} onOpenChange={setStatusOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="gap-2 min-w-[170px] justify-start text-left"
          >
            <Filter className="h-4 w-4" />
            {filterStatus || "Status"}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-72">
          <DropdownMenuLabel>Status Filter</DropdownMenuLabel>
          <DropdownMenuSeparator />
          
          {/* Explicit "All" / Clear option */}
          <DropdownMenuCheckboxItem
            checked={!filterStatus}
            onCheckedChange={() => {
              if (filterStatus) clearStatus();
            }}
          >
            All Statuses
          </DropdownMenuCheckboxItem>

          <DropdownMenuSeparator />

          {statusOptions.map((option) => (
            <DropdownMenuCheckboxItem
              key={option}
              checked={filterStatus === option}
              onCheckedChange={() => handleStatusSelect(option)}
            >
              {option}
            </DropdownMenuCheckboxItem>
          ))}

          {filterStatus && (
            <>
              <DropdownMenuSeparator />
              <div className="p-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
                  onClick={clearStatus}
                >
                  <X className="mr-2 h-4 w-4" />
                  Clear Status Filter
                </Button>
              </div>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Category Dropdown */}
      <DropdownMenu open={categoryOpen} onOpenChange={setCategoryOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="gap-2 min-w-[170px] justify-start text-left"
          >
            <Filter className="h-4 w-4" />
            {filterCategory || "Category"}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-72">
          <DropdownMenuLabel>Category Filter</DropdownMenuLabel>
          <DropdownMenuSeparator />
          
          {/* Explicit "All" / Clear option */}
          <DropdownMenuCheckboxItem
            checked={!filterCategory}
            onCheckedChange={() => {
              if (filterCategory) clearCategory();
            }}
          >
            All Categories
          </DropdownMenuCheckboxItem>

          <DropdownMenuSeparator />

          {categoryOptions.map((option) => (
            <DropdownMenuCheckboxItem
              key={option}
              checked={filterCategory === option}
              onCheckedChange={() => handleCategorySelect(option)}
            >
              {option}
            </DropdownMenuCheckboxItem>
          ))}

          {filterCategory && (
            <>
              <DropdownMenuSeparator />
              <div className="p-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
                  onClick={clearCategory}
                >
                  <X className="mr-2 h-4 w-4" />
                  Clear Category Filter
                </Button>
              </div>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Time Range Dropdown (unchanged) */}
      <DropdownMenu open={timeOpen} onOpenChange={setTimeOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="gap-2 min-w-[170px] justify-start text-left"
          >
            <CalendarIcon className="h-4 w-4" />
            {timeLabel}
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-72">
          <DropdownMenuLabel>Time Range</DropdownMenuLabel>
          <DropdownMenuSeparator />

          {timeRanges.map((range) => (
            <DropdownMenuCheckboxItem
              key={range.value}
              checked={selectedTimeRange === range.value}
              onCheckedChange={(checked) => {
                if (checked) {
                  onTimeRangeChange(range.value);
                  onCustomDateFromChange(undefined);
                  onCustomDateToChange(undefined);
                  setTimeOpen(false);
                }
              }}
            >
              {range.label}
            </DropdownMenuCheckboxItem>
          ))}

          <DropdownMenuSeparator />

          <div className="p-3 space-y-4">
            <p className="text-xs font-medium text-muted-foreground">Custom Range</p>

            <div className="grid gap-3">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="justify-start text-left font-normal">
                    {customDateFrom ? format(customDateFrom, "PPP") : "From date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={customDateFrom}
                    onSelect={(date) => {
                      onCustomDateFromChange(date ?? undefined);
                      onTimeRangeChange("custom");
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>

              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="justify-start text-left font-normal">
                    {customDateTo ? format(customDateTo, "PPP") : "To date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={customDateTo}
                    onSelect={(date) => {
                      onCustomDateToChange(date ?? undefined);
                      onTimeRangeChange("custom");
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {(selectedTimeRange !== "24h" || customDateFrom || customDateTo) && (
            <>
              <DropdownMenuSeparator />
              <div className="p-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start text-sm text-destructive hover:text-destructive hover:bg-destructive/10"
                  onClick={() => {
                    onTimeRangeChange("24h");
                    onCustomDateFromChange(undefined);
                    onCustomDateToChange(undefined);
                    setTimeOpen(false);
                  }}
                >
                  <X className="mr-2 h-4 w-4" />
                  Clear Time Filter
                </Button>
              </div>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
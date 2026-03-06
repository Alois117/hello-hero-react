import { useMemo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Filter, X, Clock, CheckCircle } from "lucide-react";
import { AlertSeverity } from "./SeverityBadge";

export type StatusFilter = "all" | "active" | "acknowledged";
export type TimeRange = "all" | "1h" | "6h" | "24h" | "7d";

interface AlertFiltersProps {
  selectedSeverity: AlertSeverity | "all";
  onSeverityChange: (severity: AlertSeverity | "all") => void;
  statusFilter: StatusFilter;
  onStatusFilterChange: (status: StatusFilter) => void;
  selectedTimeRange: TimeRange;
  onTimeRangeChange: (range: TimeRange) => void;
}

const ALL_SEVERITIES: AlertSeverity[] = ["disaster", "high", "average", "warning", "info"];

const TIME_RANGES: { label: string; value: TimeRange }[] = [
  { label: "All Time", value: "all" },
  { label: "Last 1h", value: "1h" },
  { label: "Last 6h", value: "6h" },
  { label: "Last 24h", value: "24h" },
  { label: "Last 7d", value: "7d" },
];

const STATUS_OPTIONS: { label: string; value: StatusFilter }[] = [
  { label: "All", value: "all" },
  { label: "Active", value: "active" },
  { label: "Acknowledged", value: "acknowledged" },
];

const AlertFilters = ({
  selectedSeverity,
  onSeverityChange,
  statusFilter,
  onStatusFilterChange,
  selectedTimeRange,
  onTimeRangeChange,
}: AlertFiltersProps) => {
  const isDefault = useMemo(
    () => selectedSeverity === "all" && statusFilter === "all" && selectedTimeRange === "all",
    [selectedSeverity, statusFilter, selectedTimeRange]
  );

  const clearAll = useCallback(() => {
    onSeverityChange("all");
    onStatusFilterChange("all");
    onTimeRangeChange("all");
  }, [onSeverityChange, onStatusFilterChange, onTimeRangeChange]);

  const activeCount = useMemo(() => {
    let count = 0;
    if (selectedSeverity !== "all") count++;
    if (statusFilter !== "all") count++;
    if (selectedTimeRange !== "all") count++;
    return count;
  }, [selectedSeverity, statusFilter, selectedTimeRange]);

  const severityLabel = selectedSeverity === "all"
    ? "Severity"
    : selectedSeverity.charAt(0).toUpperCase() + selectedSeverity.slice(1);

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Severity Filter — single-select */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="gap-1.5 h-9 text-sm">
            <Filter className="w-3.5 h-3.5" />
            {severityLabel}
            {selectedSeverity !== "all" && (
              <Badge variant="secondary" className="ml-1 px-1.5 py-0 text-[10px]">1</Badge>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-48">
          <DropdownMenuLabel className="text-xs">Severity Level</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuCheckboxItem
            checked={selectedSeverity === "all"}
            onCheckedChange={() => onSeverityChange("all")}
            className="text-sm"
          >
            All
          </DropdownMenuCheckboxItem>
          {ALL_SEVERITIES.map((severity) => (
            <DropdownMenuCheckboxItem
              key={severity}
              checked={selectedSeverity === severity}
              onCheckedChange={() => onSeverityChange(severity)}
              className="text-sm"
            >
              {severity.charAt(0).toUpperCase() + severity.slice(1)}
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Status Filter — single-select: All / Active / Acknowledged */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="gap-1.5 h-9 text-sm">
            <CheckCircle className="w-3.5 h-3.5" />
            {STATUS_OPTIONS.find((o) => o.value === statusFilter)?.label ?? "Status"}
            {statusFilter !== "all" && (
              <Badge variant="secondary" className="ml-1 px-1.5 py-0 text-[10px]">1</Badge>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-48">
          <DropdownMenuLabel className="text-xs">Alert Status</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {STATUS_OPTIONS.map((opt) => (
            <DropdownMenuCheckboxItem
              key={opt.value}
              checked={statusFilter === opt.value}
              onCheckedChange={() => onStatusFilterChange(opt.value)}
              className="text-sm"
            >
              {opt.label}
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Time Range — single-select */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="gap-1.5 h-9 text-sm">
            <Clock className="w-3.5 h-3.5" />
            {TIME_RANGES.find((r) => r.value === selectedTimeRange)?.label}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-48">
          <DropdownMenuLabel className="text-xs">Time Range</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {TIME_RANGES.map((range) => (
            <DropdownMenuCheckboxItem
              key={range.value}
              checked={selectedTimeRange === range.value}
              onCheckedChange={() => onTimeRangeChange(range.value)}
              className="text-sm"
            >
              {range.label}
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Clear All */}
      {!isDefault && (
        <Button
          variant="ghost"
          size="sm"
          onClick={clearAll}
          className="gap-1.5 h-9 text-sm text-muted-foreground hover:text-foreground"
          aria-label={`Clear ${activeCount} active filter${activeCount > 1 ? "s" : ""}`}
        >
          <X className="w-3.5 h-3.5" />
          Clear{activeCount > 0 ? ` (${activeCount})` : ""}
        </Button>
      )}
    </div>
  );
};

export default AlertFilters;

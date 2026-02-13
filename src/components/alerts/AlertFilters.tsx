import { useState, useMemo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Search,
  Filter,
  X,
  Clock,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { AlertSeverity } from "./SeverityBadge";

interface AlertFiltersProps {
  selectedSeverities: AlertSeverity[];
  onSeverityChange: (severities: AlertSeverity[]) => void;
  showAcknowledged: boolean;
  onShowAcknowledgedChange: (show: boolean) => void;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
}

const ALL_SEVERITIES: AlertSeverity[] = ["disaster", "high", "average", "warning", "info"];

const TIME_RANGES = [
  { label: "All Time", value: "all" },
  { label: "Last 1h", value: "1h" },
  { label: "Last 6h", value: "6h" },
  { label: "Last 24h", value: "24h" },
  { label: "Last 7d", value: "7d" },
];

const AlertFilters = ({
  selectedSeverities,
  onSeverityChange,
  showAcknowledged,
  onShowAcknowledgedChange,
  searchQuery = "",
  onSearchChange,
}: AlertFiltersProps) => {
  const [selectedTimeRange, setSelectedTimeRange] = useState("all");

  const toggleSeverity = useCallback(
    (severity: AlertSeverity) => {
      if (selectedSeverities.includes(severity)) {
        onSeverityChange(selectedSeverities.filter((s) => s !== severity));
      } else {
        onSeverityChange([...selectedSeverities, severity]);
      }
    },
    [selectedSeverities, onSeverityChange]
  );

  const isDefault = useMemo(
    () =>
      selectedSeverities.length === ALL_SEVERITIES.length &&
      ALL_SEVERITIES.every((s) => selectedSeverities.includes(s)) &&
      showAcknowledged &&
      selectedTimeRange === "all" &&
      !searchQuery,
    [selectedSeverities, showAcknowledged, selectedTimeRange, searchQuery]
  );

  const clearAll = useCallback(() => {
    onSeverityChange([...ALL_SEVERITIES]);
    onShowAcknowledgedChange(true);
    setSelectedTimeRange("all");
    onSearchChange?.("");
  }, [onSeverityChange, onShowAcknowledgedChange, onSearchChange]);

  const activeCount = useMemo(() => {
    let count = 0;
    if (selectedSeverities.length < ALL_SEVERITIES.length) count++;
    if (!showAcknowledged) count++;
    if (selectedTimeRange !== "all") count++;
    if (searchQuery) count++;
    return count;
  }, [selectedSeverities, showAcknowledged, selectedTimeRange, searchQuery]);

  return (
    <div className="space-y-3">
      {/* Search + Filter Row */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Search */}
        {onSearchChange && (
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search alerts…"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-9 h-9 text-sm"
              aria-label="Search alerts"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                aria-label="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}

        {/* Severity Filter */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="gap-1.5 h-9 text-sm">
              <Filter className="w-3.5 h-3.5" />
              Severity
              {selectedSeverities.length < ALL_SEVERITIES.length && (
                <Badge variant="secondary" className="ml-1 px-1.5 py-0 text-[10px]">
                  {selectedSeverities.length}
                </Badge>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-48">
            <DropdownMenuLabel className="text-xs">Severity Levels</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {ALL_SEVERITIES.map((severity) => (
              <DropdownMenuCheckboxItem
                key={severity}
                checked={selectedSeverities.includes(severity)}
                onCheckedChange={() => toggleSeverity(severity)}
                className="text-sm"
              >
                {severity.charAt(0).toUpperCase() + severity.slice(1)}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Status Filter */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="gap-1.5 h-9 text-sm">
              {showAcknowledged ? (
                <CheckCircle className="w-3.5 h-3.5" />
              ) : (
                <XCircle className="w-3.5 h-3.5" />
              )}
              Status
              {!showAcknowledged && (
                <Badge variant="secondary" className="ml-1 px-1.5 py-0 text-[10px]">1</Badge>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-48">
            <DropdownMenuLabel className="text-xs">Alert Status</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuCheckboxItem
              checked={showAcknowledged}
              onCheckedChange={onShowAcknowledgedChange}
              className="text-sm"
            >
              Show Acknowledged
            </DropdownMenuCheckboxItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Time Range */}
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
                onCheckedChange={() => setSelectedTimeRange(range.value)}
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
    </div>
  );
};

export default AlertFilters;

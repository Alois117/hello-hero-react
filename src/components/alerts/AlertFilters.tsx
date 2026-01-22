import { useState, useMemo, useCallback } from "react";
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
import { Filter, Calendar as CalendarIcon, X } from "lucide-react";
import { AlertSeverity } from "./SeverityBadge";
import { format } from "date-fns";

interface AlertFiltersProps {
  selectedSeverities: AlertSeverity[];
  onSeverityChange: (severities: AlertSeverity[]) => void;
  showAcknowledged: boolean;
  onShowAcknowledgedChange: (show: boolean) => void;
}

const AlertFilters = ({
  selectedSeverities,
  onSeverityChange,
  showAcknowledged,
  onShowAcknowledgedChange,
}: AlertFiltersProps) => {
  const severities: AlertSeverity[] = ["critical", "high", "warning", "info"];
  const hosts = ["api-gateway-01", "prod-web-01", "db-master-01", "cache-redis-03", "worker-queue-02"];
  const tags = ["network", "compute", "backup", "security", "database", "storage"];
  const timeRanges = [
    { label: "Last 1h", value: "1h" },
    { label: "Last 6h", value: "6h" },
    { label: "Last 24h", value: "24h" },
    { label: "Last 7d", value: "7d" },
    { label: "Last 30d", value: "30d" },
  ];

  const [selectedHosts, setSelectedHosts] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedTimeRange, setSelectedTimeRange] = useState<string>("24h");
  const [customDateFrom, setCustomDateFrom] = useState<Date>();
  const [customDateTo, setCustomDateTo] = useState<Date>();

  const toggleSeverity = useCallback((severity: AlertSeverity) => {
    if (selectedSeverities.includes(severity)) {
      onSeverityChange(selectedSeverities.filter((s) => s !== severity));
    } else {
      onSeverityChange([...selectedSeverities, severity]);
    }
  }, [selectedSeverities, onSeverityChange]);

  const toggleHost = useCallback((host: string) => {
    if (selectedHosts.includes(host)) {
      setSelectedHosts(selectedHosts.filter((h) => h !== host));
    } else {
      setSelectedHosts([...selectedHosts, host]);
    }
  }, [selectedHosts]);

  const toggleTag = useCallback((tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  }, [selectedTags]);

  const clearAllFilters = useCallback(() => {
    onSeverityChange(["critical", "high", "warning", "info"]);
    onShowAcknowledgedChange(true);
    setSelectedHosts([]);
    setSelectedTags([]);
    setSelectedTimeRange("24h");
    setCustomDateFrom(undefined);
    setCustomDateTo(undefined);
  }, [onSeverityChange, onShowAcknowledgedChange]);

  const activeFiltersCount = useMemo(() => 
    (selectedSeverities.length < 4 ? 1 : 0) +
    (!showAcknowledged ? 1 : 0) +
    (selectedHosts.length > 0 ? 1 : 0) +
    (selectedTags.length > 0 ? 1 : 0) +
    (selectedTimeRange !== "24h" || customDateFrom || customDateTo ? 1 : 0),
    [selectedSeverities.length, showAcknowledged, selectedHosts.length, selectedTags.length, selectedTimeRange, customDateFrom, customDateTo]
  );

  return (
    <div className="flex flex-wrap gap-2 w-full sm:w-auto">
      {/* Severity Filter */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="outline" 
            className="gap-2 flex-1 sm:flex-none text-sm"
            aria-label="Filter by severity"
          >
            <Filter className="w-4 h-4" />
            Severity
            {selectedSeverities.length < 4 && (
              <Badge variant="secondary" className="ml-1">
                {selectedSeverities.length}
              </Badge>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>Severity Levels</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {severities.map((severity) => (
            <DropdownMenuCheckboxItem
              key={severity}
              checked={selectedSeverities.includes(severity)}
              onCheckedChange={() => toggleSeverity(severity)}
            >
              {severity.toUpperCase()}
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Host Filter */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="outline" 
            className="gap-2 flex-1 sm:flex-none text-sm"
            aria-label="Filter by host"
          >
            Hosts
            {selectedHosts.length > 0 && (
              <Badge variant="secondary" className="ml-1">
                {selectedHosts.length}
              </Badge>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>Select Hosts</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {hosts.map((host) => (
            <DropdownMenuCheckboxItem
              key={host}
              checked={selectedHosts.includes(host)}
              onCheckedChange={() => toggleHost(host)}
            >
              {host}
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Tags Filter */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="outline" 
            className="gap-2 flex-1 sm:flex-none text-sm"
            aria-label="Filter by tags, classes, or scopes"
          >
            Tags
            {selectedTags.length > 0 && (
              <Badge variant="secondary" className="ml-1">
                {selectedTags.length}
              </Badge>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>Tags / Classes / Scopes</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {tags.map((tag) => (
            <DropdownMenuCheckboxItem
              key={tag}
              checked={selectedTags.includes(tag)}
              onCheckedChange={() => toggleTag(tag)}
            >
              {tag}
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Time Range Filter */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="outline" 
            className="gap-2 flex-1 sm:flex-none text-sm"
            aria-label="Filter by time range"
          >
            <CalendarIcon className="w-4 h-4" />
            {timeRanges.find((r) => r.value === selectedTimeRange)?.label || "Time Range"}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>Time Range</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {timeRanges.map((range) => (
            <DropdownMenuCheckboxItem
              key={range.value}
              checked={selectedTimeRange === range.value}
              onCheckedChange={() => setSelectedTimeRange(range.value)}
            >
              {range.label}
            </DropdownMenuCheckboxItem>
          ))}
          <DropdownMenuSeparator />
          <div className="p-2">
            <p className="text-xs text-muted-foreground mb-2">Custom Date Range</p>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="w-full justify-start text-left font-normal">
                  {customDateFrom ? format(customDateFrom, "PP") : "From date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={customDateFrom}
                  onSelect={setCustomDateFrom}
                  initialFocus
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="w-full justify-start text-left font-normal mt-2">
                  {customDateTo ? format(customDateTo, "PP") : "To date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={customDateTo}
                  onSelect={setCustomDateTo}
                  initialFocus
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Status Filter */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="outline" 
            className="flex-1 sm:flex-none text-sm"
            aria-label="Filter by alert status"
          >
            Status
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>Alert Status</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuCheckboxItem
            checked={showAcknowledged}
            onCheckedChange={onShowAcknowledgedChange}
          >
            Show Acknowledged
          </DropdownMenuCheckboxItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Clear All Filters */}
      {activeFiltersCount > 0 && (
        <Button 
          variant="ghost" 
          onClick={clearAllFilters} 
          className="gap-2 w-full sm:w-auto text-sm"
          aria-label={`Clear all ${activeFiltersCount} active filters`}
        >
          <X className="w-4 h-4" />
          <span className="hidden sm:inline">Clear All ({activeFiltersCount})</span>
          <span className="sm:hidden">Clear ({activeFiltersCount})</span>
        </Button>
      )}

      {/* Active Filter Tags */}
      {selectedHosts.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {selectedHosts.map((host) => (
            <Badge key={host} variant="secondary" className="gap-1">
              {host}
              <X
                className="w-3 h-3 cursor-pointer"
                onClick={() => toggleHost(host)}
              />
            </Badge>
          ))}
        </div>
      )}
      {selectedTags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {selectedTags.map((tag) => (
            <Badge key={tag} variant="outline" className="gap-1">
              {tag}
              <X
                className="w-3 h-3 cursor-pointer"
                onClick={() => toggleTag(tag)}
              />
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
};

export default AlertFilters;

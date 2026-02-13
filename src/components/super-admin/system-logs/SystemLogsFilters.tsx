import { useCallback, useEffect, useRef, useState } from "react";
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Search, Filter, Calendar as CalendarIcon, X } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import type { SystemLogsFilters as FiltersType } from "@/hooks/super-admin/system-logs/types";

interface Props {
  filters: FiltersType;
  onFiltersChange: (f: Partial<FiltersType>) => void;
  onClear: () => void;
}

const timeRanges = [
  { label: "Last 1 hour", value: "1h" },
  { label: "Last 24 hours", value: "24h" },
  { label: "Last 7 days", value: "7d" },
  { label: "Last 30 days", value: "30d" },
];

const SystemLogsFilters = ({ filters, onFiltersChange, onClear }: Props) => {
  const [localSearch, setLocalSearch] = useState(filters.search);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  // Debounced search
  useEffect(() => {
    debounceRef.current = setTimeout(() => {
      if (localSearch !== filters.search) {
        onFiltersChange({ search: localSearch });
      }
    }, 300);
    return () => clearTimeout(debounceRef.current);
  }, [localSearch]);

  // Sync external search changes
  useEffect(() => {
    setLocalSearch(filters.search);
  }, [filters.search]);

  const hasActiveFilters =
    filters.search !== '' ||
    filters.severity !== '' ||
    filters.source !== '' ||
    filters.timeRange !== '' ||
    filters.dateFrom !== undefined ||
    filters.dateTo !== undefined;

  const handleClear = useCallback(() => {
    setLocalSearch('');
    onClear();
  }, [onClear]);

  return (
    <div className="flex flex-col sm:flex-row gap-3">
      {/* Search */}
      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search events, users, IPs..."
          value={localSearch}
          onChange={(e) => setLocalSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Severity */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="gap-2 text-sm">
            <Filter className="w-4 h-4" />
            Severity
            {filters.severity && (
              <Badge variant="secondary" className="ml-1 text-xs">{filters.severity}</Badge>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-44">
          <DropdownMenuLabel>Severity</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {(['high', 'medium', 'low'] as const).map((s) => (
            <DropdownMenuCheckboxItem
              key={s}
              checked={filters.severity === s}
              onCheckedChange={(checked) =>
                onFiltersChange({ severity: checked ? s : '' })
              }
            >
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Source */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="gap-2 text-sm">
            Source
            {filters.source && (
              <Badge variant="secondary" className="ml-1 text-xs">
                {filters.source === 'USER_EVENT' ? 'User' : 'Admin'}
              </Badge>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-44">
          <DropdownMenuLabel>Event Source</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {([
            { label: 'User Events', value: 'USER_EVENT' as const },
            { label: 'Admin Events', value: 'ADMIN_EVENT' as const },
          ]).map((s) => (
            <DropdownMenuCheckboxItem
              key={s.value}
              checked={filters.source === s.value}
              onCheckedChange={(checked) =>
                onFiltersChange({ source: checked ? s.value : '' })
              }
            >
              {s.label}
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Time Range */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="gap-2 text-sm">
            <CalendarIcon className="w-4 h-4" />
            {timeRanges.find(r => r.value === filters.timeRange)?.label || 'Time Range'}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>Presets</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {timeRanges.map((r) => (
            <DropdownMenuCheckboxItem
              key={r.value}
              checked={filters.timeRange === r.value}
              onCheckedChange={(checked) =>
                onFiltersChange({
                  timeRange: checked ? r.value : '',
                  dateFrom: undefined,
                  dateTo: undefined,
                })
              }
            >
              {r.label}
            </DropdownMenuCheckboxItem>
          ))}
          <DropdownMenuSeparator />
          <div className="p-2 space-y-2">
            <p className="text-xs text-muted-foreground">Custom Date Range</p>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="w-full justify-start text-left font-normal">
                  {filters.dateFrom ? format(filters.dateFrom, "PP") : "From date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={filters.dateFrom}
                  onSelect={(d) => onFiltersChange({ dateFrom: d || undefined, timeRange: 'custom' })}
                  initialFocus
                  className={cn("p-3 pointer-events-auto")}
                />
              </PopoverContent>
            </Popover>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="w-full justify-start text-left font-normal">
                  {filters.dateTo ? format(filters.dateTo, "PP") : "To date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={filters.dateTo}
                  onSelect={(d) => onFiltersChange({ dateTo: d || undefined, timeRange: 'custom' })}
                  initialFocus
                  className={cn("p-3 pointer-events-auto")}
                />
              </PopoverContent>
            </Popover>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Clear */}
      {hasActiveFilters && (
        <Button variant="ghost" onClick={handleClear} className="gap-2 text-sm">
          <X className="w-4 h-4" />
          Clear
        </Button>
      )}
    </div>
  );
};

export default SystemLogsFilters;

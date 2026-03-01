import { useEffect, useMemo, useRef, useState } from "react";
import { Search, SlidersHorizontal, X, Calendar as CalendarIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
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
import type {
  GlobalScope,
  GlobalTimeRange,
} from "@/hooks/super-admin/organizations/useGlobalInfrastructureMetrics";
import type { Organization } from "@/hooks/super-admin/organizations";
import { format } from "date-fns";

interface GlobalInfrastructureFilterBarProps {
  organizations: Organization[];
  scope: GlobalScope;
  onScopeChange: (scope: GlobalScope) => void;
  selectedOrgIds: string[];
  onSelectedOrgIdsChange: (orgIds: string[]) => void;
  timeRange: GlobalTimeRange;
  onTimeRangeChange: (timeRange: GlobalTimeRange) => void;
  customDateFrom?: Date;
  onCustomDateFromChange: (date?: Date) => void;
  customDateTo?: Date;
  onCustomDateToChange: (date?: Date) => void;
  searchQuery: string;
  onSearchQueryChange: (query: string) => void;
}

const TIME_RANGE_OPTIONS: Array<{ label: string; value: GlobalTimeRange }> = [
  { label: "All Time",       value: "all"   },
  { label: "Last 24 hours", value: "24h" },
  { label: "Last 7 days", value: "7d" },
  { label: "Last 30 days", value: "30d" },
  { label: "Custom", value: "custom" },
];

const SEARCH_DEBOUNCE_MS = 300;

const GlobalInfrastructureFilterBar = ({
  organizations,
  scope,
  onScopeChange,
  selectedOrgIds,
  onSelectedOrgIdsChange,
  timeRange,
  onTimeRangeChange,
  customDateFrom,
  onCustomDateFromChange,
  customDateTo,
  onCustomDateToChange,
  searchQuery,
  onSearchQueryChange,
}: GlobalInfrastructureFilterBarProps) => {
  const [localSearch, setLocalSearch] = useState(searchQuery);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    setLocalSearch(searchQuery);
  }, [searchQuery]);

  useEffect(() => {
    debounceRef.current = setTimeout(() => {
      if (localSearch !== searchQuery) {
        onSearchQueryChange(localSearch);
      }
    }, SEARCH_DEBOUNCE_MS);

    return () => clearTimeout(debounceRef.current);
  }, [localSearch, searchQuery, onSearchQueryChange]);

  const selectedCount = selectedOrgIds.length;
  const selectedOrgLabel = useMemo(() => {
    if (scope === "specific") {
      const selected = organizations.find((org) => org.id === selectedOrgIds[0]);
      return selected?.name ?? "Select organization";
    }
    if (selectedCount === 0) return "All organizations";
    if (selectedCount === 1) {
      const selected = organizations.find((org) => org.id === selectedOrgIds[0]);
      return selected?.name ?? "1 selected";
    }
    return `${selectedCount} selected`;
  }, [scope, organizations, selectedOrgIds, selectedCount]);

  const hasActiveFilters =
    selectedOrgIds.length > 0 ||
    timeRange !== "all" ||
    Boolean(customDateFrom) ||
    Boolean(customDateTo) ||
    localSearch.length > 0;

  const clearFilters = () => {
    onSelectedOrgIdsChange([]);
    onTimeRangeChange("all");
    onCustomDateFromChange(undefined);
    onCustomDateToChange(undefined);
    setLocalSearch("");
    onSearchQueryChange("");
  };

  return (
    <div className="sticky top-[72px] z-20 rounded-xl border border-border/60 bg-card/90 backdrop-blur-lg p-4">
      <div className="flex flex-col lg:flex-row gap-3 lg:items-center">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
          <Input
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            placeholder="Search organizations..."
            className="pl-9 bg-background/60"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Select value={scope} onValueChange={(value) => onScopeChange(value as GlobalScope)}>
            <SelectTrigger className="w-[210px] bg-background/60">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Organizations</SelectItem>
              <SelectItem value="specific">Specific Organization</SelectItem>
            </SelectContent>
          </Select>

          {scope === "specific" ? (
            <Select
              value={selectedOrgIds[0] ?? ""}
              onValueChange={(value) => onSelectedOrgIdsChange(value ? [value] : [])}
            >
              <SelectTrigger className="w-[240px] bg-background/60">
                <SelectValue placeholder="Select organization" />
              </SelectTrigger>
              <SelectContent>
                {organizations.map((org) => (
                  <SelectItem key={org.id} value={org.id}>
                    {org.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2 bg-background/60 min-w-[240px] justify-between">
                  <span className="truncate">{selectedOrgLabel}</span>
                  <SlidersHorizontal className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-[280px]" align="start">
                <DropdownMenuLabel>Organizations</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {organizations.map((org) => {
                  const checked = selectedOrgIds.includes(org.id);
                  return (
                    <DropdownMenuCheckboxItem
                      key={org.id}
                      checked={checked}
                      onCheckedChange={(nextChecked) => {
                        if (nextChecked) {
                          onSelectedOrgIdsChange(Array.from(new Set([...selectedOrgIds, org.id])));
                        } else {
                          onSelectedOrgIdsChange(selectedOrgIds.filter((id) => id !== org.id));
                        }
                      }}
                    >
                      {org.name}
                    </DropdownMenuCheckboxItem>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          <Select
            value={timeRange}
            onValueChange={(value) => {
              const next = value as GlobalTimeRange;
              onTimeRangeChange(next);
              if (next !== "custom") {
                onCustomDateFromChange(undefined);
                onCustomDateToChange(undefined);
              }
            }}
          >
            <SelectTrigger className="w-[170px] bg-background/60">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TIME_RANGE_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {hasActiveFilters && (
            <Button variant="ghost" className="gap-2" onClick={clearFilters}>
              <X className="w-4 h-4" />
              Clear
            </Button>
          )}
        </div>
      </div>

      {timeRange === "custom" && (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="bg-background/60 justify-start min-w-[180px]">
                <CalendarIcon className="w-4 h-4 mr-2" />
                {customDateFrom ? format(customDateFrom, "PPP") : "From date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
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
              <Button variant="outline" className="bg-background/60 justify-start min-w-[180px]">
                <CalendarIcon className="w-4 h-4 mr-2" />
                {customDateTo ? format(customDateTo, "PPP") : "To date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
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

          <Badge variant="outline" className="ml-1">
            Custom Range
          </Badge>
        </div>
      )}
    </div>
  );
};

export default GlobalInfrastructureFilterBar;

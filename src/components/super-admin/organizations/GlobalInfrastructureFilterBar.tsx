import { useEffect, useMemo, useRef, useState } from "react";
import { Search, X, Calendar as CalendarIcon, Building2 } from "lucide-react";
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import type {
  GlobalTimeRange,
} from "@/hooks/super-admin/organizations/useGlobalInfrastructureMetrics";
import type { Organization } from "@/hooks/super-admin/organizations";
import { format } from "date-fns";

interface GlobalInfrastructureFilterBarProps {
  organizations: Organization[];
  selectedOrgId: string | null;
  onSelectedOrgIdChange: (orgId: string | null) => void;
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
const DEFAULT_VISIBLE_ORGS = 20;

const GlobalInfrastructureFilterBar = ({
  organizations,
  selectedOrgId,
  onSelectedOrgIdChange,
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
  const [orgFilterSearch, setOrgFilterSearch] = useState("");
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

  // Filter and limit organizations shown in the selector
  const visibleOrgs = useMemo(() => {
    const q = orgFilterSearch.trim().toLowerCase();
    const filtered = q
      ? organizations.filter((org) => org.name.toLowerCase().includes(q))
      : organizations;
    return filtered.slice(0, DEFAULT_VISIBLE_ORGS);
  }, [organizations, orgFilterSearch]);

  const selectedOrgName = useMemo(() => {
    if (!selectedOrgId) return null;
    return organizations.find((o) => o.id === selectedOrgId)?.name ?? null;
  }, [selectedOrgId, organizations]);

  const hasActiveFilters =
    selectedOrgId !== null ||
    timeRange !== "all" ||
    Boolean(customDateFrom) ||
    Boolean(customDateTo) ||
    localSearch.length > 0;

  const clearFilters = () => {
    onSelectedOrgIdChange(null);
    onTimeRangeChange("all");
    onCustomDateFromChange(undefined);
    onCustomDateToChange(undefined);
    setLocalSearch("");
    onSearchQueryChange("");
    setOrgFilterSearch("");
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
          {/* Single organization selector with typeahead */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="gap-2 bg-background/60 min-w-[240px] justify-between">
                <Building2 className="w-4 h-4 text-muted-foreground" />
                <span className="truncate flex-1 text-left">
                  {selectedOrgName ?? "All Organizations"}
                </span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[300px] p-2" align="start">
              <div className="space-y-2">
                <Input
                  value={orgFilterSearch}
                  onChange={(e) => setOrgFilterSearch(e.target.value)}
                  placeholder="Search organizations..."
                  className="h-8 text-sm"
                  autoFocus
                />
                <div className="max-h-[280px] overflow-y-auto space-y-0.5">
                  <button
                    className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                      !selectedOrgId
                        ? "bg-primary/10 text-primary font-medium"
                        : "hover:bg-muted/60"
                    }`}
                    onClick={() => {
                      onSelectedOrgIdChange(null);
                      setOrgFilterSearch("");
                    }}
                  >
                    All Organizations
                  </button>
                  {visibleOrgs.map((org) => (
                    <button
                      key={org.id}
                      className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                        selectedOrgId === org.id
                          ? "bg-primary/10 text-primary font-medium"
                          : "hover:bg-muted/60"
                      }`}
                      onClick={() => {
                        onSelectedOrgIdChange(org.id);
                        setOrgFilterSearch("");
                      }}
                    >
                      <span className="truncate block">{org.name}</span>
                    </button>
                  ))}
                  {orgFilterSearch && visibleOrgs.length === 0 && (
                    <p className="text-xs text-muted-foreground px-3 py-2">
                      No organizations found
                    </p>
                  )}
                  {!orgFilterSearch && organizations.length > DEFAULT_VISIBLE_ORGS && (
                    <p className="text-xs text-muted-foreground px-3 py-1">
                      Showing {DEFAULT_VISIBLE_ORGS} of {organizations.length} — type to search
                    </p>
                  )}
                </div>
              </div>
            </PopoverContent>
          </Popover>

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

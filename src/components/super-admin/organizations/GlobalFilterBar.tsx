/**
 * Global Infrastructure Filter Bar
 * Sticky filter bar for Global Overview with scope, search, time range, and org selector.
 */
import { useState, useCallback, useEffect, useRef } from "react";
import {
  Search,
  Filter,
  X,
  Globe,
  Building2,
  Clock,
  ChevronDown,
} from "lucide-react";
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
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { Organization } from "@/hooks/super-admin/organizations/types";
import type { TimeRange } from "@/hooks/super-admin/organizations/useGlobalInfrastructureMetrics";

interface GlobalFilterBarProps {
  organizations: Organization[];
  searchQuery: string;
  onSearchChange: (q: string) => void;
  timeRange: TimeRange;
  onTimeRangeChange: (t: TimeRange) => void;
  selectedOrgIds: string[];
  onSelectedOrgIdsChange: (ids: string[]) => void;
  onClearFilters: () => void;
}

const TIME_RANGE_LABELS: Record<TimeRange, string> = {
  "24h": "Last 24 Hours",
  "7d": "Last 7 Days",
  "30d": "Last 30 Days",
  custom: "Custom",
};

const GlobalFilterBar = ({
  organizations,
  searchQuery,
  onSearchChange,
  timeRange,
  onTimeRangeChange,
  selectedOrgIds,
  onSelectedOrgIdsChange,
  onClearFilters,
}: GlobalFilterBarProps) => {
  const [localSearch, setLocalSearch] = useState(searchQuery);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Debounce search
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      onSearchChange(localSearch);
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [localSearch, onSearchChange]);

  // Sync external changes
  useEffect(() => {
    setLocalSearch(searchQuery);
  }, [searchQuery]);

  const handleOrgToggle = useCallback(
    (orgId: string) => {
      if (selectedOrgIds.includes(orgId)) {
        onSelectedOrgIdsChange(selectedOrgIds.filter((id) => id !== orgId));
      } else {
        onSelectedOrgIdsChange([...selectedOrgIds, orgId]);
      }
    },
    [selectedOrgIds, onSelectedOrgIdsChange]
  );

  const hasActiveFilters =
    searchQuery.length > 0 || selectedOrgIds.length > 0 || timeRange !== "7d";

  return (
    <div className="sticky top-16 md:top-[72px] z-30 -mx-4 sm:-mx-6 3xl:-mx-8 4xl:-mx-10 px-4 sm:px-6 3xl:px-8 4xl:px-10 py-3 bg-background/80 backdrop-blur-lg border-b border-border/50">
      <div className="flex flex-wrap items-center gap-3">
        {/* Scope indicator */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/20">
          <Globe className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium text-primary">
            {selectedOrgIds.length > 0
              ? `${selectedOrgIds.length} Org${selectedOrgIds.length > 1 ? "s" : ""}`
              : "All Organizations"}
          </span>
        </div>

        {/* Search */}
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            placeholder="Search organizations…"
            className="pl-9 bg-surface/50 border-border/50 focus:border-primary transition-all h-9"
          />
          {localSearch && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6"
              onClick={() => setLocalSearch("")}
            >
              <X className="w-3 h-3" />
            </Button>
          )}
        </div>

        {/* Time Range */}
        <Select value={timeRange} onValueChange={(v) => onTimeRangeChange(v as TimeRange)}>
          <SelectTrigger className="w-[160px] h-9 bg-surface/50 border-border/50">
            <Clock className="w-3.5 h-3.5 mr-1.5 text-muted-foreground" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {(Object.keys(TIME_RANGE_LABELS) as TimeRange[]).map((key) => (
              <SelectItem key={key} value={key}>
                {TIME_RANGE_LABELS[key]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Organization Multi-Select */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="h-9 gap-2 bg-surface/50 border-border/50"
            >
              <Building2 className="w-3.5 h-3.5" />
              <span className="text-sm">
                {selectedOrgIds.length > 0
                  ? `${selectedOrgIds.length} selected`
                  : "Filter Orgs"}
              </span>
              <ChevronDown className="w-3 h-3 ml-1" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-72 p-0" align="start">
            <div className="p-3 border-b border-border">
              <p className="text-sm font-medium">Select Organizations</p>
              {selectedOrgIds.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-1 h-7 text-xs"
                  onClick={() => onSelectedOrgIdsChange([])}
                >
                  Clear all
                </Button>
              )}
            </div>
            <ScrollArea className="max-h-64">
              <div className="p-2 space-y-1">
                {organizations.map((org) => (
                  <label
                    key={org.id}
                    className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-muted/50 cursor-pointer transition-colors"
                  >
                    <Checkbox
                      checked={selectedOrgIds.includes(org.id)}
                      onCheckedChange={() => handleOrgToggle(org.id)}
                    />
                    <span className="text-sm truncate flex-1">{org.name}</span>
                    <Badge
                      variant="outline"
                      className={`text-[10px] px-1.5 ${
                        org.status === "active"
                          ? "border-success/30 text-success"
                          : "border-muted/30 text-muted-foreground"
                      }`}
                    >
                      {org.status}
                    </Badge>
                  </label>
                ))}
              </div>
            </ScrollArea>
          </PopoverContent>
        </Popover>

        {/* Clear filters */}
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            className="h-9 gap-1.5 text-muted-foreground hover:text-foreground"
            onClick={() => {
              setLocalSearch("");
              onClearFilters();
            }}
          >
            <X className="w-3.5 h-3.5" />
            Clear
          </Button>
        )}
      </div>
    </div>
  );
};

export default GlobalFilterBar;

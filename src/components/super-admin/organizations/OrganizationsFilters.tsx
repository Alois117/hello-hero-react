/**
 * Organizations Filters
 * Search, status filter, and date range with clear functionality
 */
import { Search, X, Filter, Calendar } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { OrganizationFilters } from "@/hooks/super-admin/organizations";

interface OrganizationsFiltersProps {
  filters: OrganizationFilters;
  onSearchChange: (query: string) => void;
  onStatusChange: (status: "all" | "active" | "inactive") => void;
  onHasAlertsChange: (value: boolean | null) => void;
  onClearFilters: () => void;
}

const OrganizationsFiltersComponent = ({
  filters,
  onSearchChange,
  onStatusChange,
  onHasAlertsChange,
  onClearFilters,
}: OrganizationsFiltersProps) => {
  const hasActiveFilters = 
    filters.searchQuery !== "" ||
    filters.statusFilter !== "all" ||
    filters.hasActiveAlerts !== null;

  return (
    <div className="flex flex-col sm:flex-row gap-3">
      {/* Search Input */}
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <Input
          placeholder="Search organizations by name or ID..."
          value={filters.searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
        />
        {filters.searchQuery && (
          <button
            onClick={() => onSearchChange("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Status Filter */}
      <Select
        value={filters.statusFilter}
        onValueChange={(value) => onStatusChange(value as "all" | "active" | "inactive")}
      >
        <SelectTrigger className="w-full sm:w-[160px]">
          <SelectValue placeholder="All Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Status</SelectItem>
          <SelectItem value="active">Active</SelectItem>
          <SelectItem value="inactive">Inactive</SelectItem>
        </SelectContent>
      </Select>

      {/* Has Active Alerts Filter */}
      <Select
        value={filters.hasActiveAlerts === null ? "all" : filters.hasActiveAlerts ? "yes" : "no"}
        onValueChange={(value) => {
          if (value === "all") onHasAlertsChange(null);
          else if (value === "yes") onHasAlertsChange(true);
          else onHasAlertsChange(false);
        }}
      >
        <SelectTrigger className="w-full sm:w-[160px]">
          <SelectValue placeholder="Alerts" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Alerts</SelectItem>
          <SelectItem value="yes">Has Alerts</SelectItem>
          <SelectItem value="no">No Alerts</SelectItem>
        </SelectContent>
      </Select>

      {/* Clear Filters */}
      {hasActiveFilters && (
        <Button
          variant="outline"
          onClick={onClearFilters}
          className="gap-2 shrink-0"
        >
          <Filter className="w-4 h-4" />
          Clear
        </Button>
      )}
    </div>
  );
};

export default OrganizationsFiltersComponent;

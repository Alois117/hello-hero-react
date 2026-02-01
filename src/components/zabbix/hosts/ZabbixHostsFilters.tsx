import { Search, X, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ZabbixHostStatusFilter } from "@/hooks/useZabbixHosts";

interface ZabbixHostsFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedGroup: string | null;
  onGroupChange: (group: string | null) => void;
  statusFilter: ZabbixHostStatusFilter;
  onStatusChange: (status: ZabbixHostStatusFilter) => void;
  uniqueGroups: string[];
  onClearFilters: () => void;
  hasActiveFilters: boolean;
}

/**
 * Filter bar for Zabbix Hosts
 * Search, group filter, status filter, and clear button
 */
const ZabbixHostsFilters = ({
  searchQuery,
  onSearchChange,
  selectedGroup,
  onGroupChange,
  statusFilter,
  onStatusChange,
  uniqueGroups,
  onClearFilters,
  hasActiveFilters,
}: ZabbixHostsFiltersProps) => {
  return (
    <div className="flex flex-col sm:flex-row gap-3">
      {/* Search Input */}
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <Input
          placeholder="Search hosts by name, IP, or group..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
        />
        {searchQuery && (
          <button
            onClick={() => onSearchChange("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Group Filter */}
      <Select
        value={selectedGroup ?? "all"}
        onValueChange={(value) => onGroupChange(value === "all" ? null : value)}
      >
        <SelectTrigger className="w-full sm:w-[180px]">
          <SelectValue placeholder="All Groups" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Groups</SelectItem>
          {uniqueGroups.map((group) => (
            <SelectItem key={group} value={group}>
              {group}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Status Filter */}
      <Select
        value={statusFilter}
        onValueChange={(value) => onStatusChange(value as ZabbixHostStatusFilter)}
      >
        <SelectTrigger className="w-full sm:w-[140px]">
          <SelectValue placeholder="All Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Status</SelectItem>
          <SelectItem value="enabled">Enabled</SelectItem>
          <SelectItem value="disabled">Disabled</SelectItem>
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

export default ZabbixHostsFilters;

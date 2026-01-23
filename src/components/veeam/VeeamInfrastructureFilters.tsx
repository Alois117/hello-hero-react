import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { X } from "lucide-react";
import { PowerState, ProtectionStatus } from "@/hooks/useVeeamInfrastructure";

interface VeeamInfrastructureFiltersProps {
  filterPowerState: PowerState | null;
  onFilterPowerStateChange: (state: PowerState | null) => void;
  filterProtection: ProtectionStatus | null;
  onFilterProtectionChange: (status: ProtectionStatus | null) => void;
  filterCategory: string | null;
  onFilterCategoryChange: (category: string | null) => void;
  categories: string[];
}

const VeeamInfrastructureFilters = ({
  filterPowerState,
  onFilterPowerStateChange,
  filterProtection,
  onFilterProtectionChange,
  filterCategory,
  onFilterCategoryChange,
  categories,
}: VeeamInfrastructureFiltersProps) => {
  const hasActiveFilters =
    filterPowerState !== null ||
    filterProtection !== null ||
    filterCategory !== null;

  const clearFilters = () => {
    onFilterPowerStateChange(null);
    onFilterProtectionChange(null);
    onFilterCategoryChange(null);
  };

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {/* Power State Filter */}
      <Select
        value={filterPowerState || "all"}
        onValueChange={(value) =>
          onFilterPowerStateChange(value === "all" ? null : (value as PowerState))
        }
      >
        <SelectTrigger className="w-[140px]">
          <SelectValue placeholder="Power State" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All States</SelectItem>
          <SelectItem value="PoweredOn">Powered On</SelectItem>
          <SelectItem value="PoweredOff">Powered Off</SelectItem>
        </SelectContent>
      </Select>

      {/* Protection Status Filter */}
      <Select
        value={filterProtection || "all"}
        onValueChange={(value) =>
          onFilterProtectionChange(value === "all" ? null : (value as ProtectionStatus))
        }
      >
        <SelectTrigger className="w-[150px]">
          <SelectValue placeholder="Protection" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Protection</SelectItem>
          <SelectItem value="Protected">Protected</SelectItem>
          <SelectItem value="Not Protected">Not Protected</SelectItem>
        </SelectContent>
      </Select>

      {/* Category Filter */}
      {categories.length > 0 && (
        <Select
          value={filterCategory || "all"}
          onValueChange={(value) =>
            onFilterCategoryChange(value === "all" ? null : value)
          }
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {/* Clear Filters */}
      {hasActiveFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={clearFilters}
          className="gap-1 text-muted-foreground hover:text-foreground"
        >
          <X className="w-4 h-4" />
          Clear
        </Button>
      )}
    </div>
  );
};

export default VeeamInfrastructureFilters;

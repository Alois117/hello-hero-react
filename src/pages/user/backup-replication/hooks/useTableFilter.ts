import { useMemo, useState } from "react";

interface UseTableFilterOptions<T> {
  searchFields: (keyof T | string)[];
}

interface UseTableFilterReturn<T> {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filters: Record<string, string>;
  setFilter: (key: string, value: string) => void;
  clearFilters: () => void;
  filteredData: T[];
}

function getNestedValue(obj: any, path: string): any {
  return path.split(".").reduce((acc, part) => acc?.[part], obj);
}

export function useTableFilter<T>(
  data: T[],
  options: UseTableFilterOptions<T>
): UseTableFilterReturn<T> {
  const { searchFields } = options;

  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<Record<string, string>>({});

  const setFilter = (key: string, value: string) => {
    setFilters((prev) => {
      if (value === "" || value === "all") {
        const { [key]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [key]: value };
    });
  };

  const clearFilters = () => {
    setSearchQuery("");
    setFilters({});
  };

  const filteredData = useMemo(() => {
    let result = [...data];

    // Apply search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter((item) =>
        searchFields.some((field) => {
          const value = getNestedValue(item, field as string);
          if (typeof value === "string") {
            return value.toLowerCase().includes(query);
          }
          if (typeof value === "number") {
            return value.toString().includes(query);
          }
          return false;
        })
      );
    }

    // Apply filters
    for (const [key, value] of Object.entries(filters)) {
      if (value && value !== "all") {
        result = result.filter((item) => {
          const itemValue = getNestedValue(item, key);
          if (typeof itemValue === "string") {
            return itemValue.toLowerCase() === value.toLowerCase();
          }
          if (typeof itemValue === "boolean") {
            return itemValue === (value === "true");
          }
          return itemValue === value;
        });
      }
    }

    return result;
  }, [data, searchQuery, filters, searchFields]);

  return {
    searchQuery,
    setSearchQuery,
    filters,
    setFilter,
    clearFilters,
    filteredData,
  };
}

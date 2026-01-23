import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface TablePaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  startIndex: number;
  endIndex: number;
  itemName?: string;
  onPageChange: (page: number) => void;
}

const TablePagination = ({
  currentPage,
  totalPages,
  totalItems,
  startIndex,
  endIndex,
  itemName = "items",
  onPageChange,
}: TablePaginationProps) => {
  if (totalPages <= 1) return null;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 border-t border-border">
      <p className="text-sm text-muted-foreground">
        Showing {startIndex + 1} to {Math.min(endIndex, totalItems)} of {totalItems} {itemName}
      </p>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          aria-label="Previous page"
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>
        <span className="text-sm" aria-live="polite" aria-atomic="true">
          Page {currentPage} of {totalPages}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          aria-label="Next page"
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

export default TablePagination;

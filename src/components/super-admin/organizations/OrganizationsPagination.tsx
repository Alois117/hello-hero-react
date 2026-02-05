/**
 * Organizations Pagination
 * Reuses the same pagination pattern as other dashboard components
 */
import TablePagination from "@/components/ui/table-pagination";

interface OrganizationsPaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

const OrganizationsPagination = ({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
}: OrganizationsPaginationProps) => {
  const startIndex = (currentPage - 1) * pageSize + 1;
  const endIndex = Math.min(currentPage * pageSize, totalItems);

  if (totalItems === 0) return null;

  return (
    <TablePagination
      currentPage={currentPage}
      totalPages={totalPages}
      totalItems={totalItems}
      startIndex={startIndex}
      endIndex={endIndex}
      itemName="organizations"
      onPageChange={onPageChange}
    />
  );
};

export default OrganizationsPagination;

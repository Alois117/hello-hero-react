import { useMemo, useState } from "react";

interface UsePaginationOptions {
  defaultPageSize?: number;
  defaultPage?: number;
}

interface UsePaginationReturn<T> {
  currentPage: number;
  pageSize: number;
  totalPages: number;
  totalItems: number;
  paginatedData: T[];
  startIndex: number;
  endIndex: number;
  setCurrentPage: (page: number) => void;
  setPageSize: (size: number) => void;
  goToFirstPage: () => void;
  goToLastPage: () => void;
  goToNextPage: () => void;
  goToPreviousPage: () => void;
  canGoNext: boolean;
  canGoPrevious: boolean;
}

export function usePagination<T>(
  data: T[],
  options: UsePaginationOptions = {}
): UsePaginationReturn<T> {
  const { defaultPageSize = 8, defaultPage = 1 } = options;

  const [currentPage, setCurrentPage] = useState(defaultPage);
  const [pageSize, setPageSize] = useState(defaultPageSize);

  const totalItems = data.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  // Ensure current page is within bounds
  const validCurrentPage = Math.min(Math.max(1, currentPage), totalPages);
  if (validCurrentPage !== currentPage) {
    setCurrentPage(validCurrentPage);
  }

  const startIndex = (validCurrentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);

  const paginatedData = useMemo(() => {
    return data.slice(startIndex, endIndex);
  }, [data, startIndex, endIndex]);

  const goToFirstPage = () => setCurrentPage(1);
  const goToLastPage = () => setCurrentPage(totalPages);
  const goToNextPage = () => setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  const goToPreviousPage = () => setCurrentPage((prev) => Math.max(prev - 1, 1));

  const canGoNext = validCurrentPage < totalPages;
  const canGoPrevious = validCurrentPage > 1;

  return {
    currentPage: validCurrentPage,
    pageSize,
    totalPages,
    totalItems,
    paginatedData,
    startIndex: startIndex + 1, // 1-indexed for display
    endIndex,
    setCurrentPage,
    setPageSize: (size: number) => {
      setPageSize(size);
      setCurrentPage(1); // Reset to first page when changing page size
    },
    goToFirstPage,
    goToLastPage,
    goToNextPage,
    goToPreviousPage,
    canGoNext,
    canGoPrevious,
  };
}

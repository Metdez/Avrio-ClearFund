"use client";

import { useState, useMemo } from "react";
import { DEFAULT_PAGE_SIZE } from "@/lib/constants";

interface UsePaginationResult<T> {
  currentPage: number;
  perPage: number;
  totalPages: number;
  totalItems: number;
  paginatedData: T[];
  setPage: (page: number) => void;
  setPerPage: (perPage: number) => void;
  nextPage: () => void;
  prevPage: () => void;
  canNextPage: boolean;
  canPrevPage: boolean;
}

export function usePagination<T>(items: T[], initialPerPage: number = DEFAULT_PAGE_SIZE): UsePaginationResult<T> {
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPageState] = useState(initialPerPage);

  const totalItems = items.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / perPage));

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * perPage;
    return items.slice(start, start + perPage);
  }, [items, currentPage, perPage]);

  const setPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const setPerPage = (newPerPage: number) => {
    setPerPageState(newPerPage);
    setCurrentPage(1);
  };

  const nextPage = () => setPage(currentPage + 1);
  const prevPage = () => setPage(currentPage - 1);

  return {
    currentPage,
    perPage,
    totalPages,
    totalItems,
    paginatedData,
    setPage,
    setPerPage,
    nextPage,
    prevPage,
    canNextPage: currentPage < totalPages,
    canPrevPage: currentPage > 1,
  };
}

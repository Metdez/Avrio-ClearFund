"use client";

import { useState, useMemo, useCallback } from "react";

interface UseSearchResult<T> {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  filteredData: T[];
  clearSearch: () => void;
}

export function useSearch<T extends Record<string, unknown>>(
  items: T[],
  searchFields: (keyof T)[]
): UseSearchResult<T> {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredData = useMemo(() => {
    if (!searchTerm || searchTerm.length < 2) return items;
    const lower = searchTerm.toLowerCase();
    return items.filter((item) =>
      searchFields.some((field) => {
        const val = item[field];
        return typeof val === "string" && val.toLowerCase().includes(lower);
      })
    );
  }, [items, searchTerm, searchFields]);

  const clearSearch = useCallback(() => setSearchTerm(""), []);

  return { searchTerm, setSearchTerm, filteredData, clearSearch };
}

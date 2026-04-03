"use client";

import { useState, useEffect } from "react";

interface UseMockDataResult<T> {
  data: T | null;
  isLoading: boolean;
  error: Error | null;
}

export function useMockData<T>(mockData: T, delay: number = 300): UseMockDataResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    setIsLoading(true);
    setError(null);

    const timer = setTimeout(() => {
      try {
        setData(mockData);
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Failed to load data"));
      } finally {
        setIsLoading(false);
      }
    }, delay);

    return () => clearTimeout(timer);
  }, [mockData, delay]);

  return { data, isLoading, error };
}

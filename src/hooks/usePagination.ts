import { useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';

export interface PaginationState {
  page: number;
  limit: number;
  totalPages: number;
  totalItems: number;
}

export function usePagination(defaultLimit = 20) {
  const [searchParams, setSearchParams] = useSearchParams();

  const page = Number(searchParams.get('page') ?? '1');
  const limit = Number(searchParams.get('limit') ?? String(defaultLimit));

  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const setPage = useCallback(
    (newPage: number) => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        next.set('page', String(newPage));
        return next;
      });
    },
    [setSearchParams],
  );

  const setLimit = useCallback(
    (newLimit: number) => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        next.set('limit', String(newLimit));
        next.set('page', '1');
        return next;
      });
    },
    [setSearchParams],
  );

  const updateFromResponse = useCallback(
    (pagination: { total_pages: number; total_items: number }) => {
      setTotalPages(pagination.total_pages);
      setTotalItems(pagination.total_items);
    },
    [],
  );

  return {
    page,
    limit,
    totalPages,
    totalItems,
    setPage,
    setLimit,
    updateFromResponse,
  };
}

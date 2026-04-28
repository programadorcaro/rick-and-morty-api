'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback } from 'react';

export default function Pagination({ totalPages, currentPage }: { totalPages: number, currentPage: number }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const createPageURL = useCallback(
    (pageNumber: number | string) => {
      const params = new URLSearchParams(searchParams);
      params.set('page', pageNumber.toString());
      return `/?${params.toString()}`;
    },
    [searchParams]
  );

  const handlePageChange = (page: number) => {
    router.push(createPageURL(page));
  };

  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-center gap-2 mt-12 mb-8">
      <button
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage <= 1}
        className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-zinc-800 disabled:opacity-50 hover:bg-gray-200 dark:hover:bg-zinc-700 transition-colors"
      >
        Previous
      </button>
      
      <span className="text-sm font-medium mx-4">
        Page {currentPage} of {totalPages}
      </span>

      <button
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage >= totalPages}
        className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-zinc-800 disabled:opacity-50 hover:bg-gray-200 dark:hover:bg-zinc-700 transition-colors"
      >
        Next
      </button>
    </div>
  );
}

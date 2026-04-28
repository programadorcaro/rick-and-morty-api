'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

export default function Filters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [name, setName] = useState(searchParams.get('name') || '');
  const [status, setStatus] = useState(searchParams.get('status') || '');
  const [species, setSpecies] = useState(searchParams.get('species') || '');

  const createQueryString = useCallback(
    (params: Record<string, string | null>) => {
      const newSearchParams = new URLSearchParams(searchParams.toString());
      
      Object.entries(params).forEach(([key, value]) => {
        if (value === null || value === '') {
          newSearchParams.delete(key);
        } else {
          newSearchParams.set(key, value);
        }
      });
      
      // Reset page when filters change
      newSearchParams.delete('page');
      
      return newSearchParams.toString();
    },
    [searchParams]
  );

  useEffect(() => {
    const timeout = setTimeout(() => {
      const query = createQueryString({ name, status, species });
      router.push(`/?${query}`);
    }, 500);

    return () => clearTimeout(timeout);
  }, [name, status, species, router, createQueryString]);

  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-end mb-8">
      <div className="flex-1">
        <label htmlFor="name" className="block text-sm font-medium mb-1">Search by name</label>
        <input
          type="text"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Rick Sanchez"
          className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 focus:ring-2 focus:ring-rm-green outline-none"
        />
      </div>
      
      <div className="w-full md:w-48">
        <label htmlFor="status" className="block text-sm font-medium mb-1">Status</label>
        <select
          id="status"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 focus:ring-2 focus:ring-rm-green outline-none"
        >
          <option value="">All Statuses</option>
          <option value="alive">Alive</option>
          <option value="dead">Dead</option>
          <option value="unknown">Unknown</option>
        </select>
      </div>

      <div className="w-full md:w-48">
        <label htmlFor="species" className="block text-sm font-medium mb-1">Species</label>
        <input
          type="text"
          id="species"
          value={species}
          onChange={(e) => setSpecies(e.target.value)}
          placeholder="e.g. Alien"
          className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 focus:ring-2 focus:ring-rm-green outline-none"
        />
      </div>
    </div>
  );
}

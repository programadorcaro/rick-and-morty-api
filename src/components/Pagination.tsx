import Link from 'next/link';

function buildListUrl(
  pageNumber: number,
  name?: string,
  status?: string,
  species?: string
) {
  const params = new URLSearchParams();
  if (name) params.set('name', name);
  if (status) params.set('status', status);
  if (species) params.set('species', species);
  if (pageNumber > 1) params.set('page', String(pageNumber));
  const qs = params.toString();
  return qs ? `/?${qs}` : '/';
}

export default function Pagination({
  totalPages,
  currentPage,
  name,
  status,
  species,
}: {
  totalPages: number;
  currentPage: number;
  name?: string;
  status?: string;
  species?: string;
}) {
  if (totalPages <= 1) return null;

  const prevHref = buildListUrl(currentPage - 1, name, status, species);
  const nextHref = buildListUrl(currentPage + 1, name, status, species);

  return (
    <div className="mb-8 mt-12 flex items-center justify-center gap-2">
      <Link
        href={prevHref}
        aria-disabled={currentPage <= 1}
        className={
          currentPage <= 1
            ? 'pointer-events-none rounded-lg bg-gray-100 px-4 py-2 opacity-50 dark:bg-zinc-800'
            : 'rounded-lg bg-gray-100 px-4 py-2 transition-colors hover:bg-gray-200 dark:bg-zinc-800 dark:hover:bg-zinc-700'
        }
      >
        Previous
      </Link>

      <span className="mx-4 text-sm font-medium">
        Page {currentPage} of {totalPages}
      </span>

      <Link
        href={nextHref}
        aria-disabled={currentPage >= totalPages}
        className={
          currentPage >= totalPages
            ? 'pointer-events-none rounded-lg bg-gray-100 px-4 py-2 opacity-50 dark:bg-zinc-800'
            : 'rounded-lg bg-gray-100 px-4 py-2 transition-colors hover:bg-gray-200 dark:bg-zinc-800 dark:hover:bg-zinc-700'
        }
      >
        Next
      </Link>
    </div>
  );
}

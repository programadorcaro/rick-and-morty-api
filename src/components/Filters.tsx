import { applyFilters } from '@/app/actions';

export default function Filters({
  name = '',
  status = '',
  species = '',
}: {
  name?: string;
  status?: string;
  species?: string;
}) {
  return (
    <form action={applyFilters} className="mb-8 flex flex-col gap-4 md:flex-row md:items-end">
      <div className="flex-1">
        <label htmlFor="name" className="mb-1 block text-sm font-medium">
          Search by name
        </label>
        <input
          type="text"
          id="name"
          name="name"
          defaultValue={name}
          placeholder="e.g. Rick Sanchez"
          className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 outline-none focus:ring-2 focus:ring-rm-green dark:border-zinc-700 dark:bg-zinc-800"
        />
      </div>

      <div className="w-full md:w-48">
        <label htmlFor="status" className="mb-1 block text-sm font-medium">
          Status
        </label>
        <select
          id="status"
          name="status"
          defaultValue={status}
          className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 outline-none focus:ring-2 focus:ring-rm-green dark:border-zinc-700 dark:bg-zinc-800"
        >
          <option value="">All Statuses</option>
          <option value="alive">Alive</option>
          <option value="dead">Dead</option>
          <option value="unknown">Unknown</option>
        </select>
      </div>

      <div className="w-full md:w-48">
        <label htmlFor="species" className="mb-1 block text-sm font-medium">
          Species
        </label>
        <input
          type="text"
          id="species"
          name="species"
          defaultValue={species}
          placeholder="e.g. Alien"
          className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 outline-none focus:ring-2 focus:ring-rm-green dark:border-zinc-700 dark:bg-zinc-800"
        />
      </div>

      <button
        type="submit"
        className="rounded-lg bg-rm-green px-6 py-2.5 font-semibold text-white transition-colors hover:opacity-90 md:mb-0"
      >
        Apply
      </button>
    </form>
  );
}

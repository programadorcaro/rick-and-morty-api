export default function CharacterDetailSkeleton() {
  return (
    <div className="max-w-4xl mx-auto animate-pulse">
      <div className="mb-8 h-4 w-40 rounded bg-gray-200 dark:bg-zinc-800" />
      <div className="flex flex-col md:flex-row gap-8 bg-gray-100 dark:bg-zinc-900 rounded-2xl overflow-hidden shadow-xl">
        <div className="w-full md:w-1/2 aspect-square bg-gray-200 dark:bg-zinc-800" />
        <div className="flex-1 space-y-6 p-8">
          <div className="flex items-center gap-3">
            <div className="h-4 w-4 rounded-full bg-gray-200 dark:bg-zinc-800" />
            <div className="h-5 w-24 rounded bg-gray-200 dark:bg-zinc-800" />
          </div>
          <div className="h-10 max-w-md w-[80%] rounded bg-gray-200 dark:bg-zinc-800" />
          <div className="space-y-4">
            <div className="h-4 w-20 rounded bg-gray-200 dark:bg-zinc-800" />
            <div className="h-8 w-48 rounded bg-gray-200 dark:bg-zinc-800" />
            <div className="h-4 w-20 rounded bg-gray-200 dark:bg-zinc-800" />
            <div className="h-8 w-32 rounded bg-gray-200 dark:bg-zinc-800" />
            <div className="h-4 w-40 rounded bg-gray-200 dark:bg-zinc-800" />
            <div className="h-8 w-full rounded bg-gray-200 dark:bg-zinc-800" />
          </div>
        </div>
      </div>
    </div>
  );
}

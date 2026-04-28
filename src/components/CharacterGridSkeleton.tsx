function CardSkeleton() {
  return (
    <div className="flex flex-col overflow-hidden rounded-xl bg-gray-100 dark:bg-zinc-900 shadow-md animate-pulse">
      <div className="aspect-square w-full bg-gray-200 dark:bg-zinc-800" />
      <div className="flex flex-col gap-3 p-4">
        <div className="h-6 w-[75%] rounded bg-gray-200 dark:bg-zinc-800" />
        <div className="h-4 w-[50%] rounded bg-gray-200 dark:bg-zinc-800" />
        <div className="h-3 w-full rounded bg-gray-200 dark:bg-zinc-800" />
        <div className="h-3 w-2/3 rounded bg-gray-200 dark:bg-zinc-800" />
      </div>
    </div>
  );
}

export default function CharacterGridSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: 8 }, (_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}

import { Suspense } from 'react';
import Filters from '@/components/Filters';
import CharacterResults from '@/components/CharacterResults';
import CharacterGridSkeleton from '@/components/CharacterGridSkeleton';
import { Logger } from '@/lib/observability';

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const pageRaw = typeof params.page === 'string' ? parseInt(params.page, 10) : 1;
  const page = Number.isFinite(pageRaw) && pageRaw > 0 ? pageRaw : 1;
  const name = typeof params.name === 'string' ? params.name : undefined;
  const status = typeof params.status === 'string' ? params.status : undefined;
  const species = typeof params.species === 'string' ? params.species : undefined;
  const requestId = `home-${page}-${name ?? ""}-${status ?? ""}-${species ?? ""}`;
  Logger.info("Home page render", {
    context: "page.home",
    operation: "renderHome",
    requestId,
    resourceId: `page-${page}`,
    page,
  });

  const suspenseKey = `${page}-${name ?? ''}-${status ?? ''}-${species ?? ''}`;

  return (
    <div className="flex flex-col">
      <div className="mb-12">
        <h1 className="mb-4 bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-4xl font-black text-transparent md:text-6xl">
          The Rick and Morty Characters
        </h1>
        <p className="max-w-2xl text-lg text-gray-500">
          Browse and search through the vast collection of characters from the multiverse.
        </p>
      </div>

      <Filters name={name} status={status} species={species} />

      <Suspense key={suspenseKey} fallback={<CharacterGridSkeleton />}>
        <CharacterResults page={page} name={name} status={status} species={species} />
      </Suspense>
    </div>
  );
}

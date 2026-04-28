import { getCharacters } from '@/lib/api';
import CharacterList from '@/components/CharacterList';
import Filters from '@/components/Filters';
import Pagination from '@/components/Pagination';

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const page = typeof params.page === 'string' ? parseInt(params.page) : 1;
  const name = typeof params.name === 'string' ? params.name : undefined;
  const status = typeof params.status === 'string' ? params.status : undefined;
  const species = typeof params.species === 'string' ? params.species : undefined;

  const data = await getCharacters({ page, name, status, species });

  return (
    <div className="flex flex-col">
      <div className="mb-12">
        <h1 className="text-4xl md:text-6xl font-black mb-4 bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
          The Rick and Morty Characters
        </h1>
        <p className="text-lg text-gray-500 max-w-2xl">
          Browse and search through the vast collection of characters from the multiverse.
        </p>
      </div>

      <Filters />
      
      <CharacterList characters={data.results} />
      
      <Pagination 
        totalPages={data.info.pages} 
        currentPage={page} 
      />
    </div>
  );
}

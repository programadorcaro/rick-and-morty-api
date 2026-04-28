import { getCharacter } from '@/lib/api';
import Image from 'next/image';
import Link from 'next/link';

export default async function CharacterPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const character = await getCharacter(id);

  const statusColor = 
    character.status === 'Alive' ? 'bg-green-500' :
    character.status === 'Dead' ? 'bg-red-500' : 'bg-gray-500';

  return (
    <div className="max-w-4xl mx-auto">
      <Link 
        href="/" 
        className="inline-flex items-center gap-2 mb-8 text-sm font-medium hover:text-green-500 transition-colors"
      >
        ← Back to all characters
      </Link>

      <div className="flex flex-col md:flex-row gap-8 bg-gray-100 dark:bg-zinc-900 rounded-2xl overflow-hidden shadow-xl">
        <div className="relative w-full md:w-1/2 aspect-square">
          <Image
            src={character.image}
            alt={character.name}
            fill
            className="object-cover"
            priority
          />
        </div>

        <div className="flex-1 p-8">
          <div className="flex items-center gap-3 mb-4">
            <span className={`h-4 w-4 rounded-full ${statusColor}`} />
            <span className="text-lg font-semibold">{character.status}</span>
          </div>

          <h1 className="text-4xl font-black mb-6">{character.name}</h1>

          <div className="space-y-6">
            <div>
              <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Species</h2>
              <p className="text-xl">{character.species}</p>
            </div>

            <div>
              <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Gender</h2>
              <p className="text-xl">{character.gender}</p>
            </div>

            <div>
              <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Last known location:</h2>
              <p className="text-xl">{character.location.name}</p>
            </div>

            <div>
              <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider">First seen in:</h2>
              <p className="text-xl">{character.origin.name}</p>
            </div>

            <div>
              <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Episodes</h2>
              <p className="text-xl">{character.episode.length} episodes</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

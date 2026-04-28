import Link from 'next/link';
import Image from 'next/image';
import { Character } from '@/lib/api';

export default function CharacterCard({ character }: { character: Character }) {
  const statusColor = 
    character.status === 'Alive' ? 'bg-green-500' :
    character.status === 'Dead' ? 'bg-red-500' : 'bg-gray-500';

  return (
    <div className="flex flex-col overflow-hidden rounded-xl bg-gray-100 dark:bg-zinc-900 shadow-md transition-transform hover:scale-[1.02]">
      <div className="relative aspect-square w-full">
        <Image
          src={character.image}
          alt={character.name}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      </div>
      <div className="flex flex-col p-4">
        <Link 
          href={`/character/${character.id}`}
          className="text-xl font-bold hover:text-rm-green transition-colors"
        >
          {character.name}
        </Link>
        <div className="mt-2 flex items-center gap-2">
          <span className={`h-3 w-3 rounded-full ${statusColor}`} />
          <span className="text-sm font-medium">
            {character.status} - {character.species}
          </span>
        </div>
        <div className="mt-4">
          <span className="text-xs text-gray-500 dark:text-gray-400">Last known location:</span>
          <p className="text-sm">{character.location.name}</p>
        </div>
        <div className="mt-2">
          <span className="text-xs text-gray-500 dark:text-gray-400">First seen in:</span>
          <p className="text-sm truncate">{character.origin.name}</p>
        </div>
      </div>
    </div>
  );
}

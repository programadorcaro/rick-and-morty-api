import { Character } from '@/lib/api';
import CharacterCard from './CharacterCard';

export default function CharacterList({ characters }: { characters: Character[] }) {
  if (characters.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-2xl font-bold text-gray-500">No characters found.</p>
        <p className="text-gray-400">Try adjusting your filters.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {characters.map((character) => (
        <CharacterCard key={character.id} character={character} />
      ))}
    </div>
  );
}

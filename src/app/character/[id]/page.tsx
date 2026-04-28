import { Suspense } from 'react';
import CharacterDetailContent from '@/components/CharacterDetailContent';
import CharacterDetailSkeleton from '@/components/CharacterDetailSkeleton';
import { Logger } from '@/lib/observability';

export default async function CharacterPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const requestId = `character-page-${id}`;
  Logger.info("Character page render", {
    context: "page.character",
    operation: "renderCharacterPage",
    requestId,
    resourceId: id,
  });

  return (
    <Suspense fallback={<CharacterDetailSkeleton />}>
      <CharacterDetailContent id={id} />
    </Suspense>
  );
}

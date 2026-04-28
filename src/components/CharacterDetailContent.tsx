import { getCharacter } from '@/lib/api';
import Image from 'next/image';
import Link from 'next/link';
import { SpanStatusCode } from "@opentelemetry/api";
import { Logger, tracer } from "@/lib/observability";

export default async function CharacterDetailContent({ id }: { id: string }) {
  const character = await tracer.startActiveSpan("page.character-detail", async (span) => {
    const requestId = `character-detail-${id}`;
    span.setAttribute("app.character.id", id);
    span.setAttribute("app.request.id", requestId);
    Logger.info("Character detail render started", {
      context: "page.character-detail",
      operation: "renderCharacterDetail",
      requestId,
      resourceId: id,
    });
    try {
      const response = await getCharacter(id, { requestId });
      Logger.info("Character detail render completed", {
        context: "page.character-detail",
        operation: "renderCharacterDetail",
        requestId,
        resourceId: id,
      });
      return response;
    } catch (error) {
      const normalized = error instanceof Error ? error : new Error("Unknown error");
      span.recordException(normalized);
      span.setStatus({ code: SpanStatusCode.ERROR, message: "CharacterDetail failed" });
      Logger.error("Character detail render failed", {
        context: "page.character-detail",
        operation: "renderCharacterDetail",
        requestId,
        resourceId: id,
      }, normalized);
      throw normalized;
    } finally {
      span.end();
    }
  });

  const statusColor =
    character.status === 'Alive'
      ? 'bg-green-500'
      : character.status === 'Dead'
        ? 'bg-red-500'
        : 'bg-gray-500';

  return (
    <div className="max-w-4xl mx-auto">
      <Link
        href="/"
        className="mb-8 inline-flex items-center gap-2 text-sm font-medium transition-colors hover:text-green-500"
      >
        ← Back to all characters
      </Link>

      <div className="flex flex-col gap-8 overflow-hidden rounded-2xl bg-gray-100 shadow-xl dark:bg-zinc-900 md:flex-row">
        <div className="relative aspect-square w-full md:w-1/2">
          <Image
            src={character.image}
            alt={character.name}
            fill
            className="object-cover"
            priority
          />
        </div>

        <div className="flex-1 p-8">
          <div className="mb-4 flex items-center gap-3">
            <span className={`h-4 w-4 rounded-full ${statusColor}`} />
            <span className="text-lg font-semibold">{character.status}</span>
          </div>

          <h1 className="mb-6 text-4xl font-black">{character.name}</h1>

          <div className="space-y-6">
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-gray-500">Species</h2>
              <p className="text-xl">{character.species}</p>
            </div>

            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-gray-500">Gender</h2>
              <p className="text-xl">{character.gender}</p>
            </div>

            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-gray-500">
                Last known location:
              </h2>
              <p className="text-xl">{character.location.name}</p>
            </div>

            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-gray-500">First seen in:</h2>
              <p className="text-xl">{character.origin.name}</p>
            </div>

            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-gray-500">Episodes</h2>
              <p className="text-xl">{character.episode.length} episodes</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

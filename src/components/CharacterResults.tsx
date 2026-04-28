import { getCharacters } from '@/lib/api';
import CharacterList from '@/components/CharacterList';
import Pagination from '@/components/Pagination';
import { SpanStatusCode } from "@opentelemetry/api";
import { Logger, tracer } from "@/lib/observability";

export default async function CharacterResults({
  page,
  name,
  status,
  species,
}: {
  page: number;
  name?: string;
  status?: string;
  species?: string;
}) {
  const data = await tracer.startActiveSpan("page.character-results", async (span) => {
    const requestId = `character-results-${page}-${name ?? ""}-${status ?? ""}-${species ?? ""}`;
    span.setAttributes({
      "app.page": page,
      "app.filter.name": name ?? "",
      "app.filter.status": status ?? "",
      "app.filter.species": species ?? "",
      "app.request.id": requestId,
    });
    Logger.info("Character results render started", {
      context: "page.character-results",
      operation: "renderCharacterResults",
      requestId,
      resourceId: `page-${page}`,
    });
    try {
      const response = await getCharacters({ page, name, status, species, requestId });
      Logger.info("Character results render completed", {
        context: "page.character-results",
        operation: "renderCharacterResults",
        requestId,
        resourceId: `page-${page}`,
        page,
        resultCount: response.results.length,
      });
      return response;
    } catch (error) {
      const normalized = error instanceof Error ? error : new Error("Unknown error");
      span.recordException(normalized);
      span.setStatus({ code: SpanStatusCode.ERROR, message: "CharacterResults failed" });
      Logger.error("Character results render failed", {
        context: "page.character-results",
        operation: "renderCharacterResults",
        requestId,
        resourceId: `page-${page}`,
        page,
      }, normalized);
      throw normalized;
    } finally {
      span.end();
    }
  });

  return (
    <>
      <CharacterList characters={data.results} />
      <Pagination
        totalPages={data.info.pages}
        currentPage={page}
        name={name}
        status={status}
        species={species}
      />
    </>
  );
}

import { SpanStatusCode } from "@opentelemetry/api";
import {
  Logger,
  apiDurationHistogram,
  apiErrorCounter,
  apiRequestCounter,
  getRequestId,
  tracer,
} from "@/lib/observability";

export interface Character {
  id: number;
  name: string;
  status: 'Alive' | 'Dead' | 'unknown';
  species: string;
  type: string;
  gender: 'Female' | 'Male' | 'Genderless' | 'unknown';
  origin: {
    name: string;
    url: string;
  };
  location: {
    name: string;
    url: string;
  };
  image: string;
  episode: string[];
  url: string;
  created: string;
}

export interface ApiResponse<T> {
  info: {
    count: number;
    pages: number;
    next: string | null;
    prev: string | null;
  };
  results: T[];
}

const BASE_URL = "https://rickandmortyapi.com/api";
const SLOW_REQUEST_THRESHOLD_MS = 800;
type LoggedError = Error & { logged?: boolean; kind?: string };

function buildError(message: string, kind: string, cause?: unknown): LoggedError {
  const error = new Error(message, { cause }) as LoggedError;
  error.name = kind;
  error.kind = kind;
  return error;
}

function markLogged(error: unknown): LoggedError {
  const normalized = error instanceof Error ? (error as LoggedError) : buildError("Unknown error", "UnknownError", error);
  normalized.logged = true;
  return normalized;
}

export async function getCharacters(params: {
  page?: number;
  name?: string;
  status?: string;
  species?: string;
  requestId?: string;
  userId?: string;
} = {}): Promise<ApiResponse<Character>> {
  return tracer.startActiveSpan("api.getCharacters", async (span) => {
    const startedAt = Date.now();
    const requestId = params.requestId ?? getRequestId();
    span.setAttributes({
      "app.page": params.page ?? 1,
      "app.filter.name": params.name ?? "",
      "app.filter.status": params.status ?? "",
      "app.filter.species": params.species ?? "",
      "app.request.id": requestId,
    });

    const searchParams = new URLSearchParams();
    if (params.page) searchParams.append("page", params.page.toString());
    if (params.name) searchParams.append("name", params.name);
    if (params.status) searchParams.append("status", params.status);
    if (params.species) searchParams.append("species", params.species);

    const url = `${BASE_URL}/character?${searchParams.toString()}`;
    apiRequestCounter.add(1, { endpoint: "character-list" });
    Logger.info("Upstream request started", {
      context: "api.getCharacters",
      operation: "getCharacters",
      requestId,
      userId: params.userId,
      resourceId: "character-list",
      endpoint: url,
    });
    try {
      const res = await fetch(url);
      const durationMs = Date.now() - startedAt;
      span.setAttributes({
        "http.url": url,
        "http.status_code": res.status,
      });

      if (!res.ok) {
        if (res.status === 404) {
          Logger.warning("Upstream request returned no results", {
            context: "api.getCharacters",
            operation: "getCharacters",
            requestId,
            userId: params.userId,
            resourceId: "character-list",
            statusCode: 404,
            durationMs,
          });
          return { info: { count: 0, pages: 0, next: null, prev: null }, results: [] };
        }

        apiErrorCounter.add(1, { endpoint: "character-list" });
        span.setStatus({ code: SpanStatusCode.ERROR, message: "Failed to fetch characters" });
        if (res.status >= 400 && res.status < 500) {
          const upstreamError = markLogged(buildError("Upstream returned client error", "UpstreamClientError", {
            statusCode: res.status,
            endpoint: url,
          }));
          Logger.warning("Upstream request failed with expected status", {
            context: "api.getCharacters",
            operation: "getCharacters",
            requestId,
            userId: params.userId,
            resourceId: "character-list",
            statusCode: res.status,
            durationMs,
          }, upstreamError);
          throw upstreamError;
        }
        const upstreamError = markLogged(buildError("Upstream returned server error", "UpstreamServerError", {
          statusCode: res.status,
          endpoint: url,
        }));
        Logger.error("Upstream request failed with unexpected status", {
          context: "api.getCharacters",
          operation: "getCharacters",
          requestId,
          userId: params.userId,
          resourceId: "character-list",
          statusCode: res.status,
          durationMs,
        }, upstreamError);
        throw upstreamError;
      }

      if (durationMs >= SLOW_REQUEST_THRESHOLD_MS) {
        Logger.warning("Upstream request slow", {
          context: "api.getCharacters",
          operation: "getCharacters",
          requestId,
          userId: params.userId,
          resourceId: "character-list",
          statusCode: res.status,
          durationMs,
        });
      }

      Logger.info("Upstream request completed", {
        context: "api.getCharacters",
        operation: "getCharacters",
        requestId,
        userId: params.userId,
        resourceId: "character-list",
        statusCode: res.status,
        durationMs,
      });

      return res.json();
    } catch (error) {
      apiErrorCounter.add(1, { endpoint: "character-list" });
      const normalized = error instanceof Error ? error : buildError("Unknown error", "UnknownError", error);
      span.recordException(normalized);
      span.setStatus({ code: SpanStatusCode.ERROR, message: "Exception in getCharacters" });
      if (!(normalized as LoggedError).logged) {
        Logger.error("Upstream request raised exception", {
          context: "api.getCharacters",
          operation: "getCharacters",
          requestId,
          userId: params.userId,
          resourceId: "character-list",
          durationMs: Date.now() - startedAt,
        }, normalized);
      }
      throw normalized;
    } finally {
      apiDurationHistogram.record(Date.now() - startedAt, { endpoint: "character-list" });
      span.end();
    }
  });
}

export async function getCharacter(
  id: string | number,
  options: { requestId?: string; userId?: string } = {},
): Promise<Character> {
  return tracer.startActiveSpan("api.getCharacter", async (span) => {
    const startedAt = Date.now();
    const requestId = options.requestId ?? getRequestId();
    const url = `${BASE_URL}/character/${id}`;
    span.setAttributes({
      "app.character.id": String(id),
      "http.url": url,
      "app.request.id": requestId,
    });
    apiRequestCounter.add(1, { endpoint: "character-detail" });
    Logger.info("Upstream request started", {
      context: "api.getCharacter",
      operation: "getCharacter",
      requestId,
      userId: options.userId,
      resourceId: String(id),
      endpoint: url,
    });

    try {
      const res = await fetch(url);
      const durationMs = Date.now() - startedAt;
      span.setAttribute("http.status_code", res.status);
      if (!res.ok) {
        apiErrorCounter.add(1, { endpoint: "character-detail" });
        span.setStatus({ code: SpanStatusCode.ERROR, message: "Failed to fetch character" });
        if (res.status === 404) {
          const notFoundError = markLogged(buildError("Character not found", "CharacterNotFoundError", {
            statusCode: 404,
            characterId: String(id),
          }));
          Logger.warning("Character not found", {
            context: "api.getCharacter",
            operation: "getCharacter",
            requestId,
            userId: options.userId,
            resourceId: String(id),
            statusCode: 404,
            durationMs,
          }, notFoundError);
          throw notFoundError;
        }
        const upstreamError =
          res.status >= 400 && res.status < 500
            ? markLogged(buildError("Upstream returned client error", "UpstreamClientError", res.status))
            : markLogged(buildError("Upstream returned server error", "UpstreamServerError", res.status));
        if (res.status >= 400 && res.status < 500) {
          Logger.warning("Character detail request failed with expected status", {
            context: "api.getCharacter",
            operation: "getCharacter",
            requestId,
            userId: options.userId,
            resourceId: String(id),
            statusCode: res.status,
            durationMs,
          }, upstreamError);
        } else {
          Logger.error("Character detail request failed with unexpected status", {
            context: "api.getCharacter",
            operation: "getCharacter",
            requestId,
            userId: options.userId,
            resourceId: String(id),
            statusCode: res.status,
            durationMs,
          }, upstreamError);
        }
        throw upstreamError;
      }

      if (durationMs >= SLOW_REQUEST_THRESHOLD_MS) {
        Logger.warning("Character detail request slow", {
          context: "api.getCharacter",
          operation: "getCharacter",
          requestId,
          userId: options.userId,
          resourceId: String(id),
          statusCode: res.status,
          durationMs,
        });
      }

      Logger.info("Upstream request completed", {
        context: "api.getCharacter",
        operation: "getCharacter",
        requestId,
        userId: options.userId,
        resourceId: String(id),
        statusCode: res.status,
        durationMs,
      });

      return res.json();
    } catch (error) {
      apiErrorCounter.add(1, { endpoint: "character-detail" });
      const normalized = error instanceof Error ? error : buildError("Unknown error", "UnknownError", error);
      span.recordException(normalized);
      span.setStatus({ code: SpanStatusCode.ERROR, message: "Exception in getCharacter" });
      if (!(normalized as LoggedError).logged) {
        Logger.error("Character detail request raised exception", {
          context: "api.getCharacter",
          operation: "getCharacter",
          requestId,
          userId: options.userId,
          resourceId: String(id),
          durationMs: Date.now() - startedAt,
        }, normalized);
      }
      throw normalized;
    } finally {
      apiDurationHistogram.record(Date.now() - startedAt, { endpoint: "character-detail" });
      span.end();
    }
  });
}

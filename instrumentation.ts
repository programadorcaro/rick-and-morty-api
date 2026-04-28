import { Logger, getRequestId } from "@/lib/observability";

export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("./instrumentation.node");
  }
}

export function onRequestError(error: unknown, request: { path?: string; method?: string } | undefined) {
  const normalized = error instanceof Error ? error : new Error("Unhandled request error");
  Logger.error("Request failed", {
    context: "next.request",
    operation: "onRequestError",
    requestId: getRequestId(),
    resourceId: request?.path ?? "unknown",
    method: request?.method,
  }, normalized);
}

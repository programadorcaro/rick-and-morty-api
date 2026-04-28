'use server';

import { redirect } from 'next/navigation';
import { SpanStatusCode } from "@opentelemetry/api";
import { Logger, getRequestId, tracer } from "@/lib/observability";

export async function applyFilters(formData: FormData) {
  await tracer.startActiveSpan("action.applyFilters", async (span) => {
    const startedAt = Date.now();
    const requestId = getRequestId();
    try {
      const name = String(formData.get("name") ?? "").trim();
      const status = String(formData.get("status") ?? "").trim();
      const species = String(formData.get("species") ?? "").trim();

      span.setAttributes({
        "app.filter.name": name,
        "app.filter.status": status,
        "app.filter.species": species,
        "app.request.id": requestId,
      });
      Logger.info("Filter action started", {
        context: "action.applyFilters",
        operation: "applyFilters",
        requestId,
      });

      const params = new URLSearchParams();
      if (name) params.set("name", name);
      if (status) params.set("status", status);
      if (species) params.set("species", species);

      const qs = params.toString();
      const destination = qs ? `/?${qs}` : "/";

      Logger.info("Filter action completed", {
        context: "action.applyFilters",
        operation: "applyFilters",
        requestId,
        name,
        status,
        species,
        durationMs: Date.now() - startedAt,
        destination,
      });

      redirect(destination);
    } catch (error) {
      const normalized = error instanceof Error ? error : new Error("Unknown error");
      span.recordException(normalized);
      span.setStatus({ code: SpanStatusCode.ERROR, message: "applyFilters failed" });
      Logger.error("Filter action failed", {
        context: "action.applyFilters",
        operation: "applyFilters",
        requestId,
        durationMs: Date.now() - startedAt,
      }, normalized);
      throw normalized;
    } finally {
      span.end();
    }
  });
}

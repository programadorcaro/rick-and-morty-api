import { Logger, getRequestId } from "@/lib/observability";

const requestId = getRequestId();

window.addEventListener("error", (event) => {
  Logger.error("Unhandled browser error", {
    context: "client.runtime",
    operation: "window.error",
    requestId,
    resourceId: window.location.pathname,
  }, event.error instanceof Error ? event.error : new Error(String(event.message || "Unhandled browser error")));
});

window.addEventListener("unhandledrejection", (event) => {
  const reason = event.reason instanceof Error ? event.reason : new Error(String(event.reason || "Unhandled rejection"));
  Logger.warning("Unhandled browser rejection", {
    context: "client.runtime",
    operation: "window.unhandledrejection",
    requestId,
    resourceId: window.location.pathname,
  }, reason);
});

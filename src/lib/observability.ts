import { context, metrics, trace } from "@opentelemetry/api";
import { logs } from "@opentelemetry/api-logs";

export const tracer = trace.getTracer("rick-and-morty-tracer");
export const logger = logs.getLogger("rick-and-morty-logger");
const meter = metrics.getMeter("rick-and-morty-meter");

export const apiRequestCounter = meter.createCounter("rick_and_morty_api_requests_total", {
  description: "Total API requests to Rick and Morty upstream",
});

export const apiErrorCounter = meter.createCounter("rick_and_morty_api_errors_total", {
  description: "Total API request errors",
});

export const apiDurationHistogram = meter.createHistogram("rick_and_morty_api_request_duration_ms", {
  description: "API request duration in milliseconds",
  unit: "ms",
});

type LogLevel = "info" | "warn" | "error";
type LegacyLogLevel = "INFO" | "ERROR";
type Runtime = "nodejs" | "edge" | "browser";
type LogSeverity = 9 | 13 | 17;
type LogContext = Record<string, unknown>;
type LogError = Error & { cause?: unknown; name: string };

const SENSITIVE_KEYS = new Set([
  "password",
  "passwd",
  "pwd",
  "token",
  "access_token",
  "refresh_token",
  "authorization",
  "cookie",
  "set-cookie",
  "secret",
  "api_key",
  "apikey",
  "x-api-key",
]);

function severityToNumber(level: LogLevel): LogSeverity {
  if (level === "error") return 17;
  if (level === "warn") return 13;
  return 9;
}

function detectRuntime(): Runtime {
  if (typeof window !== "undefined") return "browser";
  if (typeof process !== "undefined" && process.env?.NEXT_RUNTIME === "edge") return "edge";
  return "nodejs";
}

function maskUserId(value: unknown): unknown {
  if (typeof value !== "string") return value;
  if (value.length <= 4) return "****";
  return `${value.slice(0, 2)}***${value.slice(-2)}`;
}

function sanitizeValue(key: string, value: unknown): unknown {
  const lowered = key.toLowerCase();
  if (SENSITIVE_KEYS.has(lowered)) return "[REDACTED]";
  if (lowered === "userid") return maskUserId(value);
  if (Array.isArray(value)) return value.map((item) => sanitizeValue(key, item));
  if (value && typeof value === "object") return sanitizeContext(value as LogContext);
  return value;
}

function sanitizeContext(raw: LogContext): LogContext {
  const sanitized: LogContext = {};
  for (const [key, value] of Object.entries(raw)) {
    sanitized[key] = sanitizeValue(key, value);
  }
  return sanitized;
}

function coerceError(input: unknown): LogError | undefined {
  if (!input) return undefined;
  if (input instanceof Error) return input as LogError;
  if (typeof input === "object" && input !== null) {
    const maybe = input as { message?: unknown; name?: unknown; stack?: unknown; cause?: unknown };
    const error = new Error(typeof maybe.message === "string" ? maybe.message : "Unknown error") as LogError;
    error.name = typeof maybe.name === "string" ? maybe.name : "Error";
    error.stack = typeof maybe.stack === "string" ? maybe.stack : undefined;
    if ("cause" in maybe) error.cause = maybe.cause;
    return error;
  }
  return new Error(String(input)) as LogError;
}

function serializeError(error?: LogError): LogContext | undefined {
  if (!error) return undefined;
  return {
    message: error.message,
    kind: error.name || "Error",
    stack: error.stack,
    cause: typeof error.cause === "string" ? error.cause : error.cause ? JSON.stringify(error.cause) : undefined,
  };
}

function buildMessageAndContext(message: string, messageContext?: LogContext): { message: string; context: LogContext } {
  const contextFromMessage: LogContext = {};
  const parts: string[] = [];

  if (message) parts.push(message);
  if (messageContext) {
    for (const value of Object.values(messageContext)) {
      if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
        parts.push(String(value));
      } else if (value && typeof value === "object" && !(value instanceof Error)) {
        Object.assign(contextFromMessage, value as LogContext);
      }
    }
  }

  return {
    message: parts.join(" ").trim() || message,
    context: messageContext ? { ...messageContext, ...contextFromMessage } : contextFromMessage,
  };
}

function emit(level: LogLevel, message: string, messageContext?: LogContext, error?: Error): void {
  const activeSpan = trace.getSpan(context.active());
  const spanContext = activeSpan?.spanContext();
  const normalized = buildMessageAndContext(message, messageContext);
  const contextError = coerceError(normalized.context.error);
  const finalError = coerceError(error) ?? contextError;
  if ("error" in normalized.context) {
    delete normalized.context.error;
  }
  const serializedError = serializeError(finalError);
  const payload = sanitizeContext({
    status: level,
    date: new Date().toISOString(),
    runtime: detectRuntime(),
    message: normalized.message,
    context: typeof normalized.context.context === "string" ? normalized.context.context : "app",
    requestId: typeof normalized.context.requestId === "string" ? normalized.context.requestId : getRequestId(),
    traceId: spanContext?.traceId ?? (typeof normalized.context.traceId === "string" ? normalized.context.traceId : undefined),
    ...normalized.context,
    ...(serializedError ? { error: serializedError } : {}),
  });

  logger.emit({
    severityText: level.toUpperCase(),
    severityNumber: severityToNumber(level),
    body: normalized.message,
    attributes: payload,
    traceId: spanContext?.traceId,
    spanId: spanContext?.spanId,
  });
}

export function getRequestId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2, 10)}`;
}

export const Logger = {
  info(message: string, messageContext?: LogContext, error?: Error): void {
    emit("info", message, messageContext, error);
  },
  warning(message: string, messageContext?: LogContext, error?: Error): void {
    emit("warn", message, messageContext, error);
  },
  warn(message: string, messageContext?: LogContext, error?: Error): void {
    emit("warn", message, messageContext, error);
  },
  error(message: string, messageContext?: LogContext, error?: Error): void {
    emit("error", message, messageContext, error);
  },
};

export function emitLog(level: LegacyLogLevel, body: string, attributes: Record<string, unknown> = {}) {
  if (level === "ERROR") {
    Logger.error(body, attributes);
    return;
  }
  Logger.info(body, attributes);
}

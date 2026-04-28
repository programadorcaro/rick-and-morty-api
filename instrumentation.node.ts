import { logs } from "@opentelemetry/api-logs";
import { OTLPLogExporter } from "@opentelemetry/exporter-logs-otlp-http";
import { OTLPMetricExporter } from "@opentelemetry/exporter-metrics-otlp-http";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { resourceFromAttributes } from "@opentelemetry/resources";
import { BatchLogRecordProcessor, LoggerProvider } from "@opentelemetry/sdk-logs";
import { PeriodicExportingMetricReader } from "@opentelemetry/sdk-metrics";
import { NodeSDK } from "@opentelemetry/sdk-node";
import { BatchSpanProcessor } from "@opentelemetry/sdk-trace-base";
import { ATTR_SERVICE_NAME, ATTR_SERVICE_VERSION } from "@opentelemetry/semantic-conventions";
import { diag, DiagConsoleLogger, DiagLogLevel } from "@opentelemetry/api";

const baseEndpoint = process.env.OTEL_EXPORTER_OTLP_ENDPOINT ?? "http://localhost:4318";
const serviceName = process.env.OTEL_SERVICE_NAME ?? "rick-and-morty-app";

const resource = resourceFromAttributes({
  [ATTR_SERVICE_NAME]: serviceName,
  [ATTR_SERVICE_VERSION]: "1.0.0",
});

const sdkState = globalThis as typeof globalThis & {
  __otel_node_sdk_started__?: boolean;
  __otel_logger_provider__?: LoggerProvider;
};

if (!sdkState.__otel_node_sdk_started__) {
  diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.INFO);

  const traceExporter = new OTLPTraceExporter({
    url: process.env.OTEL_EXPORTER_OTLP_TRACES_ENDPOINT ?? `${baseEndpoint}/v1/traces`,
  });
  const metricExporter = new OTLPMetricExporter({
    url: process.env.OTEL_EXPORTER_OTLP_METRICS_ENDPOINT ?? `${baseEndpoint}/v1/metrics`,
  });
  const logExporter = new OTLPLogExporter({
    url: process.env.OTEL_EXPORTER_OTLP_LOGS_ENDPOINT ?? `${baseEndpoint}/v1/logs`,
  });

  const sdk = new NodeSDK({
    resource,
    spanProcessors: [new BatchSpanProcessor(traceExporter)],
    metricReaders: [
      new PeriodicExportingMetricReader({
        exporter: metricExporter,
        exportIntervalMillis: 15000,
      }),
    ],
  });

  sdk.start();

  const loggerProvider = new LoggerProvider({
    resource,
    processors: [new BatchLogRecordProcessor(logExporter)],
  });

  logs.setGlobalLoggerProvider(loggerProvider);

  sdkState.__otel_logger_provider__ = loggerProvider;
  sdkState.__otel_node_sdk_started__ = true;

  process.on("SIGTERM", async () => {
    await Promise.allSettled([sdk.shutdown(), loggerProvider.shutdown()]);
  });
}

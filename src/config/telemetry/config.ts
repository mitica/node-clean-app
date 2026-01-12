/**
 * OpenTelemetry Configuration
 *
 * Centralized telemetry configuration for the application.
 * Supports both API and Worker processes with environment-based configuration.
 */

export interface TelemetryConfig {
  /** Enable/disable telemetry (default: true in production) */
  enabled: boolean;
  /** Service name for traces and metrics */
  serviceName: string;
  /** Service version */
  serviceVersion: string;
  /** Deployment environment */
  environment: string;
  /** OTLP endpoint for traces (e.g., http://localhost:4318/v1/traces) */
  otlpEndpoint?: string;
  /** OTLP protocol: 'grpc' | 'http/protobuf' | 'http/json' */
  otlpProtocol: "grpc" | "http/protobuf" | "http/json";
  /** Sample rate for traces (0.0 to 1.0, default: 1.0 in dev, 0.1 in prod) */
  sampleRate: number;
  /** Enable console exporter for debugging */
  consoleExporter: boolean;
  /** Diagnostic log level for OpenTelemetry SDK */
  logLevel: "none" | "error" | "warn" | "info" | "debug" | "verbose" | "all";
  /** Batch span processor configuration */
  batchProcessor: {
    /** Max queue size before dropping spans */
    maxQueueSize: number;
    /** Max batch size for export */
    maxExportBatchSize: number;
    /** Scheduled delay in ms between exports */
    scheduledDelayMs: number;
    /** Export timeout in ms */
    exportTimeoutMs: number;
  };
}

/**
 * Process type identifier used for service naming
 */
export type ProcessType = "api" | "worker";

/**
 * Get telemetry configuration from environment variables
 */
export function getTelemetryConfig(processType: ProcessType): TelemetryConfig {
  const nodeEnv = process.env["NODE_ENV"] || "development";
  const isDevelopment = nodeEnv === "development";
  const isProduction = nodeEnv === "production";

  const baseServiceName =
    process.env["OTEL_SERVICE_NAME"] || "node-clean-app";
  const serviceName = `${baseServiceName}-${processType}`;

  return {
    enabled: process.env["OTEL_ENABLED"] !== "false",
    serviceName,
    serviceVersion: process.env["npm_package_version"] || "0.0.0",
    environment: nodeEnv,
    otlpEndpoint: process.env["OTEL_EXPORTER_OTLP_ENDPOINT"],
    otlpProtocol:
      (process.env["OTEL_EXPORTER_OTLP_PROTOCOL"] as TelemetryConfig["otlpProtocol"]) ||
      "http/protobuf",
    sampleRate: parseFloat(
      process.env["OTEL_TRACES_SAMPLER_ARG"] || (isProduction ? "0.1" : "1.0")
    ),
    consoleExporter:
      process.env["OTEL_CONSOLE_EXPORTER"] === "true" || isDevelopment,
    logLevel:
      (process.env["OTEL_LOG_LEVEL"] as TelemetryConfig["logLevel"]) || "none",
    batchProcessor: {
      maxQueueSize: parseInt(
        process.env["OTEL_BSP_MAX_QUEUE_SIZE"] || "2048",
        10
      ),
      maxExportBatchSize: parseInt(
        process.env["OTEL_BSP_MAX_EXPORT_BATCH_SIZE"] || "512",
        10
      ),
      scheduledDelayMs: parseInt(
        process.env["OTEL_BSP_SCHEDULE_DELAY"] || "5000",
        10
      ),
      exportTimeoutMs: parseInt(
        process.env["OTEL_BSP_EXPORT_TIMEOUT"] || "30000",
        10
      ),
    },
  };
}

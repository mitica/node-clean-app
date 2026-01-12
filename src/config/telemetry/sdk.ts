/**
 * OpenTelemetry SDK Initialization
 *
 * This module initializes the OpenTelemetry SDK with automatic instrumentation
 * for common Node.js libraries (HTTP, PostgreSQL, Redis, etc.).
 *
 * IMPORTANT: This file MUST be imported BEFORE any other imports in the entry point.
 * OpenTelemetry hooks into Node.js modules at require/import time.
 *
 * @example
 * // At the very top of src/index.ts or src/worker/run.ts:
 * import { initTelemetry, shutdownTelemetry } from "./config/telemetry";
 * initTelemetry("api"); // or "worker"
 */

import { NodeSDK, tracing, resources } from "@opentelemetry/sdk-node";
import {
  ATTR_SERVICE_NAME,
  ATTR_SERVICE_VERSION,
} from "@opentelemetry/semantic-conventions";
import { getNodeAutoInstrumentations } from "@opentelemetry/auto-instrumentations-node";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import {
  diag,
  DiagConsoleLogger,
  DiagLogLevel,
  trace,
  context,
  SpanStatusCode,
  Span,
  SpanKind,
} from "@opentelemetry/api";
import type { Attributes } from "@opentelemetry/api";
import { ProcessType, getTelemetryConfig, TelemetryConfig } from "./config";

// Re-export from sdk-node to avoid version conflicts
const { ConsoleSpanExporter } = tracing;
const { ParentBasedSampler, TraceIdRatioBasedSampler } = tracing;
const { Resource } = resources;

/**
 * Map config log level to OpenTelemetry DiagLogLevel
 */
function getDiagLogLevel(level: TelemetryConfig["logLevel"]): DiagLogLevel {
  switch (level) {
    case "error":
      return DiagLogLevel.ERROR;
    case "warn":
      return DiagLogLevel.WARN;
    case "info":
      return DiagLogLevel.INFO;
    case "debug":
      return DiagLogLevel.DEBUG;
    case "verbose":
      return DiagLogLevel.VERBOSE;
    case "all":
      return DiagLogLevel.ALL;
    case "none":
    default:
      return DiagLogLevel.NONE;
  }
}

let sdk: NodeSDK | null = null;
let isInitialized = false;
let currentConfig: TelemetryConfig | null = null;

/**
 * Initialize OpenTelemetry SDK
 *
 * @param processType - The type of process (api or worker)
 * @returns The initialized SDK or null if disabled
 */
export function initTelemetry(processType: ProcessType): NodeSDK | null {
  if (isInitialized) {
    console.warn("[Telemetry] Already initialized, skipping...");
    return sdk;
  }

  const config = getTelemetryConfig(processType);
  currentConfig = config;

  // Enable diagnostic logging if configured
  const diagLogLevel = getDiagLogLevel(config.logLevel);
  if (diagLogLevel !== DiagLogLevel.NONE) {
    diag.setLogger(new DiagConsoleLogger(), diagLogLevel);
  }

  if (!config.enabled) {
    console.log("[Telemetry] Disabled via configuration");
    isInitialized = true;
    return null;
  }

  console.log(`[Telemetry] Initializing for ${config.serviceName}...`);

  // Create resource with service information using the new API
  const resource = new Resource({
    [ATTR_SERVICE_NAME]: config.serviceName,
    [ATTR_SERVICE_VERSION]: config.serviceVersion,
    "deployment.environment.name": config.environment,
    "process.type": processType,
  });

  // Configure sampler (parent-based for distributed tracing)
  const sampler = new ParentBasedSampler({
    root: new TraceIdRatioBasedSampler(config.sampleRate),
  });

  // Determine trace exporter based on configuration
  const traceExporter = config.otlpEndpoint
    ? new OTLPTraceExporter({
        url: `${config.otlpEndpoint}/v1/traces`,
      })
    : config.consoleExporter
      ? new ConsoleSpanExporter()
      : undefined;

  if (config.otlpEndpoint) {
    console.log(`[Telemetry] OTLP exporter configured: ${config.otlpEndpoint}`);
  } else if (config.consoleExporter) {
    console.log("[Telemetry] Console exporter enabled");
  }

  // Initialize SDK with auto-instrumentation
  // NodeSDK handles span processor creation internally
  sdk = new NodeSDK({
    resource,
    sampler,
    traceExporter,
    instrumentations: [
      getNodeAutoInstrumentations({
        // Disable fs instrumentation (too noisy)
        "@opentelemetry/instrumentation-fs": { enabled: false },
        // Configure HTTP instrumentation
        "@opentelemetry/instrumentation-http": {
          ignoreIncomingRequestHook: (request) => {
            // Ignore health check requests
            const url = "url" in request ? request.url : undefined;
            return url === "/health" || url === "/metrics";
          },
        },
        // Configure PostgreSQL instrumentation
        "@opentelemetry/instrumentation-pg": {
          enhancedDatabaseReporting: true,
        },
        // Configure Redis instrumentation  
        "@opentelemetry/instrumentation-ioredis": {
          dbStatementSerializer: (cmdName, cmdArgs) => {
            // Limit statement length for security
            const argsArray = Array.isArray(cmdArgs) ? cmdArgs : [];
            const args = argsArray.slice(0, 2).map(String).join(" ");
            return `${cmdName} ${args}`.substring(0, 100);
          },
        },
      }),
    ],
  });

  // Start the SDK
  sdk.start();
  isInitialized = true;

  console.log(`[Telemetry] Initialized successfully`);
  console.log(`[Telemetry] Service: ${config.serviceName}`);
  console.log(`[Telemetry] Sample rate: ${config.sampleRate * 100}%`);

  return sdk;
}

/**
 * Gracefully shutdown the OpenTelemetry SDK
 * Call this during application shutdown to flush pending spans
 */
export async function shutdownTelemetry(): Promise<void> {
  if (!sdk) {
    return;
  }

  console.log("[Telemetry] Shutting down...");

  try {
    await sdk.shutdown();
    console.log("[Telemetry] Shutdown complete");
  } catch (error) {
    console.error("[Telemetry] Error during shutdown:", error);
  } finally {
    sdk = null;
    isInitialized = false;
  }
}

/**
 * Get the current telemetry configuration
 */
export function getTelemetryState(): { isInitialized: boolean; config: TelemetryConfig | null } {
  return { isInitialized, config: currentConfig };
}

/**
 * Check if telemetry is enabled and initialized
 * Use this to skip telemetry operations when disabled
 */
export function isTelemetryEnabled(): boolean {
  return isInitialized && currentConfig?.enabled === true;
}

// Re-export OpenTelemetry API for convenience
export { trace, context, SpanStatusCode, SpanKind };
export type { Span, Attributes };

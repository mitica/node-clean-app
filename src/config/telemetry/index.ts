/**
 * Telemetry Module
 *
 * Exports all telemetry-related functionality for the application.
 */

// Configuration
export { getTelemetryConfig, type TelemetryConfig, type ProcessType } from "./config";

// SDK initialization
export {
  initTelemetry,
  shutdownTelemetry,
  getTelemetryState,
  isTelemetryEnabled,
  trace,
  context,
  SpanStatusCode,
  SpanKind,
  type Span,
  type Attributes,
} from "./sdk";

// Utility functions
export {
  getTracer,
  getActiveSpan,
  withSpan,
  withSpanSync,
  recordSpanError,
  addSpanEvent,
  setSpanAttributes,
  createChildSpan,
  SpanAttributes,
  type SpanOptions,
} from "./utils";

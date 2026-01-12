/**
 * Telemetry Utility Functions
 *
 * Helper functions for creating spans, recording errors, and adding attributes.
 * These utilities provide a clean API for manual instrumentation.
 */

import {
  trace,
  context,
  SpanStatusCode,
  SpanKind,
  Span,
  Attributes,
  Context,
} from "@opentelemetry/api";

const TRACER_NAME = "node-clean-app";

/**
 * Get the application tracer
 */
export function getTracer(name: string = TRACER_NAME) {
  return trace.getTracer(name);
}

/**
 * Get the currently active span
 */
export function getActiveSpan(): Span | undefined {
  return trace.getActiveSpan();
}

/**
 * Options for creating a span
 */
export interface SpanOptions {
  /** Span kind (default: INTERNAL) */
  kind?: SpanKind;
  /** Initial attributes */
  attributes?: Attributes;
  /** Parent context (uses active context if not provided) */
  parentContext?: Context;
}

/**
 * Execute a function within a new span
 *
 * @example
 * const result = await withSpan("processOrder", async (span) => {
 *   span.setAttribute("order.id", orderId);
 *   return await processOrder(orderId);
 * });
 */
export async function withSpan<T>(
  name: string,
  fn: (span: Span) => Promise<T>,
  options: SpanOptions = {}
): Promise<T> {
  const tracer = getTracer();
  const parentContext = options.parentContext ?? context.active();

  return tracer.startActiveSpan(
    name,
    {
      kind: options.kind ?? SpanKind.INTERNAL,
      attributes: options.attributes,
    },
    parentContext,
    async (span: Span) => {
      try {
        const result = await fn(span);
        span.setStatus({ code: SpanStatusCode.OK });
        return result;
      } catch (error) {
        recordSpanError(span, error);
        throw error;
      } finally {
        span.end();
      }
    }
  );
}

/**
 * Execute a synchronous function within a new span
 */
export function withSpanSync<T>(
  name: string,
  fn: (span: Span) => T,
  options: SpanOptions = {}
): T {
  const tracer = getTracer();
  const parentContext = options.parentContext ?? context.active();

  return tracer.startActiveSpan(
    name,
    {
      kind: options.kind ?? SpanKind.INTERNAL,
      attributes: options.attributes,
    },
    parentContext,
    (span: Span) => {
      try {
        const result = fn(span);
        span.setStatus({ code: SpanStatusCode.OK });
        return result;
      } catch (error) {
        recordSpanError(span, error);
        throw error;
      } finally {
        span.end();
      }
    }
  );
}

/**
 * Record an error on a span
 */
export function recordSpanError(span: Span, error: unknown): void {
  const errorMessage =
    error instanceof Error ? error.message : String(error);
  const errorStack = error instanceof Error ? error.stack : undefined;

  span.setStatus({
    code: SpanStatusCode.ERROR,
    message: errorMessage,
  });

  span.recordException(error instanceof Error ? error : new Error(String(error)));

  span.setAttributes({
    "error.type": error instanceof Error ? error.constructor.name : "Error",
    "error.message": errorMessage,
    ...(errorStack && { "error.stack": errorStack }),
  });
}

/**
 * Add an event to the current span
 */
export function addSpanEvent(
  name: string,
  attributes?: Attributes
): void {
  const span = getActiveSpan();
  if (span) {
    span.addEvent(name, attributes);
  }
}

/**
 * Set attributes on the current span
 */
export function setSpanAttributes(attributes: Attributes): void {
  const span = getActiveSpan();
  if (span) {
    span.setAttributes(attributes);
  }
}

/**
 * Create a child span from the current context
 */
export function createChildSpan(
  name: string,
  options: SpanOptions = {}
): Span {
  const tracer = getTracer();
  return tracer.startSpan(name, {
    kind: options.kind ?? SpanKind.INTERNAL,
    attributes: options.attributes,
  });
}

/**
 * Standard attribute keys for domain operations
 */
export const SpanAttributes = {
  // User attributes
  USER_ID: "user.id",
  USER_EMAIL: "user.email",

  // Request attributes
  REQUEST_ID: "request.id",
  REQUEST_IP: "request.ip",

  // Database attributes
  DB_OPERATION: "db.operation",
  DB_TABLE: "db.table",
  DB_STATEMENT: "db.statement",

  // Worker attributes
  WORKER_ID: "worker.id",
  TASK_ID: "task.id",
  TASK_TYPE: "task.type",
  TASK_ATTEMPT: "task.attempt",
  TASK_STATUS: "task.status",

  // Domain attributes
  ENTITY_TYPE: "entity.type",
  ENTITY_ID: "entity.id",
  USECASE_NAME: "usecase.name",
} as const;

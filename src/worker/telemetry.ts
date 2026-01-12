/**
 * Worker Task Instrumentation
 *
 * Provides tracing for worker task processing.
 * Creates spans for each task with relevant attributes.
 */

import {
  trace,
  context,
  SpanKind,
  SpanStatusCode,
  propagation,
  Span,
  TextMapGetter,
  TextMapSetter,
} from "@opentelemetry/api";
import { SpanAttributes, withSpan, isTelemetryEnabled } from "../config/telemetry";
import type { WorkerTask } from "../domain/entity/worker-task";
import type { TaskHandlerResult } from "../domain/worker";

const TRACER_NAME = "worker-task";

/**
 * Task tracing context stored in task payload
 */
interface TaskTraceContext {
  traceparent?: string;
  tracestate?: string;
}

/**
 * Extract trace context from task payload for distributed tracing
 */
export function extractTaskTraceContext(task: WorkerTask): TaskTraceContext {
  const payload = task.payload as Record<string, unknown> | undefined;
  return {
    traceparent: payload?.["_traceparent"] as string | undefined,
    tracestate: payload?.["_tracestate"] as string | undefined,
  };
}

/**
 * Create trace context headers to inject into task payload
 * Use this when creating a task to propagate the current trace
 */
export function createTaskTraceHeaders(): Record<string, string> {
  const headers: Record<string, string> = {};

  const setter: TextMapSetter<Record<string, string>> = {
    set(carrier, key, value) {
      carrier[`_${key}`] = value;
    },
  };

  propagation.inject(context.active(), headers, setter);

  return headers;
}

/**
 * Wrap a task handler with tracing
 *
 * @example
 * const tracedHandler = traceTaskHandler(async (context) => {
 *   // Your handler logic
 *   return { success: true, result: data };
 * });
 */
export function traceTaskHandler<T extends TaskHandlerResult>(
  handler: (ctx: { task: WorkerTask; isShuttingDown: () => boolean }) => Promise<T>
): (ctx: { task: WorkerTask; isShuttingDown: () => boolean }) => Promise<T> {
  const tracer = trace.getTracer(TRACER_NAME);

  return async (ctx) => {
    // Skip tracing if telemetry is disabled
    if (!isTelemetryEnabled()) {
      return handler(ctx);
    }

    const { task } = ctx;
    const traceContext = extractTaskTraceContext(task);

    // Extract parent context if available (for distributed tracing from API)
    let parentContext = context.active();
    if (traceContext.traceparent) {
      const getter: TextMapGetter<TaskTraceContext> = {
        get(carrier, key) {
          return carrier[key as keyof TaskTraceContext];
        },
        keys() {
          return ["traceparent", "tracestate"];
        },
      };
      parentContext = propagation.extract(context.active(), traceContext, getter);
    }

    const spanName = `task:${task.type}`;

    return tracer.startActiveSpan(
      spanName,
      {
        kind: SpanKind.CONSUMER,
        attributes: {
          [SpanAttributes.TASK_ID]: task.id,
          [SpanAttributes.TASK_TYPE]: task.type,
          [SpanAttributes.TASK_ATTEMPT]: task.attempts,
          "task.priority": task.priority,
          "task.scheduled_at": task.scheduledAt,
          "task.created_at": task.createdAt,
        },
      },
      parentContext,
      async (span: Span) => {
        try {
          const result = await handler(ctx);

          // Set status based on result
          if (result.success) {
            span.setStatus({ code: SpanStatusCode.OK });
            span.setAttribute(SpanAttributes.TASK_STATUS, "completed");
          } else {
            span.setStatus({
              code: SpanStatusCode.ERROR,
              message: result.error?.message || "Task failed",
            });
            span.setAttribute(SpanAttributes.TASK_STATUS, "failed");

            if (result.error) {
              span.recordException(result.error);
            }
          }

          return result;
        } catch (error) {
          span.setStatus({
            code: SpanStatusCode.ERROR,
            message: error instanceof Error ? error.message : String(error),
          });
          span.recordException(
            error instanceof Error ? error : new Error(String(error))
          );
          span.setAttribute(SpanAttributes.TASK_STATUS, "error");

          throw error;
        } finally {
          span.end();
        }
      }
    );
  };
}

/**
 * Create a span for worker lifecycle events
 */
export function createWorkerSpan(
  workerId: string,
  operation: "start" | "stop" | "poll" | "stale-check"
): Span {
  const tracer = trace.getTracer(TRACER_NAME);

  // Return a no-op span if telemetry is disabled
  if (!isTelemetryEnabled()) {
    return trace.getTracer(TRACER_NAME).startSpan("noop", { root: true });
  }

  return tracer.startSpan(`worker:${operation}`, {
    kind: SpanKind.INTERNAL,
    attributes: {
      [SpanAttributes.WORKER_ID]: workerId,
      "worker.operation": operation,
    },
  });
}

/**
 * Instrument a worker polling cycle
 */
export async function traceWorkerPoll<T>(
  workerId: string,
  fn: () => Promise<T>
): Promise<T> {
  // Skip tracing if telemetry is disabled
  if (!isTelemetryEnabled()) {
    return fn();
  }

  return withSpan(
    "worker:poll",
    async (span) => {
      span.setAttribute(SpanAttributes.WORKER_ID, workerId);
      return fn();
    },
    { kind: SpanKind.INTERNAL }
  );
}

/**
 * Add trace context to task payload for distributed tracing.
 * The trace context will be automatically extracted by the worker
 * when processing the task, linking API and Worker spans together.
 *
 * @example
 * await createWorkerTask(ctx, {
 *   type: "email:send",
 *   payload: injectTaskTraceContext({ to: "user@example.com", subject: "Hello" })
 * });
 */
export function injectTaskTraceContext(
  payload: Record<string, unknown> = {}
): Record<string, unknown> {
  const traceHeaders = createTaskTraceHeaders();

  return {
    ...payload,
    ...traceHeaders,
  };
}

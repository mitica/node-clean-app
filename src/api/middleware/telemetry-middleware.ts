/**
 * OpenTelemetry Middleware for Hono
 *
 * Provides distributed tracing for HTTP requests.
 * Automatically creates spans for each request with standard HTTP attributes.
 */

import { createMiddleware } from "hono/factory";
import {
  trace,
  context,
  SpanKind,
  SpanStatusCode,
  propagation,
  Span,
  TextMapGetter,
} from "@opentelemetry/api";
import {
  ATTR_HTTP_REQUEST_METHOD,
  ATTR_HTTP_ROUTE,
  ATTR_URL_PATH,
  ATTR_HTTP_RESPONSE_STATUS_CODE,
  ATTR_CLIENT_ADDRESS,
  ATTR_USER_AGENT_ORIGINAL,
  ATTR_ERROR_TYPE,
} from "@opentelemetry/semantic-conventions";
import type { HonoEnv } from "../types";
import { SpanAttributes, isTelemetryEnabled } from "../../config/telemetry";

const TRACER_NAME = "hono-http";

/**
 * Telemetry middleware options
 */
export interface TelemetryMiddlewareOptions {
  /** Routes to ignore (e.g., ["/health", "/metrics"]) */
  ignoreRoutes?: string[];
  /** Whether to record request/response headers */
  recordHeaders?: boolean;
  /** Custom span name generator */
  spanNameGenerator?: (method: string, path: string) => string;
}

const defaultOptions: TelemetryMiddlewareOptions = {
  ignoreRoutes: ["/health", "/metrics"],
  recordHeaders: false,
  spanNameGenerator: (method, path) => `${method} ${path}`,
};

/**
 * Create OpenTelemetry tracing middleware for Hono
 *
 * @example
 * import { telemetryMiddleware } from "./middleware/telemetry-middleware";
 *
 * app.use("*", telemetryMiddleware());
 */
export function telemetryMiddleware(options: TelemetryMiddlewareOptions = {}) {
  const opts = { ...defaultOptions, ...options };
  const tracer = trace.getTracer(TRACER_NAME);

  return createMiddleware<HonoEnv>(async (c, next) => {
    const path = c.req.path;
    const method = c.req.method;

    // Skip if telemetry is disabled
    if (!isTelemetryEnabled()) {
      return next();
    }

    // Skip ignored routes
    if (opts.ignoreRoutes?.includes(path)) {
      return next();
    }

    // Extract trace context from incoming request headers
    const headersGetter: TextMapGetter<Headers> = {
      get(carrier, key) {
        return carrier.get(key) ?? undefined;
      },
      keys(carrier) {
        // Use entries() which is more widely supported
        const keys: string[] = [];
        carrier.forEach((_, key) => keys.push(key));
        return keys;
      },
    };
    
    const extractedContext = propagation.extract(
      context.active(),
      c.req.raw.headers,
      headersGetter
    );

    // Generate span name
    const spanName = opts.spanNameGenerator!(method, path);

    // Start span with extracted context
    return tracer.startActiveSpan(
      spanName,
      {
        kind: SpanKind.SERVER,
        attributes: {
          [ATTR_HTTP_REQUEST_METHOD]: method,
          [ATTR_URL_PATH]: path,
          [ATTR_CLIENT_ADDRESS]: c.req.header("x-forwarded-for") || c.req.header("x-real-ip"),
          [ATTR_USER_AGENT_ORIGINAL]: c.req.header("user-agent"),
        },
      },
      extractedContext,
      async (span: Span) => {
        // Add request ID if available from context middleware
        const requestContext = c.get("requestContext");
        if (requestContext?.requestId) {
          span.setAttribute(SpanAttributes.REQUEST_ID, requestContext.requestId);
        }

        // Record request headers if enabled
        if (opts.recordHeaders) {
          const headers: Record<string, string> = {};
          c.req.raw.headers.forEach((value, key) => {
            // Skip sensitive headers
            if (!["authorization", "cookie", "x-api-key"].includes(key.toLowerCase())) {
              headers[`http.request.header.${key}`] = value;
            }
          });
          span.setAttributes(headers);
        }

        try {
          // Execute the request
          await next();

          // Get the response status
          const status = c.res.status;
          span.setAttribute(ATTR_HTTP_RESPONSE_STATUS_CODE, status);

          // Set matched route if available
          const route = c.req.routePath;
          if (route) {
            span.setAttribute(ATTR_HTTP_ROUTE, route);
            span.updateName(`${method} ${route}`);
          }

          // Set span status based on HTTP status
          if (status >= 400) {
            span.setStatus({
              code: SpanStatusCode.ERROR,
              message: `HTTP ${status}`,
            });

            if (status >= 500) {
              span.setAttribute(ATTR_ERROR_TYPE, "ServerError");
            } else if (status >= 400) {
              span.setAttribute(ATTR_ERROR_TYPE, "ClientError");
            }
          } else {
            span.setStatus({ code: SpanStatusCode.OK });
          }
        } catch (error) {
          // Record error
          span.setStatus({
            code: SpanStatusCode.ERROR,
            message: error instanceof Error ? error.message : String(error),
          });

          span.recordException(
            error instanceof Error ? error : new Error(String(error))
          );

          span.setAttribute(ATTR_HTTP_RESPONSE_STATUS_CODE, 500);
          span.setAttribute(
            ATTR_ERROR_TYPE,
            error instanceof Error ? error.constructor.name : "Error"
          );

          throw error;
        } finally {
          span.end();
        }
      }
    );
  });
}

/**
 * Add user context to the current span
 * Call this after authentication to enrich traces with user info
 */
export function enrichSpanWithUser(userId?: string | number, isAdmin?: boolean): void {
  const span = trace.getActiveSpan();
  if (span && userId) {
    span.setAttribute(SpanAttributes.USER_ID, String(userId));
    if (isAdmin !== undefined) {
      span.setAttribute("user.is_admin", isAdmin);
    }
  }
}

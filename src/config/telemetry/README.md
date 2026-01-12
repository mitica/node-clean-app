# OpenTelemetry Integration

This document describes the OpenTelemetry (OTel) integration for distributed tracing and observability.

## Architecture Overview

The application uses OpenTelemetry to provide:
- **Distributed Tracing**: Track requests across API and Worker processes
- **Auto-instrumentation**: Automatic tracing for HTTP, PostgreSQL, Redis, and more
- **Manual instrumentation**: Custom spans for business logic and domain operations

```
┌─────────────────────────────────────────────────────────────────┐
│                    Observability Backend                        │
│         (Jaeger, Zipkin, Grafana Tempo, Datadog, etc.)         │
└─────────────────────────────────────────────────────────────────┘
                              ▲
                              │ OTLP (HTTP/gRPC)
                              │
        ┌─────────────────────┴─────────────────────┐
        │                                           │
┌───────┴────────┐                        ┌────────┴───────┐
│   API Process   │                        │ Worker Process │
│                 │                        │                │
│ ┌─────────────┐ │   Trace Context       │ ┌────────────┐ │
│ │   HTTP      │ │ ─────────────────────▶│ │   Task     │ │
│ │  Handler    │ │   (via task metadata) │ │  Handler   │ │
│ └─────────────┘ │                        │ └────────────┘ │
│       │         │                        │       │        │
│       ▼         │                        │       ▼        │
│ ┌─────────────┐ │                        │ ┌────────────┐ │
│ │  Database   │ │                        │ │  Database  │ │
│ │   (auto)    │ │                        │ │   (auto)   │ │
│ └─────────────┘ │                        │ └────────────┘ │
└─────────────────┘                        └────────────────┘
```

## Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `OTEL_ENABLED` | Enable/disable telemetry | `true` |
| `OTEL_SERVICE_NAME` | Base service name | `node-clean-app` |
| `OTEL_EXPORTER_OTLP_ENDPOINT` | OTLP collector endpoint | - |
| `OTEL_EXPORTER_OTLP_PROTOCOL` | Protocol: `grpc`, `http/protobuf`, `http/json` | `http/protobuf` |
| `OTEL_TRACES_SAMPLER_ARG` | Sample rate (0.0 - 1.0) | `1.0` (dev), `0.1` (prod) |
| `OTEL_CONSOLE_EXPORTER` | Enable console output | `true` (dev only) |
| `OTEL_LOG_LEVEL` | Diagnostic log level | - |

### Batch Processor Configuration

| Variable | Description | Default |
|----------|-------------|---------|
| `OTEL_BSP_MAX_QUEUE_SIZE` | Max queue size | `2048` |
| `OTEL_BSP_MAX_EXPORT_BATCH_SIZE` | Max batch size | `512` |
| `OTEL_BSP_SCHEDULE_DELAY` | Export delay (ms) | `5000` |
| `OTEL_BSP_EXPORT_TIMEOUT` | Export timeout (ms) | `30000` |

### Example Configuration

```bash
# .env for development
OTEL_ENABLED=true
OTEL_CONSOLE_EXPORTER=true

# .env for production with Jaeger
OTEL_ENABLED=true
OTEL_EXPORTER_OTLP_ENDPOINT=http://jaeger:4318
OTEL_TRACES_SAMPLER_ARG=0.1

# .env for production with Grafana Cloud
OTEL_ENABLED=true
OTEL_EXPORTER_OTLP_ENDPOINT=https://otlp-gateway-prod-us-east-0.grafana.net/otlp
OTEL_EXPORTER_OTLP_HEADERS=Authorization=Basic <base64-encoded-credentials>
```

## Usage

### Automatic Instrumentation

The following are automatically instrumented:
- HTTP requests (incoming and outgoing)
- PostgreSQL queries
- Redis commands
- DNS lookups

### Manual Instrumentation

#### Creating Custom Spans

```typescript
import { withSpan, setSpanAttributes, SpanAttributes } from "../config/telemetry";

// Async operations
const result = await withSpan("processOrder", async (span) => {
  span.setAttribute("order.id", orderId);
  span.setAttribute("order.total", total);
  
  const order = await orderService.process(orderId);
  
  span.addEvent("order_processed", { items: order.items.length });
  return order;
});

// Add attributes to current span
setSpanAttributes({
  [SpanAttributes.USER_ID]: userId,
  "custom.attribute": value,
});
```

#### Worker Task Tracing

Tasks automatically propagate trace context from API to Worker:

```typescript
// In API: Create task with trace context
import { injectTaskTraceContext } from "../worker/telemetry";

await createWorkerTask(ctx, {
  type: "email:send",
  payload: injectTaskTraceContext({ to: "user@example.com", subject: "Hello" })
});

// In Worker: Use traced handler
import { traceTaskHandler } from "../worker/telemetry";

const handler: TaskHandlerRegistration = {
  type: "email:send",
  handler: traceTaskHandler(async (context) => {
    // Your logic here - automatically traced
    return { success: true };
  }),
};
```

### Standard Span Attributes

Use the provided constants for consistent attribute naming:

```typescript
import { SpanAttributes } from "../config/telemetry";

span.setAttribute(SpanAttributes.USER_ID, userId);
span.setAttribute(SpanAttributes.TASK_TYPE, "email:send");
span.setAttribute(SpanAttributes.ENTITY_TYPE, "Order");
```

Available attributes:
- `USER_ID`, `USER_EMAIL` - User identification
- `REQUEST_ID`, `REQUEST_IP` - Request context
- `DB_OPERATION`, `DB_TABLE` - Database operations
- `WORKER_ID`, `TASK_ID`, `TASK_TYPE` - Worker context
- `ENTITY_TYPE`, `ENTITY_ID` - Domain entities
- `USECASE_NAME` - Business operations

## Local Development

### Quick Start with Docker

The docker-compose.yml is pre-configured with Jaeger for distributed tracing:

```bash
# Start all services (API, Worker, PostgreSQL, Redis, Jaeger)
yarn up

# View traces at http://localhost:16686
```

Services:
- **API**: http://localhost:42407 (traces as `node-clean-app-api`)
- **Worker**: Running in background (traces as `node-clean-app-worker`)
- **Jaeger UI**: http://localhost:16686

### Using Jaeger

Jaeger is already configured in `docker-compose.yml`:

Access Jaeger UI at: http://localhost:16686

### Using Grafana + Tempo

Add to `docker-compose.yml`:

```yaml
services:
  tempo:
    image: grafana/tempo:latest
    command: [ "-config.file=/etc/tempo.yaml" ]
    volumes:
      - ./docker/tempo/tempo.yaml:/etc/tempo.yaml
    ports:
      - "4317:4317"  # OTLP gRPC
      - "4318:4318"  # OTLP HTTP

  grafana:
    image: grafana/grafana:latest
    ports:
      - "3001:3000"
    environment:
      - GF_AUTH_ANONYMOUS_ENABLED=true
      - GF_AUTH_ANONYMOUS_ORG_ROLE=Admin
```

## Production Best Practices

1. **Sampling**: Use a lower sample rate in production (0.1 = 10%)
2. **Sensitive Data**: Never log PII in span attributes
3. **Batch Processing**: Use batch span processor for better performance
4. **Error Tracking**: Always record exceptions with `recordException()`
5. **Graceful Shutdown**: Call `shutdownTelemetry()` before exit

## Troubleshooting

### No Traces Appearing

1. Check `OTEL_ENABLED` is not set to `false`
2. Verify `OTEL_EXPORTER_OTLP_ENDPOINT` is correct
3. Enable debug logging: `OTEL_LOG_LEVEL=debug`
4. Check collector logs for connection issues

### High Memory Usage

1. Reduce `OTEL_BSP_MAX_QUEUE_SIZE`
2. Increase `OTEL_BSP_SCHEDULE_DELAY` for less frequent exports
3. Lower the sample rate

### Missing Spans

1. Ensure telemetry is initialized FIRST (before other imports)
2. Check the span processor isn't dropping spans (queue full)
3. Verify the sampler isn't filtering the traces

## Files Reference

| File | Purpose |
|------|---------|
| `src/config/telemetry/config.ts` | Configuration types and loader |
| `src/config/telemetry/sdk.ts` | SDK initialization |
| `src/config/telemetry/utils.ts` | Helper functions |
| `src/api/middleware/telemetry-middleware.ts` | Hono HTTP middleware |
| `src/worker/telemetry.ts` | Worker task instrumentation |

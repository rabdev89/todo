---
id: distributed-tracing-v1
name: Distributed Tracing
category: architecture
type: pattern
scope: universal
version: 1.0.0
last_updated: 2024-03-07
author: bob-framework
difficulty: High
status: complete
stacks: [nodejs, python, go]
universal: true
tags: [tracing, opentelemetry, observability, monitoring, jaeger, zipkin, microservices]
---

# SKILL: Distributed Tracing

## Problem

Modern microservices need distributed tracing for:
- Request flow visualization across services
- Performance bottleneck identification
- Error debugging and root cause analysis
- Service dependency mapping
- User experience tracking
- System health monitoring

Without distributed tracing:
- Debugging production issues is extremely difficult
- Performance problems go unnoticed
- No visibility into request flows
- Can't identify service dependencies
- User experience issues are hard to diagnose
- No observability into system behavior

## Solution Overview

Implement distributed tracing with:
- **OpenTelemetry**: Industry-standard observability framework
- **Trace Context Propagation**: W3C Trace Context headers
- **Span Creation**: Automatic span generation
- **Instrumentation**: Automatic and manual tracing
- **Export**: Multiple backend support (Jaeger, Zipkin, etc.)
- **Sampling**: Intelligent trace sampling for performance
- **Metrics Collection**: Rich tracing metrics

This enables end-to-end visibility into distributed systems.

## Implementation

### Files to Create

| File | Purpose | Layer | Stack |
|------|---------|-------|-------|-------|
| `tracing/opentelemetry.js` | OpenTelemetry implementation | tracing | nodejs |
| `tracing/opentelemetry.py` | OpenTelemetry implementation | tracing | python |
| `tracing/opentelemetry.go` | OpenTelemetry implementation | tracing | go |
| `tracing/jaeger_exporter.js` | Jaeger exporter | tracing | nodejs |
| `tracing/jaeger_exporter.py` | Jaeger exporter | tracing | python |
| `tracing/jaeger_exporter.go` | Jaeger exporter | tracing | go |
| `tracing/zipkin_exporter.js` | Zipkin exporter | tracing | nodejs |
| `tracing/zipkin_exporter.py` | Zipkin exporter | tracing | python |
| `tracing/zipkin_exporter.go` | Zipkin exporter | tracing | go |
| `tracing/trace_context.js` | Trace context management | tracing | nodejs |
| `tracing/trace_context.py` | Trace context management | tracing | python |
| `tracing/trace_context.go` | Trace context management | tracing | go |
| `tracing/middleware/tracing_middleware.js` | Tracing middleware | middleware | nodejs |
| `tracing/middleware/tracing_middleware.py` | Tracing middleware | middleware | python |
| `tracing/middleware/tracing_middleware.go` | Tracing middleware | middleware | go |
| `tracing/instrumentation/express_instrumentation.js` | Express auto-instrumentation | tracing | nodejs |
| `tracing/instrumentation/express_instrumentation.py` | Express auto-instrumentation | tracing | python |
| `tracing/instrumentation/express_instrumentation.go` | Express auto-instrumentation | tracing | go |
| `tracing/metrics/tracing_metrics.js` | Tracing metrics | metrics | nodejs |
| `tracing/metrics/tracing_metrics.py` | Tracing metrics | metrics | python |
| `tracing/metrics/tracing_metrics.go` | Tracing metrics | metrics | go |

### Code Patterns

#### Stack: Node.js + OpenTelemetry

```javascript
// tracing/opentelemetry.js
const { NodeSDK } = require('@opentelemetry/api');
const { Resource } = require('@opentelemetry/resources');
const { SemanticAttributes } = require('@opentelemetry/semantic-conventions');

const {
  traceProvider,
  tracer,
  meter,
  logger
} = require('./tracing_config');

// Create OpenTelemetry resources
const meterProvider = new MeterProvider({
  exporter: traceProvider,
  instrument: [new BatchSpanProcessor(traceProvider)],
});

const tracer = traceProvider.getTracer('my-service', '1.0.0');

// Create a span
const span = tracer.startSpan('user-operation', {
  attributes: {
    [SemanticAttributes.SERVICE_NAME]: 'user-service',
    [SemanticAttributes.OPERATION_NAME]: 'process-user-data'
  },
  startTime: Date.now(),
});

// Add events
span.addEvent('user-validation', {
  attributes: {
    [SemanticAttributes.USER_ID]: userId,
    [SemanticAttributes.USER_EMAIL]: userEmail
  }
});

// End the span
span.end();

// Create a counter
const counter = meter.createCounter('user_operations', {
  description: 'Number of user operations',
  unit: 'operations'
});

counter.add(1, { operation: 'login' });
counter.add(1, { operation: 'search' });

module.exports = { traceProvider, tracer, meter, logger };
```

#### Stack: Python + OpenTelemetry

```python
# tracing/opentelemetry.py
from opentelemetry import trace, baggage, context
from opentelemetry.exporter.jaeger.thrift import JaegerExporter
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.metrics import MeterProvider
from opentelemetry.sdk.resources import Resource

class OpenTelemetryTracer:
    def __init__(self, service_name='my-service'):
        # Initialize tracer provider
        trace.set_tracer_provider(JaegerExporter(
            agent_name=service_name,
            agent_host='localhost',
            agent_port=16686,
        ))
        
        self.tracer = trace.get_tracer(service_name)
        self.meter = MeterProvider(
            meter_provider=trace.get_tracer_provider(),
        resource=Resource.create({
                type="service",
                name=service_name
            })
        )
    
    def trace_operation(self, operation_name, attributes=None):
        with self.tracer.start_as_current_span(operation_name, attributes=attributes) as span:
            try:
                # Your business logic here
                result = some_business_logic()
                
                # Add events to span
                span.add_event('operation_completed', {
                    attributes: {
                        'result.status': 'success'
                    }
                })
                
                return result
            except Exception as e:
                span.record_error(e)
                    span.add_event('operation_error', {
                        attributes: {
                            'error.message': str(e)
                        }
                    })
                    raise
            finally:
                span.end()

# services/user_service.py
from .tracing.opentelemetry import OpenTelemetryTracer

class UserService:
    def __init__(self):
        self.tracer = OpenTelemetryTracer('user-service')
    
    async def get_user(self, user_id):
        with self.tracer.start_as_current_span('get_user', {
            attributes={
                'user.id': user_id
            }
        }) as span:
            try:
                user = await self.get_user_from_db(user_id)
                return user
            except Exception as e:
                span.record_error(e)
                    raise
            finally:
                span.end()

    async def process_user_data(self, user, user_data):
        with self.tracer.start_as_current_span('process_user_data', {
            attributes={
                'user.id': user.id
            }
        }) as span:
            try:
                # Process user data
                result = self.process_data_logic(user, user_data)
                
                span.add_event('data_processed', {
                    attributes: {
                        'records_count': len(user_data)
                    }
                })
                
                return result
            except Exception as e:
                span.record_error(e)
                    raise
            finally:
                span.end()
```

#### Stack: Go + OpenTelemetry

```go
// tracing/opentelemetry.go
package tracing

import (
	"context"
	"go.opentelemetry.io/otel/trace"
	"go.opentelemetry.io/otel/exporters/jaeger"
	"go.opentelemetry.io/otel/sdk/metric"
	"go.opentelemetry.io/otel/sdk/resource"
	"go.opentelemetry.io/otel/sdk/trace"
	"go.opentelemetry.io/otel/semconv/v1/api"
	"go.opentelemetry.io/otel/exporters/otlp"
	"go.opentelemetry.io/otel/sdk/metric"
	"go.opentelemetry.io/otel/sdk/resource"
)

type TracingConfig struct {
	ServiceName    string
	JaegerEndpoint string
	SamplingRate   float64
}

func NewTracingProvider(config TracingConfig) (*trace.TracerProvider, error) {
	// Create Jaeger exporter
	exporter, err := jaeger.New(jaeger.WithCollectorEndpoint(config.JaegerEndpoint))
	if err != nil {
		return nil, err
	}
	
	traceProvider := trace.NewTracerProvider(
		trace.WithBatchExporter(exporter),
		trace.WithSampler(trace.TraceIDRatioBased(config.SamplingRate)),
	)
	trace.WithResource(resource.NewWithAttributes(
			semconv.Package(),
			semconv.WithServiceName(config.ServiceName),
			semconv.WithAttributes(resource.NewWithAttributes(
				semconv.WithHost("localhost"),
				semconv.WithServiceName(config.ServiceName),
			)),
		),
	)
	
	return &traceProvider, nil
}

// tracing/trace_context.go
package tracing

import (
	"context"
	"go.opentelemetry.io/otel/trace"
)

type TraceContext struct {
	TraceID  string
	SpanID   string
	Flags    uint32
}

var (
	currentTraceID string
	currentSpanID   string
	currentFlags    uint32
)

func InitTraceContext(traceID, spanID, flags uint32) {
	currentTraceID = traceID
	currentSpanID = spanID
	currentFlags = flags
}

func GetCurrentTraceContext() *TraceContext {
	return &TraceContext{
		TraceID:  currentTraceID,
		SpanID:   currentSpanID,
		Flags:    currentFlags,
	}
}

func WithSpan(span trace.Span) context.Context {
	ctx := context.WithValue(
		"trace-context",
		&TraceContext{
			TraceID: currentTraceID,
			SpanID:   span.SpanContext().TraceID,
			Flags:    currentFlags,
		},
	)
	
	return ctx
}

// tracing/middleware/tracing_middleware.go
package middleware

import (
	"context"
	"go.opentelemetry.io/otel/trace"
	"net/http"
	"go.opentelemetry.io/otel/propagation"
	"yourproject/tracing"
)

func TracingMiddleware(next http.Handler) http.Handler {
	return otelhttp.NewHandler(func(w http.ResponseWriter, r *http.Request) {
		spanName := r.Header.Get("x-trace-name")
		if spanName == "" {
			spanName = "unknown"
		}
		
		ctx, span := otel.Tracer.Start(r.Context(), spanName, trace.WithAttributes())
		defer span.End()
		
		// Add trace context to request context
		ctx = otel.GetTextMapPropagator().Extract(r.Context(), ctx)
		r = r.WithContext(ctx)
		
		next.ServeHTTP(w, r)
	})
}

// tracing/metrics/tracing_metrics.go
package metrics

import (
	"context"
	"time"
	"go.opentelemetry.io/otel/sdk/metric"
	"go.opentelemetry.io/otel/sdk/resource"
)

type TracingMetrics struct {
	Tracer  *trace.Tracer
	Meter   *metric.Meter
}

func NewTracingMetrics(tracer *trace.Tracer, meter *metric.Meter) *TracingMetrics {
	return &TracingMetrics{
		Tracer: tracer,
		Meter:  meter,
	}
}

func (tm *TracingMetrics) RecordSpanDuration(span trace.Span, operation string, duration time.Duration) {
	durationMs := duration.Milliseconds()
	
	tm.Meter.RecordHistogram(
		"span.duration",
		durationMs,
		[]metric.Attribute{
			metric.WithAttributes(
				metric.WithName("operation.name"),
				metric.WithAttribute("operation.name", operation),
			),
		},
	)
}

func (tm *TracingMetrics) RecordError(span trace.Span, error error) {
	tm.Tracer.AddEvent("error", trace.WithAttributes(
		metric.WithAttributes(
			metric.WithName("error.type", "exception"),
			metric.WithAttribute("error.message", error.Error()),
		),
	))
}

func (tm *TracingMetrics) IncrementCounter(name string) {
	tm.Meter.AddCounter(
		name,
		metric.WithAttributes(
			metric.WithName("counter.name"),
		),
		)
}
}
```

## Configuration Examples

### Environment Variables

```bash
# .env
OTEL_EXPORTER_JAEGER_ENDPOINT=http://localhost:16686
OTEL_SERVICE_NAME=user-service
OTEL_SAMPLING_RATE=0.1
JAEGER_SAMPLING_PARENT_ID=server
```

### Docker Compose

```yaml
version: '3.8'
services:
  opentelemetry-collector:
    image: otel/opentelemetry-collector:latest
    environment:
      - OTEL_EXPORTER_JAEGER_ENDPOINT=http://localhost:16686
      - OTEL_SERVICE_NAME=user-service
      - OTEL_RESOURCE_ATTRIBUTES=service.name=user-service,service.namespace=user-service,service.instance.id=1
      - OTEL_TRACES_EXPORTER=jaeger
    ports:
      - "4317:4317"
      - "4318:4318"
    volumes:
      - ./tracing/config:/etc/otel
      - ./tracing/data:/var/lib/docker/data
```

## Success Metrics

- [ ] Traces are created and propagated correctly
- [ ] OpenTelemetry instrumentation works across services
- [ ] Jaeger exporter collects and visualizes traces
- [ ] Performance metrics are captured
- [ ] Sampling prevents overwhelming the system
- [ ] Context propagation works across service boundaries

## Troubleshooting

### Common Issues

1. **Sampling Issues**
   - Monitor sampling rates
   - Adjust sampling based on traffic
   - Use adaptive sampling for high-volume services

2. **Exporter Problems**
   - Check exporter connectivity
   - Monitor exporter health
   - Verify batch export configuration

3. **Performance Issues**
   - Monitor span duration
   - Implement proper span boundaries
   - Use async instrumentation
   - Monitor resource usage

### Debug Commands

```bash
# Check OpenTelemetry status
curl http://localhost:4318/metrics

# Check Jaeger traces
curl http://localhost:16686/api/traces?service=user-service

# Validate trace context propagation
curl -H "traceparent: trace-id" http://localhost:8080/api/users
```

## Best Practices

### Instrumentation

1. **Automatic Instrumentation**: Use auto-instrumentation where possible
2. **Manual Spans**: Create spans for critical operations
3. **Event Enrichment**: Add relevant context to spans
4. **Error Handling**: Properly instrument error handling

### Performance

1. **Sampling Strategy**: Implement intelligent sampling
2. **Batch Processing**: Use async instrumentation
3. **Resource Monitoring**: Monitor tracer resource usage
4. **Span Limits**: Set maximum span duration limits

### Security

1. **Data Sanitization**: Sanitize trace data before export
2. **Access Control**: Implement trace access controls
3. **Encryption**: Secure trace data in transit
4. **Audit Logging**: Log all trace operations

### Observability

1. **Dashboard Integration**: Connect to observability backends
2. **Alerting**: Set up alerts for trace anomalies
3. **SLI/SLO Monitoring**: Monitor service level indicators
4. **Root Cause Analysis**: Use trace analysis tools

---
id: structured-logging-v1
name: Structured Logging & Observability
category: architecture
type: pattern
scope: universal
version: 1.0.0
last_updated: 2024-03-07
author: framework
difficulty: Medium
status: active
stacks: [fastapi, express, django, flutter]
universal: true
effectiveness: 0.95
usage_count: 0
tags: [logging, observability, monitoring, tracing, json]
---

# SKILL: Structured Logging & Observability

## Problem

Debugging production issues is hard because:
- Logs are plain text and hard to parse
- No correlation between related requests
- No structured context (user_id, trace_id, etc.)
- Logs scattered across files with different formats
- Can't trace requests across service boundaries

## Solution Overview

Structured logging with:
- JSON format for machine parsing
- Correlation IDs for request tracing
- Log levels (DEBUG, INFO, WARN, ERROR)
- Context injection (user, request, trace)
- Centralized aggregation (ELK, CloudWatch, etc.)

## Implementation

### Files to Create

| File | Purpose | Stack |
|------|---------|-------|
| `logging/config.py` | Logger configuration | python |
| `logging/context.py` | Context propagation | all |
| `logging/middleware.py` | Request logging middleware | all |
| `logging/formatters.py` | JSON formatters | all |

### Code Patterns

#### Stack: FastAPI

**Logger Configuration** (`logging/config.py`):
```python
import logging
import json
from datetime import datetime
from typing import Any, Dict

class JSONFormatter(logging.Formatter):
    """Output logs as JSON for structured parsing"""
    
    def format(self, record: logging.LogRecord) -> str:
        log_data = {
            "timestamp": datetime.utcnow().isoformat(),
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
            "module": record.module,
            "function": record.funcName,
            "line": record.lineno,
        }
        
        # Add extra fields if present
        if hasattr(record, "context"):
            log_data["context"] = record.context
        if hasattr(record, "trace_id"):
            log_data["trace_id"] = record.trace_id
        if hasattr(record, "user_id"):
            log_data["user_id"] = record.user_id
        
        # Add exception info if present
        if record.exc_info:
            log_data["exception"] = self.formatException(record.exc_info)
        
        return json.dumps(log_data)

def setup_logging(level: str = "INFO"):
    """Configure structured logging for the application"""
    
    # Remove default handlers
    root = logging.getLogger()
    root.handlers = []
    
    # JSON handler for production
    json_handler = logging.StreamHandler()
    json_handler.setFormatter(JSONFormatter())
    json_handler.setLevel(getattr(logging, level))
    
    # Configure root logger
    root.addHandler(json_handler)
    root.setLevel(getattr(logging, level))
    
    # Set specific loggers
    logging.getLogger("uvicorn.access").setLevel(logging.WARNING)
    logging.getLogger("sqlalchemy.engine").setLevel(logging.WARNING)

# Usage in main.py
setup_logging()
logger = logging.getLogger(__name__)
```

**Context Management** (`logging/context.py`):
```python
from contextvars import ContextVar
from typing import Optional
import uuid

# Context variables (thread-safe, async-safe)
trace_id: ContextVar[str] = ContextVar("trace_id", default="")
user_id: ContextVar[Optional[str]] = ContextVar("user_id", default=None)
request_id: ContextVar[str] = ContextVar("request_id", default="")

def set_context(trace: Optional[str] = None, user: Optional[str] = None):
    """Set logging context for current execution"""
    trace_id.set(trace or generate_trace_id())
    if user:
        user_id.set(user)

def generate_trace_id() -> str:
    """Generate unique trace ID"""
    return str(uuid.uuid4())[:8]

def get_logger(name: str):
    """Get logger with context injection"""
    logger = logging.getLogger(name)
    
    # Create adapter that adds context
    class ContextAdapter(logging.LoggerAdapter):
        def process(self, msg, kwargs):
            extra = kwargs.get("extra", {})
            extra["trace_id"] = trace_id.get()
            extra["user_id"] = user_id.get()
            extra["request_id"] = request_id.get()
            kwargs["extra"] = extra
            return msg, kwargs
    
    return ContextAdapter(logger, {})

# Usage
logger = get_logger(__name__)

# In request handler:
set_context(trace="abc123", user="user456")
logger.info("Processing payment")  # Includes trace_id and user_id automatically
```

**Request Logging Middleware** (`logging/middleware.py`):
```python
import time
from fastapi import Request
import logging

logger = logging.getLogger(__name__)

async def logging_middleware(request: Request, call_next):
    """Log all requests with timing and context"""
    
    start_time = time.time()
    
    # Set context from request
    trace = request.headers.get("X-Trace-ID") or generate_trace_id()
    user = getattr(request.state, "user_id", None)
    set_context(trace=trace, user=user)
    
    # Log request
    logger.info(
        "Request started",
        extra={
            "method": request.method,
            "path": request.url.path,
            "query": str(request.query_params),
            "client_ip": request.client.host if request.client else None
        }
    )
    
    # Process request
    try:
        response = await call_next(request)
        duration = time.time() - start_time
        
        # Log success
        logger.info(
            "Request completed",
            extra={
                "status_code": response.status_code,
                "duration_ms": round(duration * 1000, 2)
            }
        )
        
        # Add trace ID to response
        response.headers["X-Trace-ID"] = trace
        return response
        
    except Exception as e:
        duration = time.time() - start_time
        
        # Log error
        logger.error(
            "Request failed",
            extra={
                "error_type": type(e).__name__,
                "error_message": str(e),
                "duration_ms": round(duration * 1000, 2)
            },
            exc_info=True
        )
        raise

# Add to FastAPI app
app.add_middleware(BaseHTTPMiddleware, dispatch=logging_middleware)
```

## Key Principles

1. **Structured Format**: JSON for machine parsing, not human reading

2. **Context Propagation**: trace_id across all services

3. **Log Levels**: DEBUG (dev only), INFO (normal), WARN (attention), ERROR (action needed)

4. **Correlation**: Link related logs with trace_id

5. **Sensitive Data**: Never log passwords, tokens, PII

## Integration

- **Error Handling**: error-handling-v1 logs exceptions with context
- **API Layer**: api-design-v1 includes trace IDs in responses
- **Caching**: caching-strategy-v1 logs hit/miss metrics
- **Monitoring**: Metrics pipeline aggregates structured logs

## Common Mistakes

| Mistake | Why It's Wrong | Correct Approach |
|---------|---------------|------------------|
| Plain text logs | Hard to parse | JSON structure |
| No timestamps | Can't trace timing | ISO8601 timestamps |
| Logging PII | Security breach | Redact sensitive fields |
| printf-style formatting | Inefficient | Structured context |
| No correlation IDs | Can't trace requests | Propagate trace_id |

## Validation Checklist

- [ ] JSON format for all logs
- [ ] Correlation IDs on all requests
- [ ] Structured context (user_id, trace_id)
- [ ] Log levels appropriate (no DEBUG in prod)
- [ ] Sensitive data redacted
- [ ] Centralized aggregation configured
- [ ] Request/response timing logged
- [ ] Error logs include stack traces

## References

- [12 Factor App: Logs](https://12factor.net/logs)
- [OpenTelemetry Logging](https://opentelemetry.io/docs/concepts/signals/logs/)

## Success Metrics

- **Parse Rate**: 100% of logs machine-readable
- **Trace Coverage**: 100% of requests have trace_id
- **Query Speed**: <1s to find specific request
- **Alert Latency**: <30s from error to alert

---
id: error-handling-v1
name: Error Handling Patterns
category: architecture
type: pattern
scope: service
version: 1.0.0
last_updated: 2024-03-07
author: framework
difficulty: Medium
status: active
stacks: [fastapi, express, django, flutter]
universal: true
effectiveness: 0.95
usage_count: 0
tags: [error-handling, exceptions, logging, monitoring, resilience]
---

# SKILL: Error Handling Patterns

## Problem

Applications crash or produce poor user experience because:
- Errors bubble up unhandled to the user
- Stack traces leak to production clients
- No differentiation between user errors and system errors
- Retry logic missing for transient failures
- Error context is lost across service boundaries

## Solution Overview

Hierarchical error handling with:
- Custom exception hierarchy (domain vs infrastructure errors)
- Global exception handlers (catch-all safety net)
- Error classification (user/system/transient)
- Structured logging with correlation IDs
- Circuit breaker for cascading failures

## Implementation

### Files to Create

| File | Purpose | Stack |
|------|---------|-------|
| `exceptions/base.py` | Base exception hierarchy | all |
| `exceptions/domain.py` | Domain-specific errors | all |
| `exceptions/handlers.py` | Global error handlers | fastapi |
| `middleware/error_logging.py` | Error logging middleware | all |
| `utils/retry.py` | Retry logic with backoff | all |

### Code Patterns

#### Stack: FastAPI

**Exception Hierarchy** (`exceptions/base.py`):
```python
from typing import Optional, Dict, Any

class AppException(Exception):
    """Base application exception with structured data"""
    
    def __init__(
        self,
        message: str,
        code: str,
        status_code: int = 500,
        details: Optional[Dict[str, Any]] = None,
        retryable: bool = False
    ):
        super().__init__(message)
        self.message = message
        self.code = code
        self.status_code = status_code
        self.details = details or {}
        self.retryable = retryable
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            "error": {
                "code": self.code,
                "message": self.message,
                "details": self.details,
                "retryable": self.retryable
            }
        }

# Domain Errors (user's fault)
class ValidationError(AppException):
    def __init__(self, field: str, message: str):
        super().__init__(
            message=message,
            code="VALIDATION_ERROR",
            status_code=400,
            details={"field": field}
        )

class NotFoundError(AppException):
    def __init__(self, resource: str, id: str):
        super().__init__(
            message=f"{resource} with id '{id}' not found",
            code="NOT_FOUND",
            status_code=404,
            details={"resource": resource, "id": id}
        )

class ConflictError(AppException):
    def __init__(self, resource: str, reason: str):
        super().__init__(
            message=f"{resource} conflict: {reason}",
            code="CONFLICT",
            status_code=409
        )

# Infrastructure Errors (system's fault)
class DatabaseError(AppException):
    def __init__(self, operation: str, original_error: Exception):
        super().__init__(
            message=f"Database error during {operation}",
            code="DATABASE_ERROR",
            status_code=500,
            details={"operation": operation, "original": str(original_error)},
            retryable=True  # Transient DB errors can be retried
        )

class ExternalServiceError(AppException):
    def __init__(self, service: str, status_code: int):
        retryable = status_code >= 500 or status_code == 429
        super().__init__(
            message=f"External service '{service}' failed",
            code="EXTERNAL_SERVICE_ERROR",
            status_code=502,
            details={"service": service, "upstream_status": status_code},
            retryable=retryable
        )

class RateLimitError(AppException):
    def __init__(self, limit: int, window: int):
        super().__init__(
            message=f"Rate limit exceeded: {limit} requests per {window}s",
            code="RATE_LIMIT_EXCEEDED",
            status_code=429,
            retryable=True
        )
```

**Global Exception Handler** (`exceptions/handlers.py`):
```python
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
import logging
import traceback

logger = logging.getLogger(__name__)

def setup_exception_handlers(app: FastAPI):
    
    @app.exception_handler(AppException)
    async def handle_app_exception(request: Request, exc: AppException):
        # Log with context
        logger.error(
            f"Application error: {exc.code}",
            extra={
                "code": exc.code,
                "path": request.url.path,
                "method": request.method,
                "details": exc.details,
                "retryable": exc.retryable
            }
        )
        
        # Return structured response (no stack trace to client)
        return JSONResponse(
            status_code=exc.status_code,
            content=exc.to_dict()
        )
    
    @app.exception_handler(Exception)
    async def handle_generic_exception(request: Request, exc: Exception):
        # Log full details internally
        logger.exception("Unhandled exception occurred")
        
        # Return generic error to client (don't leak internals)
        return JSONResponse(
            status_code=500,
            content={
                "error": {
                    "code": "INTERNAL_ERROR",
                    "message": "An unexpected error occurred",
                    "retryable": False
                }
            }
        )
```

**Retry Logic** (`utils/retry.py`):
```python
import time
import random
from typing import Callable, TypeVar, Tuple
from functools import wraps

T = TypeVar('T')

class RetryConfig:
    def __init__(
        self,
        max_attempts: int = 3,
        base_delay: float = 1.0,
        max_delay: float = 60.0,
        exponential_base: float = 2.0,
        retryable_exceptions: Tuple[type, ...] = (Exception,)
    ):
        self.max_attempts = max_attempts
        self.base_delay = base_delay
        self.max_delay = max_delay
        self.exponential_base = exponential_base
        self.retryable_exceptions = retryable_exceptions

def with_retry(config: RetryConfig = None):
    if config is None:
        config = RetryConfig()
    
    def decorator(func: Callable[..., T]) -> Callable[..., T]:
        @wraps(func)
        def wrapper(*args, **kwargs) -> T:
            last_exception = None
            
            for attempt in range(1, config.max_attempts + 1):
                try:
                    return func(*args, **kwargs)
                except Exception as e:
                    last_exception = e
                    
                    # Check if exception is retryable
                    if not isinstance(e, config.retryable_exceptions):
                        raise
                    
                    # Check if specific error says it's retryable
                    if hasattr(e, 'retryable') and not e.retryable:
                        raise
                    
                    if attempt == config.max_attempts:
                        break
                    
                    # Calculate backoff with jitter
                    delay = min(
                        config.base_delay * (config.exponential_base ** (attempt - 1)),
                        config.max_delay
                    )
                    jitter = random.uniform(0, delay * 0.1)
                    time.sleep(delay + jitter)
            
            raise last_exception
        
        return wrapper
    return decorator

# Usage
@with_retry(RetryConfig(
    max_attempts=3,
    retryable_exceptions=(DatabaseError, ExternalServiceError)
))
def fetch_external_data(service_url: str) -> dict:
    # This will retry on DatabaseError or ExternalServiceError
    pass
```

#### Stack: Flutter

**Exception Handling** (`core/exceptions.dart`):
```dart
abstract class AppException implements Exception {
  final String code;
  final String message;
  final Map<String, dynamic>? details;
  final bool retryable;

  AppException({
    required this.code,
    required this.message,
    this.details,
    this.retryable = false,
  });

  @override
  String toString() => '$code: $message';
}

// Network errors
class NetworkException extends AppException {
  final int? statusCode;

  NetworkException({
    required String message,
    this.statusCode,
    bool retryable = true,
  }) : super(
    code: 'NETWORK_ERROR',
    message: message,
    retryable: retryable,
    details: statusCode != null ? {'statusCode': statusCode} : null,
  );
}

class TimeoutException extends AppException {
  TimeoutException({required int seconds})
    : super(
      code: 'TIMEOUT',
      message: 'Request timed out after $seconds seconds',
      retryable: true,
      details: {'timeoutSeconds': seconds},
    );
}

// User errors
class ValidationException extends AppException {
  final String field;

  ValidationException({
    required this.field,
    required String message,
  }) : super(
    code: 'VALIDATION_ERROR',
    message: message,
    details: {'field': field},
  );
}

// Global error handler
class ErrorHandler {
  static void handle(Object error, StackTrace stackTrace) {
    if (error is AppException) {
      // Log with structured data
      _logStructured(error, stackTrace);
      
      // Show user-friendly message
      if (error.retryable) {
        _showRetryableError(error);
      } else {
        _showPermanentError(error);
      }
    } else {
      // Unknown error - log and show generic message
      _logUnexpected(error, stackTrace);
      _showGenericError();
    }
  }

  static void _logStructured(AppException error, StackTrace stackTrace) {
    // Send to error tracking service with context
    print('ERROR [${error.code}]: ${error.message}');
    print('Details: ${error.details}');
    print('Stack: $stackTrace');
  }
}
```

## Key Principles

1. **Error Hierarchy**: Domain (user's fault) vs Infrastructure (system's fault)

2. **Error Classification**: Mark errors as `retryable` for transient failures

3. **Context Preservation**: Include correlation IDs across service calls

4. **Fail Fast**: Validate early, fail with clear messages

5. **Graceful Degradation**: Circuit breaker prevents cascade failures

## Integration

- **API Layer**: api-design-v1 converts exceptions to HTTP responses
- **Logging**: structured-logging-v1 captures error context
- **Monitoring**: health-check-v1 tracks error rates
- **User Experience**: error-ui-v1 shows friendly messages

## Common Mistakes

| Mistake | Why It's Wrong | Correct Approach |
|---------|---------------|------------------|
| `raise Exception("Failed")` | No context, no classification | Custom exception with code and details |
| Showing stack traces to users | Security leak | Generic message, detailed logs |
| No retry on transient errors | Unnecessary failures | Mark retryable=True, use exponential backoff |
| Catching all exceptions silently | Hidden bugs | Log all errors, handle specifically |

## Validation Checklist

- [ ] Custom exception hierarchy defined
- [ ] Global handler catches unhandled exceptions
- [ ] No stack traces in API responses
- [ ] Retry logic for transient failures
- [ ] Structured logging with error codes
- [ ] User-friendly error messages
- [ ] Error correlation IDs across services
- [ ] Circuit breaker for external calls

## References

- [Google Error Model](https://cloud.google.com/apis/design/errors)
- [AWS Well-Architected: Reliability](https://docs.aws.amazon.com/wellarchitected/latest/reliability-pillar/welcome.html)

## Success Metrics

- **Error Clarity**: All errors have classification codes
- **System Stability**: <0.1% unhandled exceptions in production
- **User Experience**: 100% of errors show actionable messages
- **Recovery**: 80% of transient failures succeed on retry

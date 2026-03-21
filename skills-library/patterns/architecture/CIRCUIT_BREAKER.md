---
id: circuit-breaker-v1
name: Circuit Breaker (Resilience4j)
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
tags: [circuit-breaker, resilience, microservices, architecture, observability, monitoring]
---

# SKILL: Circuit Breaker (Resilience4j)

## Problem

Distributed systems need resilience against:
- Service failures and cascading failures
- Network partitions and latency issues
- Resource exhaustion and memory leaks
- Configuration changes and deployments
- Third-party service dependencies

Without circuit breakers:
- Single point of failure can bring down entire system
- No graceful degradation
- Poor user experience during outages
- Difficult to debug distributed systems
- No automatic recovery mechanisms

## Solution Overview

Implement circuit breaker pattern with:
- **Circuit Breaker Pattern**: Wrap service calls with circuit breaker logic
- **Fallback Mechanism**: Graceful degradation when circuits are open
- **State Management**: Track circuit states and health
- **Configuration**: Dynamic circuit breaker settings
- **Monitoring**: Real-time circuit health metrics
- **Recovery**: Automatic recovery attempts

This enables systems to:
- **Fail Fast**: Quickly fail when services are unhealthy
- **Degrace Gracefully**: Provide limited functionality during outages
- **Recover Automatically**: Resume normal operation when services recover
- **Prevent Cascading**: Stop cascading failures

## Implementation

### Files to Create

| File | Purpose | Layer | Stack |
|------|---------|-------|-------|
| `middleware/circuit_breaker.js` | Circuit breaker middleware | middleware | nodejs |
| `middleware/circuit_breaker.py` | Circuit breaker middleware | middleware | python |
| `middleware/circuit_breaker.go` | Circuit breaker middleware | middleware | go |
| `config/circuit_breaker_config.js` | Circuit breaker configuration | config | nodejs |
| `config/circuit_breaker_config.py` | Circuit breaker configuration | config | python |
| `config/circuit_breaker_config.go` | Circuit breaker configuration | config | go |
| `services/circuit_breaker_service.js` | Circuit breaker service | service | nodejs |
| `services/circuit_breaker_service.py` | Circuit breaker service | service | python |
| `services/circuit_breaker_service.go` | Circuit breaker service | service | go |
| `patterns/circuit_breaker_pattern.js` | Circuit breaker patterns | patterns | nodejs |

### Code Patterns

#### Stack: Node.js + Resilience4j

```javascript
// middleware/circuit_breaker.js
const CircuitBreaker = require('./patterns/circuit_breaker_pattern');

class CircuitBreakerMiddleware {
  constructor(options = {}) {
    this.options = {
      ...default options
      failureThreshold: 0.5,
      timeout: 30000,
      resetTimeout: 60000,
      recoveryTimeout: 30000,
      monitoringEnabled: true,
      fallbackEnabled: true,
      trackMetrics: true
    };
    
    this.circuitBreaker = new CircuitBreaker(this.options);
  }

  async executeCircuitCall(circuitKey, operation, fallbackFn = null) {
    const startTime = Date.now();
    
    // Create circuit
    const circuit = this.circuitBreaker.execute(circuitKey);
    
    try {
      // Execute operation with timeout
      const result = await Promise.race([
        operation(),
        new Promise((resolve) => setTimeout(() => {
          return fallbackFn ? fallbackFn() : operation()
        }, this.options.timeout)
      ]);
      
      // Record metrics
      if (this.options.trackMetrics) {
        const duration = Date.now() - startTime;
        this.circuitBreaker.recordSuccess(circuitKey, duration);
      }
      
      return result;
    } catch (error) {
      // Record failure
      this.circuitBreaker.recordFailure(circuitKey, error, startTime);
      
      // Execute fallback if available
      if (fallbackFn && this.options.fallbackEnabled) {
        try {
          const fallbackResult = await fallbackFn();
          this.circuitBreaker.recordSuccess(circuitKey, Date.now() - startTime);
          return fallbackResult;
        } catch (fallbackError) {
          this.circuitBreaker.recordFailure(circuitKey, fallbackError, Date.now() - startTime);
          throw fallbackError;
        }
      }
    }
  }
}

// Export the middleware
module.exports = CircuitBreakerMiddleware;

// patterns/circuit_breaker_pattern.js
const CircuitBreaker = require('./config/circuit_breaker_config');

class CircuitBreaker {
  static create(serviceName, options = {}) {
    const config = CircuitBreakerConfig.getConfig(serviceName);
    
    return new CircuitBreaker(serviceName, {
      failureThreshold: options.failureThreshold || 0.5,
      timeout: options.timeout || 30000,
      resetTimeout: options.resetTimeout || 60000,
      recoveryTimeout: options.recoveryTimeout || 30000,
      monitoringEnabled: options.monitoringEnabled || true,
      fallbackEnabled: options.fallbackEnabled || true,
      trackMetrics: options.trackMetrics || true,
      stateStore: new Map(),
      metrics: {
        total: 0,
        success: 0,
        failure: 0,
        timeout: 0,
        circuitBreakerEvents: []
      }
    });
  }

  static getState(circuitKey) {
    return {
      state: 'CLOSED',
      lastFailureTime: null
      lastSuccessTime: null,
      requestCount: 0,
      successCount: 0,
      failureCount: 0
    };
  }

  static recordSuccess(circuitKey, duration) {
    const state = CircuitBreaker.getState(circuitKey);
    const metrics = CircuitBreaker.getMetrics();
    
    metrics.success++;
    metrics.total++;
    
    state.lastSuccessTime = new Date();
    state.requestCount++;
    state.successCount++;
    
    console.log(`Circuit ${circuitKey} succeeded in ${duration}ms`);
  }

  static recordFailure(circuitKey, error, startTime) {
    const state = CircuitBreaker.getState(circuitKey);
    const metrics = CircuitBreaker.getMetrics();
    
    metrics.failure++;
    metrics.total++;
    
    state.lastFailureTime = new Date();
    state.requestCount++;
    state.failureCount++;
    
    console.error(`Circuit ${circuitKey} failed: ${error.message} in ${Date.now() - startTime}ms}`);
  }

  static recordTimeout(circuitKey, timeout) {
    const state = CircuitBreaker.getState(circuitKey);
    const metrics = CircuitBreaker.getMetrics();
    
    metrics.timeout++;
    metrics.total++;
    
    state.lastTimeoutTime = new Date();
    state.requestCount++;
    state.timeoutCount++;
    
    console.warn(`Circuit ${circuitKey} timed out after ${timeout}ms}`);
  }

  static recordFallback(circuitKey) {
    const state = CircuitBreaker.getState(circuitKey);
    const metrics = CircuitBreaker.getMetrics();
    
    metrics.fallbackCount++;
    metrics.total++;
    
    state.lastFallbackTime = new Date();
    state.requestCount++;
    state.fallbackCount++;
    
    console.log(`Circuit ${circuitKey} executed fallback`);
  }

  static reset(circuitKey) {
    const state = CircuitBreaker.getState(circuitKey);
    
    // Reset circuit state
    state.state = 'CLOSED';
    state.lastFailureTime = null;
    state.lastSuccessTime = null;
    state.requestCount = 0;
    state.successCount = 0;
    state.failureCount = 0;
    state.timeoutCount = 0;
    state.fallbackCount = 0;
    
    metrics.total = 0;
    
    console.log(`Circuit ${circuitKey} reset`);
  }
  }

  static getMetrics() {
    return this.metrics;
  }
}

// Export the pattern
module.exports = CircuitBreaker;
```

#### Stack: Python + Resilience4j

```python
# middleware/circuit_breaker.py
from datetime import datetime, timedelta
from typing import Dict, Any, Callable, Optional
import time

class CircuitBreaker:
    def __init__(self, options: Dict[str, Any] = None):
        self.options = {
            'failureThreshold': options.get('failureThreshold', 0.5),
            'timeout': options.get('timeout', 30000),
            'resetTimeout': options.get('resetTimeout', 60000),
            'recoveryTimeout': options.get('recoveryTimeout', 30000),
            'monitoringEnabled': options.get('monitoringEnabled', True),
            'fallbackEnabled': options.get('fallbackEnabled', True),
            'trackMetrics': options.get('trackMetrics', True),
            'stateStore': {},
            'metrics': {
                'total': 0,
                'success': 0,
                'failure': 0,
                'timeout': 0,
                'circuitBreakerEvents': []
            }
        }
        
        self.stateStore = {}
        self.metrics = {
            'total': 0,
            'success': 0,
            'failure': 0,
            'timeout': 0,
            'circuitBreakerEvents': []
        }
    
        self.circuitStates = {}
    
    def create_circuit(self, service_name: str) -> 'CircuitBreaker':
        return CircuitBreaker(
            service_name=service_name,
            failure_threshold=self.options['failureThreshold'],
            timeout=self.options['timeout'],
            reset_timeout=self.options['resetTimeout'],
            recovery_timeout=self.options['recoveryTimeout'],
            monitoring_enabled=self.options['monitoringEnabled'],
            fallback_enabled=self.options['fallbackEnabled'],
            track_metrics=self.options['trackMetrics'],
            state_store=self.stateStore,
            metrics=self.metrics
        )
    
    def get_circuit(self, circuit_key: str) -> 'CircuitBreaker':
        return self.circuitStates.get(circuit_key, 'CLOSED');
    
    def record_success(self, circuit_key: str, duration: timedelta):
        state = self.get_circuit(circuit_key)
        
        # Update state
        state.last_success_time = datetime.utcnow()
        state.request_count += 1
        state.success_count += 1
        self.metrics.success += 1
        
        # Update metrics
        self.metrics.total += 1
        
        # Log success
        print(f"Circuit {circuit_key} succeeded in {duration.total_seconds}s");
    
    def record_failure(self, circuit_key: str, error: Exception, start_time: datetime):
        state = self.get_circuit(circuit_key)
        
        # Update state
        state.last_failure_time = datetime.utcnow()
        state.request_count += 1
        state.failure_count += 1
        self.metrics.failure += 1
        
        # Log failure
        print(f"Circuit {circuit_key} failed: {error}")
    
    def record_timeout(self, circuit_key: str, timeout: timedelta):
        state = self.get_circuit(circuit_key)
        
        # Update state
        state.last_timeout_time = datetime.utcnow()
        state.timeout_count += 1
        self.metrics.timeout += 1
        
        # Log timeout
        print(f"Circuit {circuit_key} timed out after {timeout.total_seconds}s");
    
    def record_fallback(self, circuit_key: str):
        state = self.get_circuit(circuit_key)
        
        # Update state
        state.last_fallback_time = datetime.utcnow()
        state.fallback_count += 1
        self.metrics.fallback_count += 1
        
        # Log fallback
        print(f"Circuit {circuit_key} executed fallback");
    
    def reset(self, circuit_key: str):
        state = self.get_circuit(circuit_key)
        
        # Reset circuit state
        state.state = 'CLOSED';
        state.last_failure_time = null;
        state.last_success_time = null;
        state.request_count = 0;
        state.success_count = 0;
        state.failure_count = 0;
        state.timeout_count = 0;
        state.fallback_count = 0;
        
        # Reset metrics
        self.metrics.total = 0;
        self.metrics.success = 0;
        self.metrics.failure = 0;
        self.metrics.timeout = 0;
        
        # Clear state store
        self.stateStore.clear();
        
        print(f"Circuit {circuit_key} reset");
    
    def get_state(self, circuit_key: str) -> Dict[str, Any]:
        if circuit_key not in self.circuitStates:
            return {
                'state': 'CLOSED',
                'last_failure_time': None,
                'last_success_time': None,
                'request_count': 0,
                'success_count': 0,
                'failure_count': 0,
                'timeout_count': 0,
                'fallback_count': 0
            }
        
        return self.circuitStates.get(circuit_key, {});
    }
    
    def get_metrics() -> Dict[str, Any]:
        return self.metrics;
    }
}

# services/circuit_breaker_service.py
from datetime import datetime, timedelta
from typing import Dict, Any, Optional
from .middleware.circuit_breaker import CircuitBreaker
from .models import CircuitBreaker as CircuitBreakerModel
from django.db import transaction
from django.core.cache import cache

class CircuitBreakerService:
    def __init__(self):
        self.circuit_breaker = CircuitBreaker(
            failure_threshold=0.5,
            timeout=30000,
            reset_timeout=60000,
            recovery_timeout=30000,
            monitoring_enabled=True,
            fallback_enabled=True,
            track_metrics=True
        )
    
    async def execute_with_circuit_breaker(self, service_name: str, operation: Callable, fallback: Callable = None) -> Any):
        circuit = self.circuit_breaker.create_circuit(service_name)
        
        start_time = datetime.utcnow()
        
        try:
            result = await circuit.execute(operation)
            
            # Record success
            self.record_success(circuit.id, result.duration)
            return result
        except Exception as e:
            # Record failure
            self.record_failure(circuit.id, e, start_time)
            
            # Execute fallback if available
            if fallback and callable:
                try:
                    fallback_result = await fallback()
                    self.record_fallback(circuit.id)
                    return fallback_result
                except Exception as fallback_error:
                    self.record_failure(circuit.id, fallback_error, start_time)
                    throw fallback_error
        finally:
            # Always close circuit
            circuit.close()
        
    async def get_circuit_health(self, circuit_id: str) -> Dict[str, Any]:
        state = self.circuit_breaker.get_state(circuit_id)
        metrics = self.circuit_breaker.get_metrics()
        
        return {
            'circuit_key': circuit_id,
            'state': state['state'],
            'last_failure_time': state['last_failure_time'],
            'last_success_time': state['last_success_time'],
            'request_count': state['request_count'],
            'success_count': state['success_count'],
            'failure_count': state['failure_count'],
            'timeout_count': state['timeout_count'],
            'fallback_count': state['fallback_count'],
            'total_requests': metrics['total'],
            'success_rate': metrics['success_rate'],
            'failure_rate': metrics['failure_rate'],
            'last_error': state['last_failure_time'],
            'up_time': state['last_success_time'],
            'down_time': state['last_success_time']
        }
    }
```

## Configuration Examples

### Environment Variables

```bash
# .env
CIRCUIT_BREAKER_FAILURE_THRESHOLD=0.5
CIRCUIT_BREAKER_TIMEOUT=30000
CIRCUIT_BREAKER_RESET_TIMEOUT=60000
CIRCUIT_BREAKER_RECOVERY_TIMEOUT=30000
CIRCUIT_BREAKER_MONITORING_ENABLED=true
CIRCUIT_BREAKER_FALLBACK_ENABLED=true
CIRCUIT_BREAKER_TRACK_METRICS=true
```

### Docker Configuration

```yaml
version: '3.8'
services:
  api:
    build: .
    environment:
      - CIRCUIT_BREAKER_FAILURE_THRESHOLD=0.5
      - CIRCUIT_BREAKER_TIMEOUT=30000
      - CIRCUIT_BREAKER_RESET_TIMEOUT=60000
      - CIRCUIT_BREAKER_RECOVERY_TIMEOUT=30000
      - CIRCUIT_BREAKER_MONITORING_ENABLED=true
      - CIRCUIT_BREAKER_FALLBACK_ENABLED=true
      - CIRCUIT_BREAKER_TRACK_METRICS=true
```

## Success Metrics

- [ ] Circuit breaker isolates failures effectively
- [ ] Systems degrade gracefully instead of crashing
- [ ] Automatic recovery works correctly
- [ ] Performance impact is minimal
- [ ] Comprehensive monitoring and alerting

## Troubleshooting

### Common Issues

1. **Configuration Issues**
   - Thresholds too low (too sensitive) → false positives
   - Timeouts too short (too aggressive) → timeouts before fallback
   - Monitoring disabled → no visibility into circuit health

2. **Implementation Issues**
   - Not wrapping service calls correctly
   - Missing fallback mechanisms
   - State not managed properly
   - Metrics not being tracked

3. **Performance Issues**
   - Circuit breaker adds too much overhead
   - Synchronous blocking affects performance
   - No batching for independent calls
   - State persistence issues on restart

4. **Recovery Issues**
   - Recovery attempts not working
   - Fallback not configured properly
   - Manual intervention required

### Debug Commands

```bash
# Test circuit breaker
curl -H "x-circuit-id: user-service" http://localhost:3000/api/users

# Check circuit health
curl http://localhost:3000/circuit-breaker/health

# Force circuit open
curl -X POST "http://localhost:3000/circuit-breaker/force-open/user-service

# Check metrics
curl http://localhost:3000/circuit-breaker/metrics
```

## Best Practices

### Circuit Design

1. **Granular Breakers**: Create circuit breakers per service dependency
2. **Fallback Strategy**: Implement multiple fallback options
3. **Timeout Management**: Use exponential backoff with jitter
4. **State Management**: Persist state across restarts
5. **Configuration**: Make circuit breaker configurable per service
6. **Monitoring**: Comprehensive health and performance metrics

### Security

1. **Access Control**: Implement rate limiting at circuit breaker level
2. **Data Sanitization**: Validate all fallback responses
3. **Authentication**: Secure fallback mechanisms
4. **Audit Logging**: Log all circuit breaker events

## Performance

1. **Async Operations**: Use non-blocking patterns
2. **Batch Processing**: Group independent operations
3. **Connection Pooling**: Reuse connections efficiently
4. **Caching**: Cache frequently accessed data
5. **Sampling**: Use intelligent sampling for high-frequency calls

---
id: rate-limiting-v1
name: Rate Limiting & Throttling
category: architecture
type: pattern
scope: service
version: 1.0.0
last_updated: 2024-03-07
author: framework
difficulty: Medium
status: active
stacks: [fastapi, express, django, go]
universal: false
effectiveness: 0.95
usage_count: 0
tags: [rate-limiting, throttling, redis, api-protection, token-bucket]
---

# SKILL: Rate Limiting & Throttling

## Problem

APIs fail under load because:
- No protection against abuse or DDoS
- Expensive endpoints called too frequently
- No differentiation between users/tiers
- Rate limits not communicated to clients
- Hard to adjust limits without redeploy

## Solution Overview

Token bucket rate limiting with:
- Per-user and per-endpoint limits
- Redis-backed distributed counters
- Sliding window for smooth limiting
- Tiered limits (free/premium/enterprise)
- Client-friendly headers (Retry-After)

## Implementation

### Files to Create

| File | Purpose | Stack |
|------|---------|-------|
| `rate_limit/limiter.py` | Rate limit logic | all |
| `rate_limit/storage.py` | Redis counter storage | all |
| `rate_limit/middleware.py` | HTTP middleware | all |
| `rate_limit/tiers.py` | Tier configuration | all |
| `config/rate_limits.yaml` | Limit definitions | all |

### Code Patterns

#### Stack: FastAPI + Redis

**Token Bucket Limiter** (`rate_limit/limiter.py`):
```python
import time
from typing import Optional, Tuple
from dataclasses import dataclass
import redis

@dataclass
class RateLimitResult:
    allowed: bool
    remaining: int
    reset_time: int
    retry_after: Optional[int] = None

class TokenBucketLimiter:
    """
    Token bucket rate limiter with sliding window
    
    Algorithm:
    - Bucket has capacity tokens
    - Tokens refill at rate per second
    - Request consumes 1 token
    - If no tokens, request rejected
    """
    
    def __init__(
        self,
        redis_client: redis.Redis,
        key_prefix: str = "ratelimit",
        default_capacity: int = 100,
        default_refill_rate: float = 1.0  # tokens per second
    ):
        self.redis = redis_client
        self.key_prefix = key_prefix
        self.default_capacity = default_capacity
        self.default_refill_rate = default_refill_rate
    
    def is_allowed(
        self,
        key: str,
        capacity: Optional[int] = None,
        refill_rate: Optional[float] = None
    ) -> RateLimitResult:
        """
        Check if request is allowed
        
        Args:
            key: Unique identifier (user_id, IP, API key)
            capacity: Bucket size (max burst)
            refill_rate: Tokens per second
        """
        capacity = capacity or self.default_capacity
        refill_rate = refill_rate or self.default_refill_rate
        
        redis_key = f"{self.key_prefix}:{key}"
        now = time.time()
        
        # Lua script for atomic operation
        lua_script = """
        local key = KEYS[1]
        local capacity = tonumber(ARGV[1])
        local refill_rate = tonumber(ARGV[2])
        local now = tonumber(ARGV[3])
        
        local bucket = redis.call('HMGET', key, 'tokens', 'last_refill')
        local tokens = tonumber(bucket[1]) or capacity
        local last_refill = tonumber(bucket[2]) or now
        
        -- Calculate tokens to add
        local delta = now - last_refill
        local new_tokens = math.min(capacity, tokens + (delta * refill_rate))
        
        -- Check if request allowed
        local allowed = new_tokens >= 1
        if allowed then
            new_tokens = new_tokens - 1
        end
        
        -- Update bucket
        redis.call('HMSET', key, 'tokens', new_tokens, 'last_refill', now)
        redis.call('EXPIRE', key, math.ceil(capacity / refill_rate) + 1)
        
        -- Calculate reset time
        local tokens_needed = capacity - new_tokens
        local reset_after = tokens_needed / refill_rate
        
        return {allowed and 1 or 0, math.floor(new_tokens), math.floor(now + reset_after)}
        """
        
        result = self.redis.eval(
            lua_script,
            1,  # Number of keys
            redis_key,
            capacity,
            refill_rate,
            now
        )
        
        allowed = result[0] == 1
        remaining = result[1]
        reset_time = result[2]
        
        retry_after = None
        if not allowed:
            # Calculate when next token available
            retry_after = int(1 / refill_rate) + 1
        
        return RateLimitResult(
            allowed=allowed,
            remaining=remaining,
            reset_time=reset_time,
            retry_after=retry_after
        )
    
    def reset(self, key: str):
        """Reset limit for a key (e.g., after payment upgrade)"""
        redis_key = f"{self.key_prefix}:{key}"
        self.redis.delete(redis_key)
```

**Middleware Integration** (`rate_limit/middleware.py`):
```python
from fastapi import Request, HTTPException
from starlette.middleware.base import BaseHTTPMiddleware
from rate_limit.limiter import TokenBucketLimiter, RateLimitResult
from rate_limit.tiers import get_user_tier_limits
import redis

class RateLimitMiddleware(BaseHTTPMiddleware):
    def __init__(self, app, redis_url: str = "redis://localhost:6379"):
        super().__init__(app)
        self.redis = redis.Redis.from_url(redis_url)
        self.limiter = TokenBucketLimiter(self.redis)
    
    async def dispatch(self, request: Request, call_next):
        # Build rate limit key
        key = self._get_limit_key(request)
        
        # Get tier limits for user
        user_tier = self._get_user_tier(request)
        limits = get_user_tier_limits(user_tier)
        
        # Check rate limit
        result = self.limiter.is_allowed(
            key,
            capacity=limits['capacity'],
            refill_rate=limits['refill_rate']
        )
        
        if not result.allowed:
            raise HTTPException(
                status_code=429,
                detail="Rate limit exceeded",
                headers={
                    "X-RateLimit-Limit": str(limits['capacity']),
                    "X-RateLimit-Remaining": "0",
                    "X-RateLimit-Reset": str(result.reset_time),
                    "Retry-After": str(result.retry_after)
                }
            )
        
        # Process request
        response = await call_next(request)
        
        # Add rate limit headers to response
        response.headers["X-RateLimit-Limit"] = str(limits['capacity'])
        response.headers["X-RateLimit-Remaining"] = str(result.remaining)
        response.headers["X-RateLimit-Reset"] = str(result.reset_time)
        
        return response
    
    def _get_limit_key(self, request: Request) -> str:
        """Build unique key for rate limiting"""
        # Try API key first
        api_key = request.headers.get("X-API-Key")
        if api_key:
            return f"apikey:{api_key}"
        
        # Fall back to user ID if authenticated
        user_id = getattr(request.state, "user_id", None)
        if user_id:
            return f"user:{user_id}"
        
        # Fall back to IP (with path for per-endpoint limits)
        client_ip = request.client.host if request.client else "unknown"
        return f"ip:{client_ip}:{request.url.path}"
    
    def _get_user_tier(self, request: Request) -> str:
        """Determine user tier for limit selection"""
        # Check for tier in request state (set by auth middleware)
        tier = getattr(request.state, "tier", None)
        if tier:
            return tier
        
        # Check API key tier
        api_key = request.headers.get("X-API-Key")
        if api_key:
            return self._get_api_key_tier(api_key)
        
        return "anonymous"
    
    def _get_api_key_tier(self, api_key: str) -> str:
        """Lookup API key tier from database/cache"""
        # Implementation would check API key registry
        # Simplified: keys starting with 'sk_live_' are premium
        if api_key.startswith("sk_live_"):
            return "premium"
        return "free"
```

**Tier Configuration** (`rate_limit/tiers.py`):
```python
"""
Tier-based rate limits

Tiers:
- anonymous: Unauthenticated users (strictest)
- free: Authenticated free tier
- premium: Paid subscribers
- enterprise: High-volume customers
- internal: Service-to-service (most permissive)
"""

TIER_LIMITS = {
    "anonymous": {
        "capacity": 10,        # 10 requests burst
        "refill_rate": 0.1,    # 6 per minute
        "description": "Unauthenticated users"
    },
    "free": {
        "capacity": 100,       # 100 requests burst
        "refill_rate": 1.0,    # 60 per minute
        "description": "Free tier users"
    },
    "premium": {
        "capacity": 1000,      # 1000 requests burst
        "refill_rate": 10.0,   # 600 per minute
        "description": "Premium subscribers"
    },
    "enterprise": {
        "capacity": 10000,     # 10000 requests burst
        "refill_rate": 100.0,  # 6000 per minute
        "description": "Enterprise customers"
    },
    "internal": {
        "capacity": 100000,    # Very high for microservices
        "refill_rate": 1000.0,
        "description": "Internal services"
    }
}

def get_user_tier_limits(tier: str) -> dict:
    """Get rate limits for a tier"""
    return TIER_LIMITS.get(tier, TIER_LIMITS["anonymous"])

def get_all_tiers() -> dict:
    """Get all tier configurations"""
    return TIER_LIMITS
```

**Endpoint-Specific Limits** (`rate_limit/decorators.py`):
```python
from functools import wraps
from fastapi import Request, HTTPException
from rate_limit.limiter import TokenBucketLimiter
import redis

def rate_limit(
    capacity: int = None,
    refill_rate: float = None,
    per_user: bool = True,
    key_func=None
):
    """
    Decorator for endpoint-specific rate limits
    
    Args:
        capacity: Override default bucket size
        refill_rate: Override default refill rate
        per_user: Use user ID in key (vs global)
        key_func: Custom key generation function
    """
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            # Find request in args
            request = None
            for arg in args:
                if isinstance(arg, Request):
                    request = arg
                    break
            
            if not request:
                raise ValueError("Request not found in arguments")
            
            # Build key
            if key_func:
                key = key_func(request)
            elif per_user:
                user_id = getattr(request.state, "user_id", "anonymous")
                key = f"endpoint:{func.__name__}:user:{user_id}"
            else:
                key = f"endpoint:{func.__name__}:global"
            
            # Check limit
            redis_client = redis.Redis.from_url("redis://localhost:6379")
            limiter = TokenBucketLimiter(redis_client)
            
            result = limiter.is_allowed(key, capacity, refill_rate)
            
            if not result.allowed:
                raise HTTPException(
                    status_code=429,
                    detail="Rate limit exceeded for this endpoint",
                    headers={"Retry-After": str(result.retry_after)}
                )
            
            # Call endpoint
            response = await func(*args, **kwargs)
            
            # Add headers
            if hasattr(response, "headers"):
                response.headers["X-RateLimit-Remaining"] = str(result.remaining)
            
            return response
        
        return wrapper
    return decorator

# Usage example:
# @rate_limit(capacity=5, refill_rate=0.1)  # Very strict limit
# async def expensive_endpoint(request: Request):
#     pass
```

## Key Principles

1. **Token Bucket**: Smooth limiting with burst capacity

2. **Distributed**: Redis-backed for multi-instance apps

3. **Tiered**: Different limits for different user types

4. **Transparent**: Headers tell clients their status

5. **Endpoint-Specific**: Critical endpoints can have stricter limits

## Integration

- **Authentication**: jwt-auth-v1 provides user_id for per-user limits
- **Caching**: caching-strategy-v1 can cache tier lookups
- **Monitoring**: structured-logging-v1 tracks rate limit events
- **API**: api-design-v1 includes rate limit in API contract

## Common Mistakes

| Mistake | Why It's Wrong | Correct Approach |
|---------|---------------|------------------|
| IP-only limiting | Shared IPs blocked unfairly | Per-user/API-key limiting |
| No burst capacity | Legitimate spikes rejected | Token bucket allows bursts |
| Hardcoded limits | Can't adjust without deploy | Configurable tiers |
| No client feedback | Clients can't adapt | Headers with remaining/reset |

## Validation Checklist

- [ ] Redis for distributed counters
- [ ] Lua script for atomic operations
- [ ] Tier configuration (free/premium/enterprise)
- [ ] Per-user and per-endpoint limits
- [ ] Rate limit headers in responses
- [ ] 429 status with Retry-After
- [ ] Excluded paths (health checks)
- [ ] Monitoring/alerting on blocks

## References

- [Token Bucket Algorithm](https://en.wikipedia.org/wiki/Token_bucket)
- [Rate Limiting Best Practices](https://cloud.google.com/architecture/rate-limiting-strategies-techniques)

## Success Metrics

- **Protection**: 0 successful DDoS attacks
- **Fairness**: 99.9% legitimate requests allowed
- **Transparency**: All clients receive rate headers
- **Flexibility**: Limits adjusted without downtime

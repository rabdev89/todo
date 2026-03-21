---
id: caching-strategy-v1
name: Caching Strategy Patterns
category: architecture
type: pattern
scope: service
version: 1.0.0
last_updated: 2024-03-07
author: framework
difficulty: Medium
status: active
stacks: [fastapi, express, django, flutter]
universal: false
effectiveness: 0.90
usage_count: 0
tags: [caching, redis, performance, cache-invalidation, memoization]
---

# SKILL: Caching Strategy Patterns

## Problem

Applications are slow and expensive because:
- Database queries run repeatedly for same data
- API calls made on every request
- Cache invalidation is inconsistent
- No strategy for cache warming or eviction
- Memory leaks from unbounded caching

## Solution Overview

Multi-layer caching with:
- Read-through and write-through patterns
- Cache invalidation strategies (TTL, explicit, event-driven)
- Key naming conventions for cache scoping
- Circuit breaker for cache failures
- Metrics for cache hit/miss rates

## Implementation

### Files to Create

| File | Purpose | Stack |
|------|---------|-------|
| `cache/client.py` | Cache client wrapper | all |
| `cache/decorators.py` | Cache-aside decorators | python |
| `cache/invalidation.py` | Cache invalidation logic | all |
| `cache/key_builder.py` | Cache key generation | all |
| `config/cache.py` | Cache configuration | all |

### Code Patterns

#### Stack: FastAPI + Redis

**Cache Client** (`cache/client.py`):
```python
import redis
import json
import pickle
from typing import Optional, Any
from functools import wraps
import hashlib

class CacheClient:
    def __init__(self, redis_client: redis.Redis, default_ttl: int = 300):
        self.redis = redis_client
        self.default_ttl = default_ttl
        self._metrics = {"hits": 0, "misses": 0}
    
    def get(self, key: str) -> Optional[Any]:
        """Get from cache with metrics tracking"""
        data = self.redis.get(key)
        if data:
            self._metrics["hits"] += 1
            return pickle.loads(data)
        self._metrics["misses"] += 1
        return None
    
    def set(
        self,
        key: str,
        value: Any,
        ttl: Optional[int] = None,
        tags: Optional[list] = None
    ):
        """Store in cache with optional tags for invalidation"""
        data = pickle.dumps(value)
        ttl = ttl or self.default_ttl
        
        # Store value
        self.redis.setex(key, ttl, data)
        
        # Store in tag sets for bulk invalidation
        if tags:
            for tag in tags:
                self.redis.sadd(f"tag:{tag}", key)
    
    def delete(self, key: str):
        """Remove from cache"""
        self.redis.delete(key)
    
    def invalidate_by_tag(self, tag: str):
        """Invalidate all cache entries with tag"""
        keys = self.redis.smembers(f"tag:{tag}")
        if keys:
            self.redis.delete(*keys)
            self.redis.delete(f"tag:{tag}")
    
    def get_metrics(self) -> dict:
        """Return cache hit/miss statistics"""
        total = self._metrics["hits"] + self._metrics["misses"]
        hit_rate = self._metrics["hits"] / total if total > 0 else 0
        return {
            **self._metrics,
            "hit_rate": hit_rate,
            "total_requests": total
        }

# Global cache instance
_cache_client: Optional[CacheClient] = None

def get_cache() -> CacheClient:
    if _cache_client is None:
        redis_client = redis.Redis.from_url(os.getenv("REDIS_URL"))
        _cache_client = CacheClient(redis_client)
    return _cache_client
```

**Cache Decorator** (`cache/decorators.py`):
```python
from functools import wraps
from typing import Callable, Optional
import hashlib
import json

def cached(
    ttl: int = 300,
    key_prefix: str = "",
    tags: Optional[list] = None,
    skip_args: Optional[list] = None
):
    """
    Cache decorator with automatic key generation
    
    Args:
        ttl: Time to live in seconds
        key_prefix: Prefix for cache key
        tags: Tags for bulk invalidation
        skip_args: Argument names to skip in key generation (e.g., 'db', 'request')
    """
    def decorator(func: Callable) -> Callable:
        @wraps(func)
        def wrapper(*args, **kwargs):
            cache = get_cache()
            
            # Build cache key from function name + arguments
            key_parts = [key_prefix or func.__module__, func.__name__]
            
            # Add args (excluding skipped)
            skip = set(skip_args or [])
            for i, arg in enumerate(args):
                arg_name = func.__code__.co_varnames[i] if i < func.__code__.co_argcount else None
                if arg_name not in skip:
                    key_parts.append(str(hash(arg)))
            
            # Add kwargs (excluding skipped)
            for k, v in sorted(kwargs.items()):
                if k not in skip:
                    key_parts.append(f"{k}={hash(v)}")
            
            cache_key = hashlib.md5(":".join(key_parts).encode()).hexdigest()
            
            # Try cache first
            cached_value = cache.get(cache_key)
            if cached_value is not None:
                return cached_value
            
            # Execute and cache
            result = func(*args, **kwargs)
            cache.set(cache_key, result, ttl=ttl, tags=tags)
            return result
        
        # Attach invalidation helper
        wrapper.invalidate = lambda: cache.invalidate_by_tag(key_prefix or func.__name__)
        
        return wrapper
    return decorator

# Usage examples:

@cached(ttl=600, key_prefix="users", tags=["user"])
def get_user_by_id(user_id: str, db: Session):
    """Cached user lookup - db arg is auto-skipped"""
    return db.query(User).filter(User.id == user_id).first()

@cached(ttl=300, key_prefix="posts", tags=["post", "feed"])
def get_recent_posts(limit: int = 20, db: Session):
    """Cached post feed"""
    return db.query(Post).order_by(Post.created_at.desc()).limit(limit).all()
```

**Cache Invalidation** (`cache/invalidation.py`):
```python
from typing import List, Callable
from contextlib import contextmanager

class CacheInvalidator:
    """Manage cache invalidation with multiple strategies"""
    
    def __init__(self, cache_client):
        self.cache = cache_client
        self._invalidation_handlers: List[Callable] = []
    
    def on_event(self, event: str, tags: List[str]):
        """Invalidate cache when events occur"""
        def decorator(handler: Callable):
            self._invalidation_handlers.append((event, tags, handler))
            return handler
        return decorator
    
    def invalidate_on(self, event: str, data: dict):
        """Trigger invalidation for an event"""
        for registered_event, tags, handler in self._invalidation_handlers:
            if registered_event == event:
                if handler(data):  # Handler returns True if invalidation needed
                    for tag in tags:
                        self.cache.invalidate_by_tag(tag)

# Event-driven invalidation
invalidator = CacheInvalidator(get_cache())

@invalidator.on_event("user.updated", tags=["user", "profile"])
def invalidate_user_cache(data):
    return data.get("invalidate_cache", True)

@invalidator.on_event("post.created", tags=["post", "feed", "home"])
def invalidate_feed_cache(data):
    return True  # Always invalidate feed on new post
```

**Service Integration** (`services/user_service.py`):
```python
from cache.decorators import cached
from cache.invalidation import invalidator

class UserService:
    
    @cached(ttl=600, tags=["user"], skip_args=["db"])
    def get_user(self, user_id: str, db: Session):
        return self.repository.get_by_id(db, user_id)
    
    @cached(ttl=300, tags=["user", "user_list"], skip_args=["db"])
    def list_users(self, filters: dict, db: Session):
        return self.repository.list(db, filters)
    
    def update_user(self, user_id: str, data: dict, db: Session):
        # Update database
        user = self.repository.update(db, user_id, data)
        
        # Invalidate cache
        invalidator.invalidate_on("user.updated", {
            "user_id": user_id,
            "invalidate_cache": True
        })
        
        return user
```

## Key Principles

1. **Cache-Aside Pattern**: App manages cache, not database

2. **TTL Strategy**: Short for volatile (30s), long for stable (1h)

3. **Tag-Based Invalidation**: Group related cache entries

4. **Key Naming**: `{prefix}:{hash_of_params}`

5. **Graceful Degradation**: Serve stale if cache unavailable

## Integration

- **API Layer**: api-design-v1 sets cache headers (Cache-Control)
- **Database**: repository-pattern-v1 integrates caching transparently
- **Monitoring**: structured-logging-v1 tracks cache metrics
- **Error Handling**: error-handling-v1 handles cache failures

## Common Mistakes

| Mistake | Why It's Wrong | Correct Approach |
|---------|---------------|------------------|
| No TTL | Memory leaks, stale data | Always set TTL |
| Wrong granularity | Cache too large/small | Cache at entity level |
| No invalidation | Stale data forever | Tag-based invalidation |
| Caching everything | Wastes memory | Only cache expensive queries |
| Cache without fallback | Down = broken app | Serve stale or recompute |

## Validation Checklist

- [ ] Cache has TTL on all entries
- [ ] Keys are properly namespaced
- [ ] Invalidation tags configured
- [ ] Cache metrics tracked
- [ ] Fallback for cache failures
- [ ] Memory limits configured
- [ ] Cache warming for hot data
- [ ] Circuit breaker for cache service

## References

- [Redis Caching Best Practices](https://redis.io/docs/manual/eviction/)
- [Cache Aside Pattern](https://docs.microsoft.com/en-us/azure/architecture/patterns/cache-aside)

## Success Metrics

- **Hit Rate**: >80% for cached endpoints
- **Latency**: Cached queries <10ms
- **Freshness**: <1% stale data served
- **Availability**: 99.9% (with fallback)

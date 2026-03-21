---
id: feature-flags-v1
name: Feature Flags & Toggles
category: architecture
type: pattern
scope: service
version: 1.0.0
last_updated: 2024-03-07
author: framework
difficulty: Medium
status: active
stacks: [fastapi, express, django, flutter, react]
universal: true
effectiveness: 0.90
usage_count: 0
tags: [feature-flags, feature-toggles, launch-darkly, canary, gradual-rollout]
---

# SKILL: Feature Flags & Toggles

## Problem

Deployments are risky because:
- New features deployed all-or-nothing
- Can't test in production with real data
- Rollbacks require redeployment
- No way to target specific users for beta
- Experiments require code changes

## Solution Overview

Feature flags enable:
- Gradual rollout (1% → 10% → 100%)
- User-segment targeting (beta users, internal)
- A/B testing without code changes
- Instant rollback (toggle off)
- Kill switches for emergency disable

## Implementation

### Files to Create

| File | Purpose | Stack |
|------|---------|-------|
| `flags/client.py` | Feature flag client | all |
| `flags/providers.py` | Config/Redis/LaunchDarkly backends | all |
| `flags/middleware.py` | User context injection | all |
| `flags/ui.py` | Admin UI for toggling | all |

### Code Patterns

#### Stack: Python + Redis

**Feature Flag Client** (`flags/client.py`):
```python
from typing import Optional, Dict, Any, List
import redis
import hashlib
from dataclasses import dataclass
from enum import Enum

class RolloutStrategy(Enum):
    ALL = "all"                    # Everyone
    NONE = "none"                  # No one
    PERCENTAGE = "percentage"      # X% of users
    USER_LIST = "user_list"        # Specific users
    ATTRIBUTE = "attribute"        # User attributes (plan, region)

@dataclass
class FeatureFlag:
    key: str
    enabled: bool
    strategy: RolloutStrategy
    percentage: int = 100
    user_ids: List[str] = None
    attributes: Dict[str, Any] = None

class FeatureFlagClient:
    """
    Feature flag evaluation client
    
    Supports:
    - Boolean flags (on/off)
    - Percentage rollout
    - User targeting
    - Attribute-based targeting
    """
    
    def __init__(self, redis_client: redis.Redis = None):
        self.redis = redis_client
        self._local_cache = {}
    
    def is_enabled(
        self,
        flag_key: str,
        user_id: str = None,
        user_attributes: Dict[str, Any] = None
    ) -> bool:
        """
        Check if feature is enabled for user
        
        Args:
            flag_key: Feature flag identifier
            user_id: User identifier for targeted rollout
            user_attributes: User attributes (plan, region, etc.)
        """
        flag = self._get_flag(flag_key)
        
        if not flag:
            return False
        
        if not flag.enabled:
            return False
        
        # Evaluate strategy
        if flag.strategy == RolloutStrategy.ALL:
            return True
        
        if flag.strategy == RolloutStrategy.NONE:
            return False
        
        if flag.strategy == RolloutStrategy.PERCENTAGE:
            return self._percentage_check(user_id, flag.percentage)
        
        if flag.strategy == RolloutStrategy.USER_LIST:
            return user_id in (flag.user_ids or [])
        
        if flag.strategy == RolloutStrategy.ATTRIBUTE:
            return self._attribute_check(user_attributes, flag.attributes)
        
        return False
    
    def _get_flag(self, key: str) -> Optional[FeatureFlag]:
        """Fetch flag from storage"""
        if self.redis:
            data = self.redis.hgetall(f"flag:{key}")
            if data:
                return FeatureFlag(
                    key=key,
                    enabled=data.get(b'enabled') == b'true',
                    strategy=RolloutStrategy(data.get(b'strategy', b'all').decode()),
                    percentage=int(data.get(b'percentage', 100)),
                    user_ids=data.get(b'user_ids', b'').decode().split(',') if data.get(b'user_ids') else None,
                    attributes=None  # Complex, use JSON
                )
        
        # Fallback to local cache
        return self._local_cache.get(key)
    
    def _percentage_check(self, user_id: str, percentage: int) -> bool:
        """Deterministic percentage check based on user_id"""
        if not user_id:
            return False
        
        # Hash user_id to 0-99 number
        hash_val = int(hashlib.md5(user_id.encode()).hexdigest(), 16) % 100
        return hash_val < percentage
    
    def _attribute_check(
        self,
        user_attrs: Dict[str, Any],
        flag_attrs: Dict[str, Any]
    ) -> bool:
        """Check if user attributes match flag criteria"""
        if not user_attrs:
            return False
        
        for key, value in flag_attrs.items():
            if user_attrs.get(key) != value:
                return False
        return True
    
    def set_flag(self, flag: FeatureFlag):
        """Create or update feature flag"""
        if self.redis:
            self.redis.hset(f"flag:{flag.key}", mapping={
                'enabled': str(flag.enabled).lower(),
                'strategy': flag.strategy.value,
                'percentage': flag.percentage
            })
        else:
            self._local_cache[flag.key] = flag
    
    def toggle(self, flag_key: str) -> bool:
        """Quick toggle on/off"""
        flag = self._get_flag(flag_key)
        if flag:
            flag.enabled = not flag.enabled
            self.set_flag(flag)
        return flag.enabled if flag else False

# Global client
_flags_client: Optional[FeatureFlagClient] = None

def get_flags() -> FeatureFlagClient:
    global _flags_client
    if _flags_client is None:
        _flags_client = FeatureFlagClient()
    return _flags_client

def is_enabled(flag_key: str, user_id: str = None, **attributes) -> bool:
    """Convenience function"""
    return get_flags().is_enabled(flag_key, user_id, attributes)
```

**Usage in Code**:
```python
from flags.client import is_enabled

# Basic boolean flag
if is_enabled("new-dashboard"):
    return new_dashboard()
else:
    return old_dashboard()

# Percentage rollout
if is_enabled("beta-feature", user_id=current_user.id):
    show_beta_feature()

# Attribute-based (plan, region, etc.)
if is_enabled(
    "premium-feature",
    user_id=current_user.id,
    plan=current_user.plan,
    region=current_user.region
):
    show_premium()
```

## Key Principles

1. **Default Off**: New features disabled by default

2. **User-Consistent**: Same user always sees same experience

3. **Non-Blocking**: Flags default safely if system down

4. **Kill Switch**: Critical features can be instantly disabled

5. **Gradual Rollout**: Start with 1%, monitor, increase

## Integration

- **A/B Testing**: Track metrics per flag variation
- **Monitoring**: Alert on flag performance changes
- **Analytics**: Log flag impressions for analysis

## Validation Checklist

- [ ] Flags stored in fast storage (Redis)
- [ ] User-consistent hashing for percentage
- [ ] Kill switch for emergencies
- [ ] Admin UI for non-devs to toggle
- [ ] Analytics on flag usage
- [ ] Cleanup of old flags

## Success Metrics

- **Safety**: 100% instant rollback capability
- **Speed**: Feature toggled in <30 seconds
- **Reliability**: Zero downtime from flag changes

---
id: api-design-v1
name: API Design Patterns
category: api
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
tags: [api, rest, design, versioning, pagination, http]
---

# SKILL: API Design Patterns

## Problem

APIs become inconsistent and hard to maintain when:
- Endpoint naming conventions vary across the codebase
- Response formats differ between endpoints
- Versioning strategy is unclear
- Pagination is implemented differently per endpoint
- Error responses are inconsistent

## Solution Overview

Standardized REST API patterns that ensure:
- Consistent endpoint naming (nouns, plural, hierarchical)
- Uniform response envelope (data, meta, errors)
- Clear versioning strategy (URL or header-based)
- Standardized pagination (cursor or offset)
- Consistent error format (RFC 7807 Problem Details)

## Implementation

### Files to Create

| File | Purpose | Stack |
|------|---------|-------|
| `api/responses.py` | Response envelope classes | fastapi |
| `api/pagination.py` | Pagination helpers | fastapi |
| `api/errors.py` | Error response handlers | fastapi |
| `api/versioning.py` | Version routing logic | fastapi |
| `middleware/error_handler.py` | Global error middleware | all |

### Code Patterns

#### Stack: FastAPI

**Response Envelope** (`api/responses.py`):
```python
from typing import Generic, TypeVar, Optional
from pydantic import BaseModel

T = TypeVar('T')

class ApiResponse(BaseModel, Generic[T]):
    data: T
    meta: Optional[dict] = None
    errors: Optional[list] = None
    
    @classmethod
    def success(cls, data: T, meta: Optional[dict] = None):
        return cls(data=data, meta=meta, errors=None)
    
    @classmethod
    def error(cls, errors: list, meta: Optional[dict] = None):
        return cls(data=None, meta=meta, errors=errors)

class PaginatedResponse(ApiResponse):
    pagination: dict
    
    @classmethod
    def with_pagination(cls, data: T, page: int, per_page: int, total: int):
        return cls(
            data=data,
            pagination={
                "page": page,
                "per_page": per_page,
                "total": total,
                "total_pages": (total + per_page - 1) // per_page
            }
        )
```

**Pagination** (`api/pagination.py`):
```python
from fastapi import Query
from typing import Optional

def get_pagination_params(
    page: int = Query(1, ge=1, description="Page number"),
    per_page: int = Query(20, ge=1, le=100, description="Items per page")
):
    return {"page": page, "per_page": per_page}

def paginate_query(query, page: int, per_page: int):
    offset = (page - 1) * per_page
    total = query.count()
    items = query.offset(offset).limit(per_page).all()
    return items, total
```

**Error Handling** (`api/errors.py`):
```python
from fastapi import HTTPException
from pydantic import BaseModel
from typing import Optional, Any

class ProblemDetail(BaseModel):
    type: str
    title: str
    status: int
    detail: str
    instance: Optional[str] = None
    extensions: Optional[dict[str, Any]] = None

class APIError(HTTPException):
    def __init__(
        self,
        status_code: int,
        title: str,
        detail: str,
        error_type: Optional[str] = None,
        extensions: Optional[dict] = None
    ):
        problem = ProblemDetail(
            type=error_type or f"/errors/{status_code}",
            title=title,
            status=status_code,
            detail=detail,
            extensions=extensions
        )
        super().__init__(status_code=status_code, detail=problem.dict())

class NotFoundError(APIError):
    def __init__(self, resource: str, resource_id: str):
        super().__init__(
            status_code=404,
            title="Resource Not Found",
            detail=f"{resource} with id '{resource_id}' was not found",
            error_type="/errors/not-found"
        )

class ValidationError(APIError):
    def __init__(self, field: str, message: str):
        super().__init__(
            status_code=422,
            title="Validation Error",
            detail=f"Field '{field}': {message}",
            error_type="/errors/validation",
            extensions={"field": field}
        )
```

**Version Routing** (`api/versioning.py`):
```python
from fastapi import APIRouter, Header, HTTPException
from typing import Optional

def create_versioned_router(major_version: int = 1):
    router = APIRouter(prefix=f"/v{major_version}")
    
    @router.api_route("/{path:path}", methods=["GET", "POST", "PUT", "DELETE"])
    async def version_check(
        path: str,
        x_api_version: Optional[str] = Header(None)
    ):
        # Check header version matches URL version
        if x_api_version and int(x_api_version.split('.')[0]) != major_version:
            raise HTTPException(400, "API version mismatch")
        
    return router

# Usage in main app
v1_router = create_versioned_router(1)

@v1_router.get("/users")
async def list_users():
    return {"users": []}
```

### Stack: Express (Node.js)

**Response Middleware** (`middleware/response.js`):
```javascript
// Standard response envelope
const standardResponse = (data, meta = null) => ({
    data,
    meta,
    errors: null,
    timestamp: new Date().toISOString()
});

const errorResponse = (errors, meta = null) => ({
    data: null,
    meta,
    errors: Array.isArray(errors) ? errors : [errors],
    timestamp: new Date().toISOString()
});

module.exports = { standardResponse, errorResponse };
```

## Key Principles

1. **RESTful Naming**: Use nouns (users, not getUser), plural (users, not user), hierarchical (/users/{id}/orders)

2. **Consistent Envelope**: Every response has `data`, `meta`, `errors` fields

3. **Version in URL**: `/v1/users` is clearest for API consumers

4. **Standard Pagination**: page + per_page with total count in meta

5. **RFC 7807 Errors**: type, title, status, detail, instance structure

## Variations

### GraphQL Alternative
- Single `/graphql` endpoint
- Queries for read, mutations for write
- No versioning needed (schema evolution)

### gRPC Alternative
- Protobuf definitions in `.proto` files
- Version in package name (`v1.users`)
- Bi-directional streaming for real-time

## Integration

- **Authentication**: jwt-auth-v1 skill applies before API layer
- **Rate Limiting**: Add rate-limit-v1 skill for throttling
- **Caching**: cache-strategy-v1 for GET endpoints
- **Logging**: structured-logging-v1 for request/response logging

## Common Mistakes

| Mistake | Why It's Wrong | Correct Approach |
|---------|---------------|------------------|
| `GET /getUsers` | Verb in URL | `GET /users` |
| `POST /users/create` | Verb + action | `POST /users` |
| `200` with error message | Wrong status code | `4xx` for client errors |
| Different error formats | Inconsistent API | RFC 7807 everywhere |
| No pagination on lists | Unbounded responses | Always paginate collections |

## Validation Checklist

- [ ] All endpoints use noun-based paths
- [ ] All responses follow envelope format
- [ ] Error responses follow RFC 7807
- [ ] Pagination on all list endpoints
- [ ] Version prefix in URL (/v1/)
- [ ] Consistent HTTP status codes
- [ ] Content-Type: application/json
- [ ] CORS configured for web clients

## References

- [RFC 7807 - Problem Details](https://tools.ietf.org/html/rfc7807)
- [REST API Design Best Practices](https://restfulapi.net/)
- [Microsoft API Guidelines](https://github.com/microsoft/api-guidelines)

## Success Metrics

- **Consistency**: 100% of endpoints follow naming conventions
- **Error Clarity**: All errors include type, title, detail
- **Performance**: Paginated endpoints return <100ms for first page
- **Developer Experience**: New endpoints can be created in <5 minutes using patterns

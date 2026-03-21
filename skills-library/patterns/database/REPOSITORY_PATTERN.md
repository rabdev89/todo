# SKILL: Repository Pattern with SQLAlchemy

## Metadata
- **Category**: database
- **Scope**: model
- **Difficulty**: Medium
- **Last Updated**: 2024-03-07
- **Effectiveness**: High

## Problem
How to abstract database operations, enable testing without a real database, and centralize data access logic in a clean, maintainable way.

## Solution Overview
Create repository classes that encapsulate all database queries. Each entity has its own repository with standard CRUD operations. Services use repositories, not direct DB calls.

## Implementation

### Files to Create

| File | Purpose | Layer |
|------|---------|-------|
| `app/repositories/base_repo.py` | Abstract base repository | model |
| `app/repositories/user_repo.py` | User-specific repository | model |
| `app/repositories/__init__.py` | Repository exports | model |

### Code Pattern

#### Base Repository
```python
# app/repositories/base_repo.py
from typing import TypeVar, Generic, Type, List, Optional, Any
from sqlalchemy.orm import Session
from sqlalchemy import select, desc, asc

ModelType = TypeVar('ModelType')

class BaseRepository(Generic[ModelType]):
    """Base repository with common CRUD operations."""
    
    def __init__(self, db: Session, model: Type[ModelType]):
        self.db = db
        self.model = model
    
    def get_by_id(self, id: Any) -> Optional[ModelType]:
        """Get single record by ID."""
        return self.db.get(self.model, id)
    
    def get_by_ids(self, ids: List[Any]) -> List[ModelType]:
        """Get multiple records by IDs."""
        return self.db.query(self.model).filter(self.model.id.in_(ids)).all()
    
    def get_all(
        self,
        skip: int = 0,
        limit: int = 100,
        order_by: str = "id",
        descending: bool = False
    ) -> List[ModelType]:
        """Get all records with pagination."""
        query = select(self.model)
        
        # Ordering
        order_column = getattr(self.model, order_by, self.model.id)
        if descending:
            query = query.order_by(desc(order_column))
        else:
            query = query.order_by(asc(order_column))
        
        # Pagination
        query = query.offset(skip).limit(limit)
        
        return self.db.execute(query).scalars().all()
    
    def find_by(self, **kwargs) -> List[ModelType]:
        """Find records by arbitrary filters."""
        query = select(self.model)
        
        for key, value in kwargs.items():
            if hasattr(self.model, key):
                column = getattr(self.model, key)
                query = query.where(column == value)
        
        return self.db.execute(query).scalars().all()
    
    def find_one_by(self, **kwargs) -> Optional[ModelType]:
        """Find single record by arbitrary filters."""
        query = select(self.model)
        
        for key, value in kwargs.items():
            if hasattr(self.model, key):
                column = getattr(self.model, key)
                query = query.where(column == value)
        
        return self.db.execute(query).scalar_one_or_none()
    
    def create(self, obj: ModelType) -> ModelType:
        """Create new record."""
        self.db.add(obj)
        self.db.commit()
        self.db.refresh(obj)
        return obj
    
    def create_many(self, objs: List[ModelType]) -> List[ModelType]:
        """Create multiple records."""
        self.db.add_all(objs)
        self.db.commit()
        for obj in objs:
            self.db.refresh(obj)
        return objs
    
    def update(self, obj: ModelType, **updates) -> ModelType:
        """Update record with given fields."""
        for key, value in updates.items():
            if hasattr(obj, key):
                setattr(obj, key, value)
        
        self.db.commit()
        self.db.refresh(obj)
        return obj
    
    def delete(self, obj: ModelType) -> None:
        """Delete record."""
        self.db.delete(obj)
        self.db.commit()
    
    def delete_by_id(self, id: Any) -> bool:
        """Delete record by ID. Returns True if found and deleted."""
        obj = self.get_by_id(id)
        if obj:
            self.delete(obj)
            return True
        return False
    
    def exists(self, **kwargs) -> bool:
        """Check if record exists with given criteria."""
        query = select(self.model)
        
        for key, value in kwargs.items():
            if hasattr(self.model, key):
                column = getattr(self.model, key)
                query = query.where(column == value)
        
        result = self.db.execute(query.limit(1)).first()
        return result is not None
    
    def count(self, **filters) -> int:
        """Count records, optionally filtered."""
        from sqlalchemy import func
        
        query = select(func.count(self.model.id))
        
        for key, value in filters.items():
            if hasattr(self.model, key):
                column = getattr(self.model, key)
                query = query.where(column == value)
        
        return self.db.execute(query).scalar() or 0
```

#### Entity-Specific Repository
```python
# app/repositories/user_repo.py
from typing import Optional, List
from sqlalchemy.orm import Session
from sqlalchemy import select, or_

from app.repositories.base_repo import BaseRepository
from app.models.user import User

class UserRepository(BaseRepository[User]):
    """User-specific repository with custom queries."""
    
    def __init__(self, db: Session):
        super().__init__(db, User)
    
    def get_by_email(self, email: str) -> Optional[User]:
        """Get user by email address."""
        return self.find_one_by(email=email)
    
    def get_active_users(self, skip: int = 0, limit: int = 100) -> List[User]:
        """Get only active users."""
        query = select(User).where(User.is_active == True)
        query = query.offset(skip).limit(limit)
        return self.db.execute(query).scalars().all()
    
    def search_users(self, query: str) -> List[User]:
        """Search users by name or email."""
        search = f"%{query}%"
        stmt = select(User).where(
            or_(
                User.full_name.ilike(search),
                User.email.ilike(search)
            )
        )
        return self.db.execute(stmt).scalars().all()
    
    def get_user_with_relations(self, user_id: int) -> Optional[User]:
        """Get user with related data loaded."""
        from sqlalchemy.orm import joinedload
        
        query = (
            select(User)
            .where(User.id == user_id)
            .options(
                joinedload(User.roles),
                joinedload(User.profile)
            )
        )
        return self.db.execute(query).scalar_one_or_none()
    
    def email_exists(self, email: str) -> bool:
        """Check if email is already taken."""
        return self.exists(email=email)
    
    def get_user_count_by_status(self) -> dict:
        """Get count of users grouped by active status."""
        from sqlalchemy import func
        
        query = (
            select(User.is_active, func.count(User.id))
            .group_by(User.is_active)
        )
        results = self.db.execute(query).all()
        return {"active": 0, "inactive": 0} | {
            "active" if is_active else "inactive": count
            for is_active, count in results
        }
```

#### Repository Exports
```python
# app/repositories/__init__.py
from app.repositories.base_repo import BaseRepository
from app.repositories.user_repo import UserRepository

__all__ = ["BaseRepository", "UserRepository"]
```

#### Using in Service Layer
```python
# app/services/user_service.py
from sqlalchemy.orm import Session
from app.repositories.user_repo import UserRepository
from app.schemas.user_schema import UserCreate, UserUpdate

class UserService:
    def __init__(self, db: Session):
        self.repo = UserRepository(db)
    
    def create_user(self, user_data: UserCreate):
        # Business logic: check email uniqueness
        if self.repo.email_exists(user_data.email):
            raise ValueError("Email already registered")
        
        # Create user
        user = User(**user_data.model_dump())
        return self.repo.create(user)
    
    def search(self, query: str):
        return self.repo.search_users(query)
    
    def get_stats(self):
        return self.repo.get_user_count_by_status()
```

### Key Principles

1. **One Repository Per Entity**
   - UserRepository for users
   - OrderRepository for orders
   - Each extends BaseRepository

2. **No Business Logic in Repositories**
   - Only data access
   - Simple CRUD operations
   - Business rules go in services

3. **Type Safety**
   - Generic BaseRepository
   - Type hints throughout
   - IDE autocomplete support

4. **Testability**
   - Easy to mock repositories
   - Repository interface is simple
   - In-memory implementations for tests

## Integration

### With Other Skills

- **FastAPI Structure**: Repositories used by services
- **Testing**: Mock repositories in unit tests
- **Database Migrations**: Models used by repositories

## Common Mistakes

- **Business logic in repos**: Keep repos simple
- **No base repository**: Duplicated CRUD code
- **Not using generics**: Lost type safety
- **Raw SQL in services**: Should be in repository

## Validation Checklist

- [ ] Base repository has all CRUD operations
- [ ] Type hints with generics
- [ ] Entity repos extend base
- [ ] Custom queries in entity repos
- [ ] No business logic in repos
- [ ] All methods tested

## References

- [SQLAlchemy ORM](https://docs.sqlalchemy.org/en/20/orm/)
- [Repository Pattern](https://martinfowler.com/eaaCatalog/repository.html)

## Success Metrics

- **Code Reuse**: 80%+ of DB operations use base methods
- **Testability**: Services testable with mocked repos
- **Maintainability**: Changes to DB layer isolated

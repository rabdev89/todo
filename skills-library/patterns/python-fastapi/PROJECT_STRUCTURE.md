# SKILL: FastAPI Project Structure

## Metadata
- **Category**: python-fastapi
- **Scope**: service
- **Difficulty**: Medium
- **Last Updated**: 2024-03-07
- **Effectiveness**: High

## Problem
How to structure a FastAPI project that scales from small to large applications with clear separation of concerns, proper dependency injection, and maintainable organization.

## Solution Overview
Use a layered architecture with clear separation: routers → services → repositories → models. Include dependency injection for cross-cutting concerns like authentication and database sessions.

## Implementation

### Project Structure

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py                 # App entry point
│   ├── config.py               # Settings management
│   ├── dependencies.py         # DI container
│   ├── routers/                # API routes
│   │   ├── __init__.py
│   │   ├── auth.py
│   │   ├── users.py
│   │   └── items.py
│   ├── services/               # Business logic
│   │   ├── __init__.py
│   │   ├── auth_service.py
│   │   ├── user_service.py
│   │   └── item_service.py
│   ├── repositories/           # Data access
│   │   ├── __init__.py
│   │   ├── user_repo.py
│   │   └── item_repo.py
│   ├── models/                 # Pydantic + ORM models
│   │   ├── __init__.py
│   │   ├── user.py
│   │   └── item.py
│   ├── schemas/                # Pydantic schemas
│   │   ├── __init__.py
│   │   ├── user_schema.py
│   │   └── item_schema.py
│   └── utils/                  # Utilities
│       ├── __init__.py
│       └── security.py
├── tests/                      # Test suite
├── alembic/                    # Migrations
├── requirements.txt
└── Dockerfile
```

### Code Pattern

#### Main Application
```python
# app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import auth, users, items
from app.config import settings

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description=settings.DESCRIPTION,
)

# Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(auth.router, prefix="/auth", tags=["auth"])
app.include_router(users.router, prefix="/users", tags=["users"])
app.include_router(items.router, prefix="/items", tags=["items"])

@app.get("/health")
async def health_check():
    return {"status": "healthy"}
```

#### Configuration
```python
# app/config.py
from pydantic_settings import BaseSettings
from functools import lru_cache

class Settings(BaseSettings):
    PROJECT_NAME: str = "My API"
    VERSION: str = "1.0.0"
    DESCRIPTION: str = "FastAPI application"
    
    # Database
    DATABASE_URL: str = "postgresql://localhost/db"
    
    # Security
    SECRET_KEY: str = "change-in-production"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # CORS
    ALLOWED_ORIGINS: list[str] = ["http://localhost:3000"]
    
    # Environment
    ENV: str = "development"
    DEBUG: bool = True
    
    class Config:
        env_file = ".env"

@lru_cache()
def get_settings() -> Settings:
    return Settings()

settings = get_settings()
```

#### Dependencies (DI)
```python
# app/dependencies.py
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.services.auth_service import AuthService
from app.models.user import User

security = HTTPBearer()

# Database dependency
def get_db() -> Session:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Current user dependency
async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db),
) -> User:
    token = credentials.credentials
    auth_service = AuthService(db)
    user = auth_service.get_user_from_token(token)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
        )
    return user

# Optional current user
async def get_optional_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db),
) -> User | None:
    try:
        return await get_current_user(credentials, db)
    except HTTPException:
        return None
```

#### Router Example
```python
# app/routers/users.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.dependencies import get_db, get_current_user
from app.schemas.user_schema import UserCreate, UserResponse, UserUpdate
from app.services.user_service import UserService
from app.models.user import User

router = APIRouter()

@router.get("/", response_model=List[UserResponse])
async def list_users(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List all users."""
    service = UserService(db)
    return service.get_users(skip=skip, limit=limit)

@router.post("/", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def create_user(
    user_data: UserCreate,
    db: Session = Depends(get_db),
):
    """Create a new user."""
    service = UserService(db)
    return service.create_user(user_data)

@router.get("/me", response_model=UserResponse)
async def get_current_user_info(
    current_user: User = Depends(get_current_user),
):
    """Get current user info."""
    return current_user

@router.get("/{user_id}", response_model=UserResponse)
async def get_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get user by ID."""
    service = UserService(db)
    user = service.get_user(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@router.put("/{user_id}", response_model=UserResponse)
async def update_user(
    user_id: int,
    user_data: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Update user."""
    service = UserService(db)
    user = service.update_user(user_id, user_data)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Delete user."""
    service = UserService(db)
    success = service.delete_user(user_id)
    if not success:
        raise HTTPException(status_code=404, detail="User not found")
```

#### Service Layer
```python
# app/services/user_service.py
from sqlalchemy.orm import Session
from app.repositories.user_repo import UserRepository
from app.schemas.user_schema import UserCreate, UserUpdate
from app.models.user import User
from app.utils.security import get_password_hash

class UserService:
    def __init__(self, db: Session):
        self.db = db
        self.repo = UserRepository(db)
    
    def get_users(self, skip: int = 0, limit: int = 100) -> list[User]:
        return self.repo.get_all(skip=skip, limit=limit)
    
    def get_user(self, user_id: int) -> User | None:
        return self.repo.get_by_id(user_id)
    
    def get_user_by_email(self, email: str) -> User | None:
        return self.repo.get_by_email(email)
    
    def create_user(self, user_data: UserCreate) -> User:
        # Check if email exists
        if self.repo.get_by_email(user_data.email):
            raise ValueError("Email already registered")
        
        # Hash password
        hashed_password = get_password_hash(user_data.password)
        
        # Create user
        user = User(
            email=user_data.email,
            hashed_password=hashed_password,
            full_name=user_data.full_name,
        )
        
        return self.repo.create(user)
    
    def update_user(self, user_id: int, user_data: UserUpdate) -> User | None:
        user = self.repo.get_by_id(user_id)
        if not user:
            return None
        
        update_data = user_data.model_dump(exclude_unset=True)
        
        for field, value in update_data.items():
            setattr(user, field, value)
        
        return self.repo.update(user)
    
    def delete_user(self, user_id: int) -> bool:
        user = self.repo.get_by_id(user_id)
        if not user:
            return False
        
        self.repo.delete(user)
        return True
```

#### Repository Layer
```python
# app/repositories/user_repo.py
from sqlalchemy.orm import Session
from app.models.user import User

class UserRepository:
    def __init__(self, db: Session):
        self.db = db
    
    def get_by_id(self, user_id: int) -> User | None:
        return self.db.query(User).filter(User.id == user_id).first()
    
    def get_by_email(self, email: str) -> User | None:
        return self.db.query(User).filter(User.email == email).first()
    
    def get_all(self, skip: int = 0, limit: int = 100) -> list[User]:
        return self.db.query(User).offset(skip).limit(limit).all()
    
    def create(self, user: User) -> User:
        self.db.add(user)
        self.db.commit()
        self.db.refresh(user)
        return user
    
    def update(self, user: User) -> User:
        self.db.commit()
        self.db.refresh(user)
        return user
    
    def delete(self, user: User) -> None:
        self.db.delete(user)
        self.db.commit()
```

#### Pydantic Schemas
```python
# app/schemas/user_schema.py
from pydantic import BaseModel, EmailStr, ConfigDict
from datetime import datetime

class UserBase(BaseModel):
    email: EmailStr
    full_name: str | None = None
    is_active: bool = True

class UserCreate(UserBase):
    password: str

class UserUpdate(BaseModel):
    email: EmailStr | None = None
    full_name: str | None = None
    is_active: bool | None = None

class UserResponse(UserBase):
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    created_at: datetime
    updated_at: datetime
```

#### SQLAlchemy Model
```python
# app/models/user.py
from sqlalchemy import Column, Integer, String, Boolean, DateTime
from sqlalchemy.sql import func
from app.database import Base

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
```

### Key Principles

1. **Dependency Injection**
   - Use FastAPI's `Depends()` for all dependencies
   - Database sessions injected into services
   - Current user injected into routes

2. **Layer Separation**
   - Routers: Handle HTTP, call services
   - Services: Business logic, orchestrate repositories
   - Repositories: Data access only
   - Models: Data structures

3. **Pydantic Everywhere**
   - Input validation with Pydantic schemas
   - Response serialization
   - Config management

4. **Type Safety**
   - Full type hints
   - Pydantic model validation
   - SQLAlchemy 2.0 style

## Integration

### With Other Skills

- **JWT Auth**: AuthService validates tokens
- **Database**: Repository pattern with SQLAlchemy
- **Testing**: Easy to mock repositories
- **Validation**: Pydantic handles all validation

## Common Mistakes

- **Business logic in routers**: Keep routers thin
- **No service layer**: Always add service layer between router and repo
- **Direct DB queries in routers**: Use repositories
- **Mixing Pydantic and SQLAlchemy**: Keep them separate, convert between

## Validation Checklist

- [ ] Clear layer separation (router → service → repo)
- [ ] Dependency injection for DB and auth
- [ ] Pydantic schemas for all inputs/outputs
- [ ] Error handling with HTTPException
- [ ] Type hints throughout
- [ ] Config management with pydantic-settings
- [ ] CORS configured if needed

## References

- [FastAPI Docs](https://fastapi.tiangolo.com/)
- [SQLAlchemy 2.0](https://docs.sqlalchemy.org/en/20/)

## Success Metrics

- **Implementation Time**: 2-3 hours for structure
- **Maintainability**: Easy to add new features
- **Testability**: Each layer independently testable
- **Type Safety**: 100% type coverage

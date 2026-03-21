---
id: testing-patterns-v1
name: Testing Patterns
category: methodology
type: pattern
scope: universal
version: 1.0.0
last_updated: 2024-03-07
author: framework
difficulty: Medium
status: active
stacks: [fastapi, express, flutter, react]
universal: true
effectiveness: 0.95
usage_count: 0
tags: [testing, tdd, unit-tests, integration-tests, fixtures, mocking]
---

# SKILL: Testing Patterns

## Problem

Testing is inconsistent and ineffective when:
- Tests are written after implementation (retrofitting)
- No clear separation between unit and integration tests
- Test fixtures are scattered and hard to maintain
- Mocking is overused or inconsistent
- No measurement of test coverage
- Flaky tests due to shared state

## Solution Overview

Structured testing approach with:
- Test-driven development workflow
- Clear test pyramid (unit > integration > e2e)
- Fixture factories for test data
- Dependency injection for mocking
- Coverage tracking and gates
- Test isolation patterns

## Implementation

### Files to Create

| File | Purpose | Stack |
|------|---------|-------|
| `tests/conftest.py` | Pytest fixtures and configuration | fastapi |
| `tests/factories.py` | Test data factories | all |
| `tests/unit/` | Unit test directory | all |
| `tests/integration/` | Integration test directory | all |
| `tests/fixtures/` | Shared test fixtures | all |
| `pytest.ini` | Test configuration | python |
| `jest.config.js` | Jest configuration | node |

### Code Patterns

#### Stack: FastAPI + Pytest

**Test Configuration** (`pytest.ini`):
```ini
[pytest]
testpaths = tests
python_files = test_*.py
python_classes = Test*
python_functions = test_*
addopts = 
    -v
    --tb=short
    --strict-markers
    --cov=src
    --cov-report=term-missing
    --cov-fail-under=80
markers =
    unit: Unit tests (fast, isolated)
    integration: Integration tests (slower, with DB)
    slow: Tests that take >1s
```

**Fixture Factories** (`tests/factories.py`):
```python
from factory import Factory, Faker, SubFactory
from factory.alchemy import SQLAlchemyModelFactory
from src.models import User, Post, db_session

class UserFactory(SQLAlchemyModelFactory):
    class Meta:
        model = User
        sqlalchemy_session = db_session
        sqlalchemy_session_persistence = 'commit'
    
    id = Faker('uuid4')
    email = Faker('email')
    name = Faker('name')
    created_at = Faker('date_time')

class PostFactory(SQLAlchemyModelFactory):
    class Meta:
        model = Post
        sqlalchemy_session = db_session
    
    id = Faker('uuid4')
    title = Faker('sentence')
    content = Faker('paragraph')
    author = SubFactory(UserFactory)
    status = 'published'

# Usage in tests
def test_post_creation(db):
    user = UserFactory()  # Auto-committed to test DB
    post = PostFactory(author=user)
    assert post.author_id == user.id
```

**Test Fixtures** (`tests/conftest.py`):
```python
import pytest
from fastapi.testclient import TestClient
from src.main import app
from src.database import db_session, Base, engine

@pytest.fixture(scope='session')
def db_engine():
    """Create test database engine"""
    Base.metadata.create_all(bind=engine)
    yield engine
    Base.metadata.drop_all(bind=engine)

@pytest.fixture
def db(db_engine):
    """Create fresh database session for each test"""
    connection = db_engine.connect()
    transaction = connection.begin()
    session = db_session(bind=connection)
    
    yield session
    
    session.close()
    transaction.rollback()
    connection.close()

@pytest.fixture
def client(db):
    """Test client with database override"""
    def override_get_db():
        yield db
    
    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()

@pytest.fixture
def auth_client(client, db):
    """Authenticated test client"""
    user = UserFactory(email="test@example.com")
    token = create_access_token(user.id)
    client.headers = {"Authorization": f"Bearer {token}"}
    return client
```

**Unit Test Pattern** (`tests/unit/test_user_service.py`):
```python
import pytest
from unittest.mock import Mock, patch
from src.services.user_service import UserService
from src.exceptions import NotFoundError, ValidationError

@pytest.mark.unit
class TestUserService:
    
    def test_create_user_success(self, db):
        # Arrange
        service = UserService(db)
        user_data = {"email": "new@example.com", "name": "Test"}
        
        # Act
        user = service.create(user_data)
        
        # Assert
        assert user.email == "new@example.com"
        assert user.id is not None
    
    def test_create_user_duplicate_email_raises_error(self, db):
        # Arrange
        existing = UserFactory(email="exists@example.com")
        service = UserService(db)
        
        # Act & Assert
        with pytest.raises(ValidationError) as exc:
            service.create({"email": "exists@example.com", "name": "Test"})
        
        assert exc.value.code == "DUPLICATE_EMAIL"
    
    @patch('src.services.email_service.send_welcome_email')
    def test_create_user_sends_welcome_email(self, mock_send, db):
        # Arrange
        service = UserService(db)
        
        # Act
        user = service.create({"email": "test@example.com", "name": "Test"})
        
        # Assert
        mock_send.assert_called_once_with(user.email, user.name)
    
    def test_get_user_not_found_raises_error(self, db):
        # Arrange
        service = UserService(db)
        
        # Act & Assert
        with pytest.raises(NotFoundError) as exc:
            service.get_by_id("non-existent-id")
        
        assert exc.value.status_code == 404
```

**Integration Test Pattern** (`tests/integration/test_auth_api.py`):
```python
import pytest
from tests.factories import UserFactory

@pytest.mark.integration
class TestAuthAPI:
    
    def test_login_success(self, client, db):
        # Arrange
        user = UserFactory(email="test@example.com")
        user.set_password("password123")
        db.commit()
        
        # Act
        response = client.post("/auth/login", json={
            "email": "test@example.com",
            "password": "password123"
        })
        
        # Assert
        assert response.status_code == 200
        assert "access_token" in response.json()
        assert "token_type" in response.json()
    
    def test_login_wrong_password_returns_401(self, client, db):
        # Arrange
        user = UserFactory(email="test@example.com")
        user.set_password("password123")
        db.commit()
        
        # Act
        response = client.post("/auth/login", json={
            "email": "test@example.com",
            "password": "wrongpassword"
        })
        
        # Assert
        assert response.status_code == 401
        assert response.json()["error"]["code"] == "INVALID_CREDENTIALS"
    
    def test_protected_endpoint_without_token_returns_401(self, client):
        # Act
        response = client.get("/users/me")
        
        # Assert
        assert response.status_code == 401
    
    def test_protected_endpoint_with_valid_token(self, auth_client, db):
        # Act
        response = auth_client.get("/users/me")
        
        # Assert
        assert response.status_code == 200
        assert response.json()["email"] == "test@example.com"
```

#### Stack: Flutter

**Widget Test Pattern** (`test/widget/auth_form_test.dart`):
```dart
import 'package:flutter_test/flutter_test.dart';
import 'package:mockito/mockito.dart';
import 'package:provider/provider.dart';

class MockAuthService extends Mock implements AuthService {}

void main() {
  group('LoginForm', () {
    late MockAuthService mockAuthService;
    
    setUp(() {
      mockAuthService = MockAuthService();
    });
    
    testWidgets('validates empty email', (tester) async {
      // Arrange
      await tester.pumpWidget(
        Provider<AuthService>.value(
          value: mockAuthService,
          child: MaterialApp(home: LoginForm()),
        ),
      );
      
      // Act
      await tester.tap(find.byType(ElevatedButton));
      await tester.pump();
      
      // Assert
      expect(find.text('Email is required'), findsOneWidget);
    });
    
    testWidgets('calls login on valid form', (tester) async {
      // Arrange
      when(mockAuthService.login(any, any))
        .thenAnswer((_) async => AuthResult.success());
      
      await tester.pumpWidget(
        Provider<AuthService>.value(
          value: mockAuthService,
          child: MaterialApp(home: LoginForm()),
        ),
      );
      
      // Act
      await tester.enterText(find.byKey(Key('email')), 'test@example.com');
      await tester.enterText(find.byKey(Key('password')), 'password123');
      await tester.tap(find.byType(ElevatedButton));
      await tester.pump();
      
      // Assert
      verify(mockAuthService.login('test@example.com', 'password123')).called(1);
    });
  });
}
```

**Integration Test** (`test/integration/app_flow_test.dart`):
```dart
import 'package:flutter_test/flutter_test.dart';
import 'package:integration_test/integration_test.dart';
import 'package:myapp/main.dart' as app;

void main() {
  IntegrationTestWidgetsFlutterBinding.ensureInitialized();
  
  group('App Flow', () {
    testWidgets('user can login and view dashboard', (tester) async {
      // Arrange
      app.main();
      await tester.pumpAndSettle();
      
      // Act - Login
      await tester.enterText(find.byKey(Key('email')), 'test@example.com');
      await tester.enterText(find.byKey(Key('password')), 'password123');
      await tester.tap(find.byType(ElevatedButton));
      await tester.pumpAndSettle(Duration(seconds: 2));
      
      // Assert - Dashboard visible
      expect(find.text('Dashboard'), findsOneWidget);
    });
  });
}
```

## Key Principles

1. **Test Pyramid**: 70% unit, 20% integration, 10% e2e

2. **Test Isolation**: Each test gets fresh fixtures and DB state

3. **AAA Pattern**: Arrange → Act → Assert in every test

4. **One Concept Per Test**: Test one behavior, have one reason to fail

5. **Descriptive Names**: `test_feature_condition_result` format

## Variations

### TDD Workflow
```
1. Write failing test
2. Write minimal code to pass
3. Refactor
4. Repeat
```

### BDD Style
```python
# Given-When-Then format
def test_user_can_login_with_valid_credentials():
    # Given
    user = create_user(email="test@example.com", password="secret")
    
    # When
    result = login(email="test@example.com", password="secret")
    
    # Then
    assert result.is_success()
    assert result.user.email == "test@example.com"
```

## Integration

- **CI/CD**: test-automation-v1 runs tests on every commit
- **Coverage**: coverage-gate-v1 enforces minimum coverage
- **Fixtures**: factory-pattern-v1 for test data generation
- **Mocking**: dependency-injection-v1 enables test doubles

## Common Mistakes

| Mistake | Why It's Wrong | Correct Approach |
|---------|---------------|------------------|
| No test isolation | Tests depend on order | Fresh fixtures per test |
| Testing implementation | Brittle tests | Test behavior/outputs |
| Over-mocking | Tests don't verify reality | Use real dependencies where possible |
| No assertions | Test always passes | Assert specific outcomes |
| Giant test functions | Hard to debug | One concept per test |

## Validation Checklist

- [ ] Unit tests for business logic
- [ ] Integration tests for API endpoints
- [ ] Fixtures for test data
- [ ] Database isolation per test
- [ ] Mock external services
- [ ] Coverage reporting >80%
- [ ] CI runs all tests
- [ ] No flaky tests (100% reliable)

## References

- [Pytest Documentation](https://docs.pytest.org/)
- [Flutter Testing](https://flutter.dev/docs/testing)
- [Test Pyramid](https://martinfowler.com/bliki/TestPyramid.html)

## Success Metrics

- **Coverage**: 80%+ line coverage
- **Speed**: Unit tests run in <100ms each
- **Reliability**: <1% flaky test rate
- **Maintainability**: Tests updated with code changes

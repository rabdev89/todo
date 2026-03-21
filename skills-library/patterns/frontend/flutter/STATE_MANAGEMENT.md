---
id: flutter-provider-v1
name: Flutter Provider State Management
category: frontend
type: pattern
scope: ui
version: 1.0.0
last_updated: 2024-03-07
author: bob-framework
difficulty: Medium
status: active
stacks: [flutter]
universal: false
effectiveness: 0.95
usage_count: 15
tags: [flutter, state-management, provider, ui, reactive]
---

# SKILL: Flutter Provider State Management

## Problem

How to manage state in Flutter applications that scales from simple to complex without over-engineering. Need predictable state updates, widget rebuild optimization, and clean separation of UI from business logic.

## Solution Overview

Use Flutter's Provider package with ChangeNotifier for reactive state management. Provides simple, scalable pattern that works for most Flutter apps before needing BLoC or Riverpod.

## Implementation

### Files to Create

| File | Purpose | Layer | Stack |
|------|---------|-------|-------|
| `lib/providers/base_provider.dart` | Abstract base with loading/error handling | ui | flutter |
| `lib/providers/auth_provider.dart` | Authentication state | ui | flutter |
| `lib/providers/data_provider.dart` | Data fetching state | ui | flutter |
| `lib/main.dart` | Provider injection | ui | flutter |
| `lib/widgets/consumer_widget.dart` | Example consumption | ui | flutter |

### Dependencies

Add to `pubspec.yaml`:
```yaml
dependencies:
  flutter:
    sdk: flutter
  provider: ^6.1.1
```

### Code Patterns

#### Stack: Flutter

**Base Provider Pattern**
```dart
// lib/providers/base_provider.dart
import 'package:flutter/foundation.dart';

abstract class BaseProvider extends ChangeNotifier {
  bool _isLoading = false;
  String? _error;

  bool get isLoading => _isLoading;
  String? get error => _error;
  bool get hasError => _error != null;

  void setLoading(bool value) {
    _isLoading = value;
    notifyListeners();
  }

  void setError(String? value) {
    _error = value;
    notifyListeners();
  }

  void clearError() {
    _error = null;
    notifyListeners();
  }

  Future<T> handleAsync<T>(Future<T> Function() operation) async {
    setLoading(true);
    clearError();
    try {
      final result = await operation();
      return result;
    } catch (e) {
      setError(e.toString());
      rethrow;
    } finally {
      setLoading(false);
    }
  }
}
```

**Auth Provider Example**
```dart
// lib/providers/auth_provider.dart
import 'package:flutter/foundation.dart';
import '../models/user.dart';
import '../services/auth_service.dart';

class AuthProvider extends ChangeNotifier {
  final AuthService _authService;
  
  User? _user;
  bool _isLoading = false;
  String? _error;

  AuthProvider({required AuthService authService}) : _authService = authService;

  // State getters
  User? get user => _user;
  bool get isLoading => _isLoading;
  String? get error => _error;
  bool get isAuthenticated => _user != null;
  bool get hasError => _error != null;

  // Actions
  Future<void> login(String email, String password) async {
    _setLoading(true);
    _clearError();
    
    try {
      _user = await _authService.login(email, password);
      notifyListeners();
    } catch (e) {
      _setError(e.toString());
    } finally {
      _setLoading(false);
    }
  }

  Future<void> logout() async {
    _setLoading(true);
    
    try {
      await _authService.logout();
      _user = null;
      notifyListeners();
    } catch (e) {
      _setError(e.toString());
    } finally {
      _setLoading(false);
    }
  }

  // Private helpers
  void _setLoading(bool value) {
    _isLoading = value;
    notifyListeners();
  }

  void _setError(String? value) {
    _error = value;
    notifyListeners();
  }

  void _clearError() {
    _error = null;
  }
}
```

**Provider Injection in Main**
```dart
// lib/main.dart
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'providers/auth_provider.dart';
import 'services/auth_service.dart';

void main() {
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        ChangeNotifierProvider(
          create: (_) => AuthProvider(authService: AuthService()),
        ),
      ],
      child: MaterialApp(
        title: 'My App',
        home: Consumer<AuthProvider>(
          builder: (context, auth, _) {
            if (auth.isLoading) {
              return const Scaffold(
                body: Center(child: CircularProgressIndicator()),
              );
            }
            return auth.isAuthenticated ? const HomeScreen() : const LoginScreen();
          },
        ),
      ),
    );
  }
}
```

## Key Principles

1. **One Provider Per Concern**: AuthProvider, UserProfileProvider, SettingsProvider—avoid monolithic providers
2. **Notify Only When Necessary**: Don't call notifyListeners() in getters; batch updates; use Selector for granular rebuilds
3. **Keep UI Dumb**: Widgets display and dispatch; business logic lives in providers; no API calls in widgets
4. **Handle Loading and Error States**: Every async operation needs loading state; errors must be clearable

## Stack Variations

### Flutter

- Use `provider` package (official recommendation)
- For complex apps, consider Riverpod or BLoC
- Use `ChangeNotifierProvider` for mutable state
- Use `Provider` for immutable state

## Integration

- **JWT Auth** (`jwt-auth-v1`): AuthProvider consumes TokenService
- **API Integration** (`api-integration-v1`): Providers use ApiService
- **Form Validation** (`form-validation-v1`): FormProvider for complex form state

## Common Mistakes

- **Calling notifyListeners during build**: Always use addPostFrameCallback
- **Not disposing controllers**: Dispose TextEditingControllers in provider dispose
- **Over-notification**: notifyListeners() in every setter kills performance
- **Business logic in widgets**: Keep UI dumb, logic in providers
- **Not handling dispose**: Cancel streams and timers in dispose()

## Validation Checklist

- [ ] Provider state is immutable from outside (private setters)
- [ ] notifyListeners() called after every state change
- [ ] Loading states handled for all async operations
- [ ] Error states are clearable
- [ ] Widgets use Consumer/Selector, not direct access
- [ ] Providers are tested independently
- [ ] Resources disposed properly (streams, timers)
- [ ] No API calls in widget build methods

## References

- [Provider Package](https://pub.dev/packages/provider)
- [Flutter State Management Docs](https://docs.flutter.dev/data-and-backend/state-mgmt/simple)

## Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.0.0 | 2024-03-07 | Migrated to unified schema | bob-framework |

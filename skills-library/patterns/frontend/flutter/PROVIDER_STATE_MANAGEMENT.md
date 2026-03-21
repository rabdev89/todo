# SKILL: Flutter Provider State Management

## Metadata
- **Category**: flutter
- **Scope**: ui
- **Difficulty**: Medium
- **Last Updated**: 2024-03-07
- **Effectiveness**: High

## Problem
How to manage state in Flutter applications that scales from simple to complex without over-engineering. Need predictable state updates, widget rebuild optimization, and clean separation of UI from business logic.

## Solution Overview
Use Flutter's Provider package with ChangeNotifier for reactive state management. Provides simple, scalable pattern that works for most Flutter apps before needing BLoC or Riverpod.

## Implementation

### Files to Create

| File | Purpose | Layer |
|------|---------|-------|
| `lib/providers/app_state.dart` | Main application state | ui |
| `lib/providers/auth_provider.dart` | Authentication state | ui |
| `lib/providers/data_provider.dart` | Data fetching state | ui |
| `lib/main.dart` | Provider injection | ui |
| `lib/widgets/consumer_widget.dart` | Example consumption | ui |

### Dependencies

Add to `pubspec.yaml`:
```yaml
dependencies:
  flutter:
    sdk: flutter
  provider: ^6.1.1
```

### Code Pattern

#### Base Provider Pattern
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

#### Auth Provider Example
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

  Future<void> checkAuthStatus() async {
    _setLoading(true);
    
    try {
      _user = await _authService.getCurrentUser();
      notifyListeners();
    } catch (e) {
      _user = null;
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

#### Data Provider with List State
```dart
// lib/providers/data_provider.dart
import 'package:flutter/foundation.dart';

class DataProvider<T> extends ChangeNotifier {
  final Future<List<T>> Function() _fetchFunction;
  
  List<T> _items = [];
  bool _isLoading = false;
  String? _error;

  DataProvider({required Future<List<T>> Function() fetch}) 
      : _fetchFunction = fetch;

  List<T> get items => _items;
  bool get isLoading => _isLoading;
  String? get error => _error;
  bool get isEmpty => _items.isEmpty;
  bool get hasData => _items.isNotEmpty;

  Future<void> load() async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      _items = await _fetchFunction();
    } catch (e) {
      _error = e.toString();
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> refresh() => load();

  void clear() {
    _items = [];
    _error = null;
    notifyListeners();
  }
}
```

#### Provider Injection in Main
```dart
// lib/main.dart
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'providers/auth_provider.dart';
import 'providers/data_provider.dart';
import 'services/auth_service.dart';
import 'screens/login_screen.dart';
import 'screens/home_screen.dart';

void main() {
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        // Auth provider
        ChangeNotifierProvider(
          create: (_) => AuthProvider(authService: AuthService()),
        ),
        // Data provider (lazy)
        ChangeNotifierProvider(
          create: (_) => DataProvider(fetch: () async {
            // Initial fetch logic
            return [];
          }),
        ),
      ],
      child: MaterialApp(
        title: 'My App',
        home: Consumer<AuthProvider>(
          builder: (context, auth, _) {
            // Auto-route based on auth state
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

#### Consuming State in Widgets
```dart
// lib/widgets/login_form.dart
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/auth_provider.dart';

class LoginForm extends StatelessWidget {
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();

  LoginForm({super.key});

  @override
  Widget build(BuildContext context) {
    return Consumer<AuthProvider>(
      builder: (context, auth, child) {
        return Column(
          children: [
            TextField(
              controller: _emailController,
              decoration: const InputDecoration(labelText: 'Email'),
              enabled: !auth.isLoading,
            ),
            TextField(
              controller: _passwordController,
              decoration: const InputDecoration(labelText: 'Password'),
              obscureText: true,
              enabled: !auth.isLoading,
            ),
            if (auth.hasError)
              Text(
                auth.error!,
                style: const TextStyle(color: Colors.red),
              ),
            ElevatedButton(
              onPressed: auth.isLoading
                  ? null
                  : () => _handleLogin(context),
              child: auth.isLoading
                  ? const CircularProgressIndicator()
                  : const Text('Login'),
            ),
          ],
        );
      },
    );
  }

  void _handleLogin(BuildContext context) {
    final auth = context.read<AuthProvider>();
    auth.login(
      _emailController.text,
      _passwordController.text,
    );
  }
}
```

#### Selective Rebuilds with Selector
```dart
// Only rebuild when user name changes, not entire user object
Selector<AuthProvider, String>(
  selector: (_, auth) => auth.user?.name ?? '',
  builder: (_, name, __) => Text('Welcome, $name'),
)
```

### Key Principles

1. **One Provider Per Concern**
   - AuthProvider for authentication
   - UserProfileProvider for profile data
   - SettingsProvider for app settings
   - Avoid monolithic providers

2. **Notify Only When Necessary**
   - Don't call notifyListeners() in getters
   - Batch multiple updates when possible
   - Use Selector for granular rebuilds

3. **Keep UI Dumb**
   - Widgets only display and dispatch actions
   - Business logic lives in providers
   - No API calls in widgets

4. **Handle Loading and Error States**
   - Every async operation needs loading state
   - Error state must be clearable
   - UI shows appropriate feedback

## Variations

### Variation A: Multiple Providers
**Use when**: App has many independent state domains
```dart
MultiProvider(
  providers: [
    ChangeNotifierProvider(create: (_) => AuthProvider()),
    ChangeNotifierProvider(create: (_) => CartProvider()),
    ChangeNotifierProvider(create: (_) => ThemeProvider()),
    ChangeNotifierProxyProvider<AuthProvider, DataProvider>(
      create: (_) => DataProvider(),
      update: (_, auth, data) => data!..updateAuth(auth.token),
    ),
  ],
)
```

### Variation B: Proxy Provider for Dependencies
**Use when**: Provider B needs data from Provider A
```dart
ChangeNotifierProxyProvider<AuthProvider, UserDataProvider>(
  create: (_) => UserDataProvider(),
  update: (_, auth, userData) {
    if (auth.isAuthenticated) {
      userData!.loadUserData(auth.user!.id);
    }
    return userData!;
  },
)
```

## Integration

### With Other Skills

- **JWT Auth**: AuthProvider consumes TokenService
- **API Integration**: Providers use ApiService
- **Forms**: FormProvider for complex form state
- **Testing**: Mock providers for widget tests

### Dependencies

- `provider` package
- Service layer for API calls
- Models for type safety

## Examples

### Example 1: Shopping Cart Provider
```dart
class CartProvider extends ChangeNotifier {
  List<CartItem> _items = [];
  
  List<CartItem> get items => _items;
  double get total => _items.fold(0, (sum, item) => sum + item.price);
  int get count => _items.length;

  void addItem(Product product) {
    final existingIndex = _items.indexWhere((i) => i.productId == product.id);
    
    if (existingIndex >= 0) {
      _items[existingIndex].quantity++;
    } else {
      _items.add(CartItem(product: product));
    }
    notifyListeners();
  }

  void removeItem(String productId) {
    _items.removeWhere((i) => i.productId == productId);
    notifyListeners();
  }

  void clear() {
    _items = [];
    notifyListeners();
  }
}
```

### Example 2: Theme Provider
```dart
class ThemeProvider extends ChangeNotifier {
  bool _isDarkMode = false;
  
  bool get isDarkMode => _isDarkMode;
  ThemeMode get themeMode => _isDarkMode ? ThemeMode.dark : ThemeMode.light;

  void toggleTheme() {
    _isDarkMode = !_isDarkMode;
    notifyListeners();
  }

  Future<void> loadSavedTheme() async {
    final prefs = await SharedPreferences.getInstance();
    _isDarkMode = prefs.getBool('darkMode') ?? false;
    notifyListeners();
  }
}
```

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

## Success Metrics

- **Implementation Time**: 1-2 hours for basic setup
- **Widget Rebuilds**: Reduced by 40-60% vs setState
- **Testability**: Providers testable without UI
- **Maintainability**: Clear separation of concerns

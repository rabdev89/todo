# SKILL: Flutter API Integration

## Metadata
- **Category**: flutter
- **Scope**: service
- **Difficulty**: Medium
- **Last Updated**: 2024-03-07
- **Effectiveness**: High

## Problem
How to make HTTP requests from Flutter to a backend API with proper error handling, authentication token management, request/response serialization, and loading state management.

## Solution Overview
Create a centralized ApiService with Dio for advanced features (interceptors, token refresh, retry logic) or http package for simplicity. Include proper error handling, token management, and response parsing.

## Implementation

### Files to Create

| File | Purpose | Layer |
|------|---------|-------|
| `lib/services/api_service.dart` | HTTP client with interceptors | service |
| `lib/services/api_interceptor.dart` | Auth token handling | service |
| `lib/models/api_response.dart` | Standard response wrapper | model |
| `lib/models/api_error.dart` | Error types | model |
| `lib/utils/api_config.dart` | Base URLs and config | utils |

### Dependencies

```yaml
dependencies:
  dio: ^5.4.0
  json_annotation: ^4.8.1

dev_dependencies:
  json_serializable: ^6.7.1
  build_runner: ^2.4.8
```

### Code Pattern

#### API Error Types
```dart
// lib/models/api_error.dart
class ApiException implements Exception {
  final String message;
  final int? statusCode;
  final Map<String, dynamic>? errors;

  ApiException({
    required this.message,
    this.statusCode,
    this.errors,
  });

  @override
  String toString() => 'ApiException: $message (Status: $statusCode)';
}

class NetworkException extends ApiException {
  NetworkException() : super(message: 'No internet connection');
}

class UnauthorizedException extends ApiException {
  UnauthorizedException() : super(message: 'Unauthorized', statusCode: 401);
}
```

#### API Response Wrapper
```dart
// lib/models/api_response.dart
class ApiResponse<T> {
  final T? data;
  final String? error;
  final bool success;
  final int statusCode;

  ApiResponse({
    this.data,
    this.error,
    required this.success,
    required this.statusCode,
  });

  factory ApiResponse.success(T data, {int statusCode = 200}) {
    return ApiResponse(
      data: data,
      success: true,
      statusCode: statusCode,
    );
  }

  factory ApiResponse.error(String message, {int statusCode = 500}) {
    return ApiResponse(
      error: message,
      success: false,
      statusCode: statusCode,
    );
  }
}
```

#### API Service with Dio
```dart
// lib/services/api_service.dart
import 'package:dio/dio.dart';
import '../models/api_response.dart';
import '../models/api_error.dart';
import 'api_interceptor.dart';

class ApiService {
  late Dio _dio;
  String? _authToken;

  ApiService({String? baseUrl}) {
    _dio = Dio(BaseOptions(
      baseUrl: baseUrl ?? 'https://api.example.com',
      connectTimeout: const Duration(seconds: 10),
      receiveTimeout: const Duration(seconds: 15),
      headers: {'Content-Type': 'application/json'},
    ));

    // Add interceptors
    _dio.interceptors.add(AuthInterceptor(onTokenRefresh: _refreshToken));
    _dio.interceptors.add(LogInterceptor(responseBody: true));
  }

  void setAuthToken(String token) {
    _authToken = token;
    _dio.options.headers['Authorization'] = 'Bearer $token';
  }

  void clearAuthToken() {
    _authToken = null;
    _dio.options.headers.remove('Authorization');
  }

  // GET request
  Future<ApiResponse<T>> get<T>(
    String path, {
    Map<String, dynamic>? queryParameters,
    T Function(dynamic)? parser,
  }) async {
    try {
      final response = await _dio.get(
        path,
        queryParameters: queryParameters,
      );
      return _handleResponse(response, parser);
    } on DioException catch (e) {
      return _handleDioError(e);
    }
  }

  // POST request
  Future<ApiResponse<T>> post<T>(
    String path, {
    dynamic data,
    T Function(dynamic)? parser,
  }) async {
    try {
      final response = await _dio.post(path, data: data);
      return _handleResponse(response, parser);
    } on DioException catch (e) {
      return _handleDioError(e);
    }
  }

  // PUT request
  Future<ApiResponse<T>> put<T>(
    String path, {
    dynamic data,
    T Function(dynamic)? parser,
  }) async {
    try {
      final response = await _dio.put(path, data: data);
      return _handleResponse(response, parser);
    } on DioException catch (e) {
      return _handleDioError(e);
    }
  }

  // DELETE request
  Future<ApiResponse<T>> delete<T>(
    String path, {
    T Function(dynamic)? parser,
  }) async {
    try {
      final response = await _dio.delete(path);
      return _handleResponse(response, parser);
    } on DioException catch (e) {
      return _handleDioError(e);
    }
  }

  // Upload file
  Future<ApiResponse<T>> uploadFile<T>(
    String path, {
    required String filePath,
    String fieldName = 'file',
    Map<String, dynamic>? extraData,
    T Function(dynamic)? parser,
  }) async {
    try {
      final formData = FormData.fromMap({
        fieldName: await MultipartFile.fromFile(filePath),
        ...?extraData,
      });

      final response = await _dio.post(path, data: formData);
      return _handleResponse(response, parser);
    } on DioException catch (e) {
      return _handleDioError(e);
    }
  }

  // Handle successful response
  ApiResponse<T> _handleResponse<T>(
    Response response,
    T Function(dynamic)? parser,
  ) {
    if (response.statusCode! >= 200 && response.statusCode! < 300) {
      final data = parser != null ? parser(response.data) : response.data as T;
      return ApiResponse.success(data, statusCode: response.statusCode!);
    } else {
      return ApiResponse.error(
        response.data['message'] ?? 'Request failed',
        statusCode: response.statusCode!,
      );
    }
  }

  // Handle Dio errors
  ApiResponse<T> _handleDioError<T>(DioException e) {
    String message = 'An error occurred';
    int statusCode = 0;

    switch (e.type) {
      case DioExceptionType.connectionTimeout:
      case DioExceptionType.sendTimeout:
      case DioExceptionType.receiveTimeout:
        message = 'Connection timeout';
        break;
      case DioExceptionType.badResponse:
        statusCode = e.response?.statusCode ?? 500;
        message = e.response?.data?['message'] ?? 'Server error';
        break;
      case DioExceptionType.connectionError:
        message = 'No internet connection';
        break;
      default:
        message = e.message ?? 'Unknown error';
    }

    return ApiResponse.error(message, statusCode: statusCode);
  }

  // Token refresh callback
  Future<String?> _refreshToken() async {
    // Implement token refresh logic
    // Return new token or null if refresh failed
    return null;
  }
}
```

#### Auth Interceptor
```dart
// lib/services/api_interceptor.dart
import 'package:dio/dio.dart';

class AuthInterceptor extends Interceptor {
  final Future<String?> Function() onTokenRefresh;

  AuthInterceptor({required this.onTokenRefresh});

  @override
  void onError(DioException err, ErrorInterceptorHandler handler) async {
    if (err.response?.statusCode == 401) {
      // Try to refresh token
      final newToken = await onTokenRefresh();
      
      if (newToken != null) {
        // Retry with new token
        final opts = err.requestOptions;
        opts.headers['Authorization'] = 'Bearer $newToken';
        
        try {
          final response = await Dio().fetch(opts);
          handler.resolve(response);
          return;
        } catch (e) {
          handler.reject(err);
          return;
        }
      }
    }
    handler.next(err);
  }
}
```

#### Using in Providers
```dart
// lib/providers/user_provider.dart
import 'package:flutter/foundation.dart';
import '../services/api_service.dart';
import '../models/user.dart';

class UserProvider extends ChangeNotifier {
  final ApiService _api;
  
  List<User> _users = [];
  bool _isLoading = false;
  String? _error;

  UserProvider({required ApiService api}) : _api = api;

  List<User> get users => _users;
  bool get isLoading => _isLoading;
  String? get error => _error;

  Future<void> loadUsers() async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    final response = await _api.get<List<User>>(
      '/users',
      parser: (data) => (data as List).map((u) => User.fromJson(u)).toList(),
    );

    if (response.success) {
      _users = response.data ?? [];
    } else {
      _error = response.error;
    }

    _isLoading = false;
    notifyListeners();
  }

  Future<bool> createUser(User user) async {
    final response = await _api.post<User>(
      '/users',
      data: user.toJson(),
      parser: (data) => User.fromJson(data),
    );

    if (response.success) {
      _users.add(response.data!);
      notifyListeners();
      return true;
    }
    return false;
  }
}
```

### Key Principles

1. **Centralized HTTP Client**
   - Single ApiService for all HTTP calls
   - Consistent error handling
   - Easy to mock for testing

2. **Response Wrapping**
   - Always wrap in ApiResponse
   - Consistent success/error interface
   - Type-safe with generics

3. **Automatic Token Refresh**
   - Interceptor handles 401s
   - Seamless token refresh
   - Queue requests during refresh

4. **Parse at Service Layer**
   - Pass parser function to service
   - Return typed models
   - Handle parsing errors

## Integration

### With Other Skills

- **JWT Auth**: ApiService uses tokens from auth
- **Provider**: Providers use ApiService
- **Forms**: Form submission via ApiService
- **Error Handling**: Centralized error display

## Common Mistakes

- **Not handling timeouts**: Always set connection/receive timeouts
- **Parsing in widgets**: Parse in service, widgets get models
- **No error handling**: Every request must handle errors
- **Hardcoding URLs**: Use config and environment variables

## Validation Checklist

- [ ] Timeouts configured (connect + receive)
- [ ] Error handling for all request types
- [ ] Token refresh implemented
- [ ] Response parsing is type-safe
- [ ] Base URL is configurable
- [ ] Logging in development only
- [ ] Tests use mock ApiService

## References

- [Dio Package](https://pub.dev/packages/dio)
- [HTTP Package](https://pub.dev/packages/http)

## Success Metrics

- **Implementation Time**: 2-3 hours
- **Error Handling**: 100% of requests handled
- **Token Refresh**: Seamless, no user interruption
- **Type Safety**: All responses typed

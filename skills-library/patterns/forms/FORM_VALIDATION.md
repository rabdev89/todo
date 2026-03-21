# SKILL: Form Validation Patterns

## Metadata
- **Category**: forms
- **Scope**: ui
- **Difficulty**: Simple
- **Last Updated**: 2024-03-07
- **Effectiveness**: High

## Problem
How to validate user input in forms with clear error messages, proper validation rules, and good user experience across Flutter and web platforms.

## Solution Overview
Use declarative validation with per-field validators, form-level validation for cross-field rules, and real-time feedback with debouncing.

## Implementation

### Files to Create

| File | Purpose | Layer |
|------|---------|-------|
| `lib/utils/validators.dart` | Reusable validators | utils |
| `lib/widgets/validated_field.dart` | Validated input widget | ui |
| `lib/providers/form_provider.dart` | Form state management | ui |

### Flutter Implementation

#### Reusable Validators
```dart
// lib/utils/validators.dart

/// Base validator type
typedef Validator<T> = String? Function(T? value);

/// Composes multiple validators into one
Validator<T> compose<T>(List<Validator<T>> validators) {
  return (value) {
    for (final validator in validators) {
      final result = validator(value);
      if (result != null) return result;
    }
    return null;
  };
}

/// Required field validator
Validator<T> required<T>({String? message}) {
  return (value) {
    if (value == null || (value is String && value.isEmpty)) {
      return message ?? 'This field is required';
    }
    return null;
  };
}

/// Email validator
Validator<String> email({String? message}) {
  final regex = RegExp(r'^[\w.-]+@[\w.-]+\.\w+$');
  return (value) {
    if (value == null || value.isEmpty) return null;
    if (!regex.hasMatch(value)) {
      return message ?? 'Please enter a valid email';
    }
    return null;
  };
}

/// Minimum length validator
Validator<String> minLength(int min, {String? message}) {
  return (value) {
    if (value == null || value.isEmpty) return null;
    if (value.length < min) {
      return message ?? 'Must be at least $min characters';
    }
    return null;
  };
}

/// Maximum length validator
Validator<String> maxLength(int max, {String? message}) {
  return (value) {
    if (value == null || value.isEmpty) return null;
    if (value.length > max) {
      return message ?? 'Must be at most $max characters';
    }
    return null;
  };
}

/// Pattern validator (regex)
Validator<String> pattern(String regex, {String? message}) {
  final regExp = RegExp(regex);
  return (value) {
    if (value == null || value.isEmpty) return null;
    if (!regExp.hasMatch(value)) {
      return message ?? 'Invalid format';
    }
    return null;
  };
}

/// Password strength validator
Validator<String> strongPassword({String? message}) {
  return (value) {
    if (value == null || value.isEmpty) return null;
    
    if (value.length < 8) {
      return 'Password must be at least 8 characters';
    }
    if (!value.contains(RegExp(r'[A-Z]'))) {
      return 'Password must contain an uppercase letter';
    }
    if (!value.contains(RegExp(r'[a-z]'))) {
      return 'Password must contain a lowercase letter';
    }
    if (!value.contains(RegExp(r'[0-9]'))) {
      return 'Password must contain a number';
    }
    if (!value.contains(RegExp(r'[!@#$%^&*(),.?":{}|<>]'))) {
      return 'Password must contain a special character';
    }
    return null;
  };
}

/// Match another field validator
Validator<String> match(String otherValue, String fieldName, {String? message}) {
  return (value) {
    if (value == null || value.isEmpty) return null;
    if (value != otherValue) {
      return message ?? 'Does not match $fieldName';
    }
    return null;
  };
}

/// Numeric range validator
Validator<num> range(num min, num max, {String? message}) {
  return (value) {
    if (value == null) return null;
    if (value < min || value > max) {
      return message ?? 'Must be between $min and $max';
    }
    return null;
  };
}

/// Date validator (must be in past/future)
Validator<DateTime> dateInPast({String? message}) {
  return (value) {
    if (value == null) return null;
    if (value.isAfter(DateTime.now())) {
      return message ?? 'Date must be in the past';
    }
    return null;
  };
}
```

#### Validated TextField Widget
```dart
// lib/widgets/validated_field.dart
import 'package:flutter/material.dart';
import '../utils/validators.dart';

class ValidatedField extends StatefulWidget {
  final String label;
  final List<Validator<String>> validators;
  final TextEditingController? controller;
  final bool obscureText;
  final TextInputType? keyboardType;
  final void Function(String)? onChanged;
  final void Function(bool isValid)? onValidationChanged;

  const ValidatedField({
    super.key,
    required this.label,
    this.validators = const [],
    this.controller,
    this.obscureText = false,
    this.keyboardType,
    this.onChanged,
    this.onValidationChanged,
  });

  @override
  State<ValidatedField> createState() => _ValidatedFieldState();
}

class _ValidatedFieldState extends State<ValidatedField> {
  late TextEditingController _controller;
  String? _error;
  bool _touched = false;

  @override
  void initState() {
    super.initState();
    _controller = widget.controller ?? TextEditingController();
    _controller.addListener(_validate);
  }

  void _validate() {
    if (!_touched) return;
    
    final value = _controller.text;
    String? error;
    
    for (final validator in widget.validators) {
      error = validator(value);
      if (error != null) break;
    }
    
    setState(() => _error = error);
    
    widget.onChanged?.call(value);
    widget.onValidationChanged?.call(error == null);
  }

  @override
  Widget build(BuildContext context) {
    return TextField(
      controller: _controller,
      obscureText: widget.obscureText,
      keyboardType: widget.keyboardType,
      decoration: InputDecoration(
        labelText: widget.label,
        errorText: _touched ? _error : null,
        border: const OutlineInputBorder(),
      ),
      onChanged: (_) {
        if (!_touched) {
          setState(() => _touched = true);
        }
      },
    );
  }

  @override
  void dispose() {
    if (widget.controller == null) {
      _controller.dispose();
    }
    super.dispose();
  }
}
```

#### Form Provider
```dart
// lib/providers/form_provider.dart
import 'package:flutter/foundation.dart';
import '../utils/validators.dart';

class FormProvider extends ChangeNotifier {
  final Map<String, dynamic> _values = {};
  final Map<String, List<Validator>> _validators = {};
  final Map<String, String?> _errors = {};
  final Map<String, bool> _touched = {};

  void registerField(String name, {List<Validator> validators = const []}) {
    _validators[name] = validators;
    _errors[name] = null;
    _touched[name] = false;
  }

  void setValue(String name, dynamic value) {
    _values[name] = value;
    _touched[name] = true;
    _validateField(name);
    notifyListeners();
  }

  dynamic getValue(String name) => _values[name];
  String? getError(String name) => _touched[name] == true ? _errors[name] : null;
  bool get isValid => _errors.values.every((e) => e == null);
  bool get isDirty => _touched.values.any((t) => t);

  void _validateField(String name) {
    final value = _values[name];
    final validators = _validators[name] ?? [];
    
    String? error;
    for (final validator in validators) {
      error = validator(value);
      if (error != null) break;
    }
    
    _errors[name] = error;
  }

  bool validateAll() {
    // Mark all as touched
    for (final key in _validators.keys) {
      _touched[key] = true;
      _validateField(key);
    }
    notifyListeners();
    return isValid;
  }

  Map<String, dynamic> getValues() => Map.unmodifiable(_values);

  void reset() {
    _values.clear();
    _errors.updateAll((_, __) => null);
    _touched.updateAll((_, __) => false);
    notifyListeners();
  }
}
```

#### Usage Example
```dart
class LoginForm extends StatelessWidget {
  final _formKey = GlobalKey<FormState>();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();

  LoginForm({super.key});

  @override
  Widget build(BuildContext context) {
    return Form(
      key: _formKey,
      child: Column(
        children: [
          ValidatedField(
            label: 'Email',
            controller: _emailController,
            keyboardType: TextInputType.emailAddress,
            validators: [
              required(message: 'Email is required'),
              email(),
            ],
          ),
          ValidatedField(
            label: 'Password',
            controller: _passwordController,
            obscureText: true,
            validators: [
              required(message: 'Password is required'),
              minLength(8),
            ],
          ),
          ElevatedButton(
            onPressed: () => _handleSubmit(context),
            child: const Text('Login'),
          ),
        ],
      ),
    );
  }

  void _handleSubmit(BuildContext context) {
    if (_formKey.currentState!.validate()) {
      final email = _emailController.text;
      final password = _passwordController.text;
      // Submit
    }
  }
}
```

### Backend (Zod) Implementation

```typescript
// utils/validators.ts
import { z } from 'zod';

export const emailSchema = z.string()
  .min(1, 'Email is required')
  .email('Invalid email address');

export const passwordSchema = z.string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Must contain uppercase')
  .regex(/[a-z]/, 'Must contain lowercase')
  .regex(/[0-9]/, 'Must contain number');

export const loginSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

export const registrationSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegistrationInput = z.infer<typeof registrationSchema>;
```

### Key Principles

1. **Declarative Validation**
   - Define rules once, apply everywhere
   - Composable validators
   - Clear error messages

2. **Real-time Feedback**
   - Validate on change (with debounce)
   - Don't show errors until field touched
   - Clear errors when user types

3. **Backend Validation Always**
   - Never trust client-side validation
   - Use Zod/Pydantic on backend
   - Match frontend and backend rules

4. **Clear Error Messages**
   - User-friendly language
   - Specific guidance
   - Field-specific context

## Validation Checklist

- [ ] All required fields validated
- [ ] Email format checked
- [ ] Password strength enforced
- [ ] Cross-field validation works (e.g., password match)
- [ ] Real-time feedback implemented
- [ ] Backend validates independently
- [ ] Error messages are clear and helpful
- [ ] Accessibility (screen reader support)

## References

- [Zod Documentation](https://zod.dev/)
- [Flutter Forms](https://docs.flutter.dev/cookbook/forms/validation)

## Success Metrics

- **User Errors**: Reduced by 60%+
- **Form Completion**: Increased by 25%+
- **Support Tickets**: Fewer validation-related issues

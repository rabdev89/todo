# T-106: Registration Validation

## Overview
Implement robust validation for the registration process as defined in AUTH-01 of `prd_2.md`.

## Requirements
### Backend
- **Unique Email**: Check if the email already exists in the database before creating a new user. Return a 409 Conflict if it exists.
- **Password Complexity**: Enhance `RegisterDto` to require:
  - Minimum 8 characters.
  - At least one uppercase letter.
  - At least one lowercase letter.
  - At least one number.
  - At least one special character.
- **Sanitization**: Trim whitespace from email and name.

### Frontend
- Real-time validation feedback on the Registration form.
- Show specific error messages (e.g., "Email already in use", "Password too weak").

## Acceptance Criteria
- Cannot register with a duplicate email.
- Weak passwords (e.g., '12345678') are rejected with a clear message.
- Successful registration redirects to the login or dashboard.

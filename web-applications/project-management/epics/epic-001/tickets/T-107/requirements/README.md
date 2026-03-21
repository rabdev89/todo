# T-107: Login Validation

## Overview
Implement validation and secure handling for the login process as defined in AUTH-02 of `prd_2.md`.

## Requirements
### Backend
- **Valid Credentials**: Ensure both email and password are provided.
- **Security**: Return a generic error message ("Invalid email or password") for both non-existent users and incorrect passwords to prevent user enumeration.
- **Account Lockout (Optional/Bonus)**: Temporary lockout after 5 failed attempts (future scope).

### Frontend
- Loading state in the Login button.
- Error toast for failed authentication.

## Acceptance Criteria
- Logging in with wrong credentials shows a standard error message.
- Empty fields are blocked by client-side validation.

## Implementation notes
- Backend message is centralized as `LOGIN_FAILED_MESSAGE` in `auth.constants.ts` (used by `AuthService`).
- Optional account lockout remains future work.

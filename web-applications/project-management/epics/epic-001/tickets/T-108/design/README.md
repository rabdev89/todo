# Design: T-108 Login Redirect

## Style Attribution
- **Source**: `LoginPage.tsx` & `AuthCallbackPage.tsx` (Functional navigation).

## Technical Logic
- **Hook**: Use `useNavigate()` from `react-router-dom`.
- **Query Params**: Capture `?redirect=` or use `location.state.from` for post-login destination.
- **Default Baseline**: Navigate to `/` after success token is saved.

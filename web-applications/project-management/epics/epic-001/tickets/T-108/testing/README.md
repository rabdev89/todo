# Testing: T-108 Login Success Redirect

## Test Plan
- Scenario: User logs in from `/login`. User is redirected to `/`.
- Scenario: User is redirected to `/login` from `/settings`. User logs in. User is redirected back to `/settings`.
- Scenario: Social login callback contains deep link. User is redirected appropriately.

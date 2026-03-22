# Testing: T-109 Logout Functionality

## Test Cases

### Functional Tests
- [ ] **Logout Flow**: Click Logout -> Confirm -> Directed to `/login` -> Storage is empty.
- [ ] **Cancellation**: Click Logout -> Cancel -> Dialog closes -> Still logged in.
- [ ] **Auth Guard**: Logout -> Try to navigate manually to `/` -> Redirected to `/login`.

### Integration Tests
- [ ] Verify that social login tokens are also cleared (if stored separately).
- [ ] Verify that UI components reflecting "logged in" status (e.g., Avatars) are cleared/reset.

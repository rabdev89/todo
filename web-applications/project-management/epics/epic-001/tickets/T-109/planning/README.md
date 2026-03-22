# Planning: T-109 Logout Functionality

## Breath-Based Execution Plan

### Breath 1: Logic & Foundation
- [ ] Create/Update `useAuth` hook or `AuthContext` to include a `logout` function.
- [ ] Ensure `logout` clears `localStorage` and resets any global auth state.

### Breath 2: UI Integration
- [ ] Update `DashboardPage.tsx` sidebar.
- [ ] Change "Sign out" icon to `LogoutIcon`.
- [ ] Use `logout` from hook instead of inline `localStorage.removeItem`.
- [ ] Replace `window.location.href` with `navigate('/login')`.

### Breath 3: Confirmation Dialog
- [ ] Implement `LogoutConfirmationDialog` component with the specific text: "Are you sure you want to sign out? All unsaved changes will be lost".
- [ ] Trigger modal from sidebar click.
- [ ] Final polish on animations and transitions to match "Pristine Productivity Engine" style.

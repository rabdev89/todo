# T-303 Planning: Responsive Optimization

## Task Breakdown
1. [x] Metadata Update: status to `scoped`, track to `B`.
2. [ ] Frontend: Implement `useResponsive` hook for easy layout switching.
3. [ ] Frontend: Refactor `MainLayout` to support Sidebar vs MobileNav.
4. [ ] Frontend: Update `TaskDetailModal` to use `SwipeableDrawer` on mobile.
5. [ ] Frontend: Optimize task list scroll performance (e.g., `react-window` if volume is high).
6. [ ] Frontend: Conduct cross-browser responsive audit.

## Implementation Notes
- Use `@media` queries in CSS-in-JS (MUI `sx` prop).
- Targets: iOS Safari, Android Chrome, Desktop Chrome.

## Verification Checklist
- [ ] No layout shifts on orientation change.
- [ ] Click targets are at least 44x44px on mobile.
- [ ] Drawer opens smoothly via swipe on mobile.

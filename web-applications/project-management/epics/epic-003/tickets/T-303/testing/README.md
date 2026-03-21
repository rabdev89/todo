# T-303 Testing: Responsive Optimization

## Test Strategy
- **Visual Regression:** Compare screenshots at 375px, 768px, and 1440px widths.
- **Lighthouse Audit:** Focus on "Mobile" performance and accessibility scores.

## Test Cases
- **TC-RESP-1:** Mobile Navigation
  - Action: View on 375px screen.
  - Expected: Sidebar hidden, Bottom bar visible.
- **TC-RESP-2:** Drawer Behavior
  - Action: Open Task on 375px screen.
  - Expected: Full-width bottom drawer opens.
- **TC-RESP-3:** Performance
  - Action: Scroll list of 50 tasks on mobile.
  - Expected: Smooth 60fps scrolling.

## Verification Evidence
- [ ] Lighthouse report screenshot.
- [ ] Chrome DevTools mobile emulation video recording.

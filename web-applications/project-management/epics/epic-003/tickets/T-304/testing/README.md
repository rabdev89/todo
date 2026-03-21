# T-304 Testing: Mobile App Shell

## Test Strategy
- **Lighthouse Tests:** Audit for PWA compliance.
- **Functional Tests:** Verify offline behavior and installation.

## Test Cases
- **TC-PWA-1:** Manifest Check
  - Expected: Valid JSON, contains all required icon sizes.
- **TC-PWA-2:** Offline Mode
  - Action: Disable network.
  - Expected: Previously visited pages load from cache, then offline fallback shows for new pages.
- **TC-PWA-3:** Home Screen Launch
  - Action: Open from Home Screen icon.
  - Expected: No browser address bar (standalone).

## Verification Evidence
- [ ] Lighthouse PWA score >= 90.
- [ ] Recording of app launching in standalone mode.

# T-101 Testing: Initial Scaffolding

## Test Cases
- **TC-101.1:** App Initialization
  - Steps: Run build commands.
  - Expected: Zero errors.
- **TC-101.2:** Theme Verification
  - Steps: Check `App.tsx` for MUI ThemeProvider.
  - Expected: Primary hex matches `#027CEC`.

## Automated Tests
- [ ] Linting: `npm run lint`
- [ ] Build: `npm run build`

## Verification Log
- **2026-03-18**:
  - **Lint**: `npm run lint` (root, runs frontend + backend)
  - **Build**: `npm run build` (root, runs frontend + backend)
  - **Theme token**: MUI theme primary is `#027CEC`

# T-304 Planning: Mobile App Shell

## Task Breakdown
1. [x] Metadata Update: status to `scoped`, track to `B`.
2. [ ] Frontend: Install `vite-plugin-pwa`.
3. [ ] Frontend: Configure `vite.config.ts` with PWA settings.
4. [ ] Frontend: Generate icons and place in `public/`.
5. [ ] Frontend: Implement `PromptForUpdate` component for service worker updates.
6. [ ] Frontend: Verify manifest is correctly linked in `index.html`.

## Implementation Notes
- Use `maskable` icons for Android compatibility.
- Set `short_name` to "TodoApp" for home screen labels.

## Verification Checklist
- [ ] PWA manifest is valid (JSON lint).
- [ ] App is installable in Chrome/Edge.
- [ ] Offline page appears when network is disconnected.

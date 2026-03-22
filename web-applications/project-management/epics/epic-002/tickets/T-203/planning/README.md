# T-203 Planning: Dashboard UI Implementation (Breath-Based)

## Implementation Breaths

### Breath 1: Foundation & Layout
- [x] Integrate standard MUI Theme with style_guide.json tokens.
- [x] Setup `DashboardPage` layout (Responsive Sidebar + AppBar).
- [x] Implement base `TaskList` container with skeleton loading states.
- **Verification**: Visual check of layout consistency.

### Breath 2: Task List & Filtering
- [/] Connect `TaskList` to `GET /tasks` API.
- [/] Implement Priority & Status filters in the Sidebar.
- [ ] **GAP**: Implement **Active Filter Chips** (closable) below the filter bar.
- **Verification**: Filters correctly update the list; chips appear/disappear.

### Breath 3: Interaction & Subtasks
- [x] Implement row expansion to reveal `SubtaskList`.
- [ ] **GAP**: Add **Single-Task Delete Confirmation** dialog.
- [ ] Implement Sort-by-Priority and Sort-by-Date on header click.
- **Verification**: Subtasks are visible; sorting logic is correct.

### Breath 4: Multi-select & Bulk Actions (Sync with T-205)
- [x] Implement multi-select checkboxes.
- [x] Implement floating action bar for bulk delete/update.
- [x] **Verification**: Bulk actions work with confirmation.

### Breath 5: Final Hardening & Testing
- [ ] Resolve CSS dependency conflicts for Jest/Vitest.
- [ ] Achieve ≥ 80% component test coverage.
- [ ] Mobile responsiveness final pass.
- **Verification**: `ci/verify.sh` passes.

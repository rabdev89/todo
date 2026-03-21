# T-402: File Attachments (UI Integration) - Planning

## Implementation Phases

### Phase 1: types & Utility (Done)
- [x] Update `Task` and `Attachment` interfaces in `types.ts`.
- [x] Fix `apiFetch` in `api.ts` to support `FormData` by omitting `Content-Type` header when `FormData` is passed.

### Phase 2: UI Implementation (Done)
- [x] Add necessary icons to `DashboardPage.tsx`.
- [x] Implement file upload, delete, and download handlers.
- [x] Build the "Attachments" section in `TaskDetailDrawer`.
- [x] Add MIME-type icon mapping.

### Phase 3: Verification (In Progress)
- [ ] Manual verification of upload flow.
- [ ] Manual verification of download flow.
- [ ] Manual verification of delete flow.
- [ ] Verify UI responsiveness and loading states.

## Estimated Effort
- **Frontend Core Logic**: 3 hours (Completed)
- **UI Styling & Layout**: 2 hours (Completed)
- **Verification & Debugging**: 2 hours (In Progress)
- **Total**: ~7 hours

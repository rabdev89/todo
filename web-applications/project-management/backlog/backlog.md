# Project Backlog & Ideas

This document tracks high-level ideas, feature requests, and unscoped concepts. Once an idea is ready for development, it will be moved to a ticket folder in `web-applications/project-management/epics/backlog/tickets/`.

## How to Process Backlog Items

### To Generate Tickets from Backlog:
**Ask the AI agent**: "Please run `npm run scan:tickets` to scan and generate tickets from the backlog"

The AI agent will:
1. Run the scanner to generate ticket folders
2. Assign initial track decisions (scaffolding only)
3. Provide action items for scoping
4. Show you what tickets were created


### Ticket Scaffolding
Scaffold each ticket before letting the AI agent to scope the ticket.

1. npm run start -- research T-001
2. npm run start -- plan T-001
3. npm run start -- design T-001
4. npm run start -- execute T-001
5. npm run start -- verify T-001

### To Scope Generated Tickets:
**Ask the AI agent**: "Please scope the generated tickets following the TICKET_SCOPING.md rules"

The AI agent will:
1. Run manual decision gate for each ticket
2. Create all required documentation (requirements, design, planning, testing)
3. Update metadata files
4. Remove processed items from this backlog

## 💡 Raw Ideas (Unscoped)
- [ ] TASK-06: Multi-select Task Actions (UI/UX)
- [ ] ATT-01: File Attachments (Backend API & Storage)
- [ ] ATT-02: File Attachments (UI Integration in Detail Drawer)
- [ ] TASK-07: Task Completion Logic & Subtask Dependency Enforcement
- [ ] SYS-01: Pagination & Lazy Loading for Task Dashboard
- [ ] SYS-02: Cascading Deletes (Tasks -> Subtasks/Attachments)
- [ ] Add dark mode toggle

## UAT Bug Fixes

List bugs discovered during manual testing here.

<!-- Example: - [ ] Bug 1: (Description) -->

## 🗺️ Roadmap

### 🚀 Project Initiatives (Production Releases)

### 🔍 Ready for Review (Scoped)

### ✅ Verified

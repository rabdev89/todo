# WORKFLOW DECISION GATE

Use this matrix to determine if a ticket should follow **Track A (Lean)** or **Track B (Full Scoping)**.

## Decision Matrix

| Question | Criteria | Choice |
| :--- | :--- | :--- |
| **1. Scope Check** | Does this touch 3+ files OR modify shared state (DB/API/Types)? | YES → Track B |
| **2. Complexity Check** | Is this a new feature, complex logic, or sensitive (security/perf)? | YES → Track B |
| **3. Effort Check** | Will this take 4+ hours OR is it uncertain? | YES → Track B |

**Conclusion:**
- If ANY "YES" → **Track B** (Requirements, Design, Planning, Testing, Implementation)
- If ALL "NO" → **Track A** (Implementation Plan Only)

---

## Current Track Decisions

### Epic 1: Foundation & Authentication
- **T-101 (Scaffolding):** Track B (New project structure, many files)
- **T-102 (DB/Models):** Track B (Shared state, DB schema)
- **T-103 (Auth API):** Track B (Security sensitive, API contracts)
- **T-104 (Middleware):** Track B (Shared logic, security)

### Epic 2: Core Task Management
- **T-201 (Task API):** Track B (API contracts, DB changes)
- **T-202 (Subtasks):** Track B (Complex logic, DB changes)
- **T-203 (Dashboard):** Track B (Complex UI, multi-file)

### Epic 3: Advanced Features
- **T-301 (Attachments):** Track B (External storage, API)
- **T-302 (Filter/Sort):** Track B (Complex query logic)
- **T-303 (Responsive):** Track B (Multi-component polish)

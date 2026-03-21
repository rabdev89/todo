---
description: Knowledge auto-extraction into .agent/rules/ or the memory service
---

Store reusable guidance or a newly solved complex pattern in the knowledge memory service.

**Workflow:**

1. Analyze the work just completed (e.g., a complex frontend UI pattern, a specific database query optimization, a tricky API proxy).
2. Determine if this pattern is generally applicable to the project.
3. If using the memory MCP: Use `memory.storeKnowledge` with appropriate tags and global/project scope.
4. If modifying local rules: Create or append the actionable pattern into the relevant file within `.agent/rules/` (e.g., `javascript.md`, `ui.md`, or a new rule file).
5. Ensure the extracted rule is strictly actionable and not generic fluff.

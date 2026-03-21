---
description: Full autopilot execution for a fully scoped Epic
---

Start autonomous execution for the specified Epic.

**Pre-requisites:**
All tickets in this Epic MUST be fully scoped and validated with `requirements.md` and `design.md` files present.

**Workflow:**

1. Read the Epic metadata and ticket list.
2. For each ticket, sequentially:
   a. Execute the implementation plan (`/execute-plan`).
   b. Follow Breath-based implementation rules.
   c. Run the Autonomous Verification Gate (`/verify-ticket`).
   d. If verification fails, autonomously enter a `/debug` loop to fix the issue.
   e. Only once tests pass and the zero-mock policy is validated with 100% test coverage, mark the ticket as `[DONE]`.
3. Proceed to the next ticket.
4. If a Circuit Breaker is tripped, halt the autonomous loop and notify the human operator immediately.

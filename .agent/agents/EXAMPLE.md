# Example: Research → Plan → Execute → Verify (T-EX1)

Ticket: T-EX1 — "Add health-check endpoint"

1) Researcher
- Action: Run discovery for "health-check" and inspect existing endpoints
- Output: `RESEARCH.md` (found `src/api/status.ts`, recommended simple GET /health)

2) Planner
- Action: Create `BLUEPRINT.md` with breaths:
  - Breath 1: Add endpoint file `src/api/health.ts` (create)
  - Breath 2: Add tests `test/health.test.js` and update docs
- Output: `BLUEPRINT.md`

3) Executor
- Action: Implement `src/api/health.ts`, add tests, run File Guard, commit per-task
- Output: `RECORD.md` with commit hashes and validation results

4) Verifier
- Action: Run `ci/verify.sh` or `npm test`, check must-haves (endpoint responds 200), run 70-point checklist
- Output: `VERIFICATION.md` with PASS/FAIL and evidence

Commands (example):
```
node .agent/tests/validate_prompts.js
# run CI locally (project-specific)
bash ci/verify.sh --quick
```

Notes:
- Use `.agent/agents/registry.json` to automate which agent handles each step.

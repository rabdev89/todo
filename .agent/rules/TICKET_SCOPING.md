# Ticket Scoping Rules

## Repository Intelligence (MANDATORY)
- **Always check for `repo_data` files** before starting the scoping process.
- **If `web-applications/repo_data/` directory does not exist**, run: `npm run make:setup-index`
- **Always consult `repo_data` files** (located in `engine/repo_data` or `web-applications/repo_data`) after ensuring they exist.
- These files (`files.json`, `symbols.json`, `chunks.json`, `imports.json`) provide a pre-indexed map of the repository and must be used to ensure comprehensive understanding, even for Track A tickets.

## Automated Scanner (Scaffolding Only)
- The automated ticket scanner is for **initial scaffolding only**
- Keyword-based decisions are acceptable for initial setup
- Accuracy is not critical - human review is required

## Human Decision Gate (Required)
Before starting work on ANY ticket, you must:

### 1. Run Manual Decision Gate
Use the official `WORKFLOW_DECISION_GATE.md` 3-question matrix:

```
Question 1: Scope Check
Does this work touch 3+ files OR modify shared state?
- Database schema changes? → TRACK B
- API/GraphQL contract changes? → TRACK B  
- Shared type definitions or interfaces? → TRACK B
- Global configuration or env variables? → TRACK B
- Authentication or authorization logic? → TRACK B

Question 2: Complexity Check  
Even if < 3 files, is this complex?
- New feature (not existing feature modification)? → TRACK B
- Architectural change or refactor? → TRACK B
- Machine learning or algorithm implementation? → TRACK B
- Integration with external service? → TRACK B
- Performance-critical or security-sensitive code? → TRACK B

Question 3: Estimated Effort
If you've reached here, how long will this take?
- < 4 hours with high confidence? → TRACK A
- 4+ hours OR uncertain? → TRACK B
```

### 2. Update Track Decision
If the automated scanner got it wrong:
- Update `TRACK_DECISION.md` with correct decision
- Update `metadata.json` track field
- Add proper reasoning based on the 3-question matrix

### 3. Complete Scoping Process

#### For All Tickets:
- **Track Decision**: Update `TRACK_DECISION.md` and `metadata.json`
- **Requirements**: Create `requirements/README.md`
- **Design**: Create `design/README.md`
- **Planning**: Create `planning/README.md`
- **Testing**: Create `testing/README.md`
- **Implementation**: Update `implementation/README.md`
- **Metadata**: Update `metadata.json` with scoping information

#### For Backlog Tickets (source = "backlog"):
- **Scope**: Complete full scoping process above
- **Status**: Update `metadata.json` status to "scoped"
- **Remove from Backlog**: Remove the item from `backlog.md` after scoping is complete
- **Move if Needed**: Move ticket to appropriate epic if it belongs to one

#### For Epic Tickets (source = epic):
- **Scope**: Complete full scoping process within the epic
- **Update Epic**: Update epic's `README.md` with ticket status
- **Epic Status**: Mark epic as "in_progress" if development begins

### 4. Proceed with Correct Track
- **Track A**: Create `implementation_plan.md` only
- **Track B**: Full documentation (requirements, design, planning, testing)

## Example: T-002 Street Number Fix

### Scanner Decision (Wrong): Track A
- Based on keyword "fix"

### Human Decision (Correct): Track B  
- **Question 1**: Touches 8 files (≥3) → **Track B**
- **Reasoning**: Multi-component validation changes affect 8 Vue components

### Correct Action:
1. Update `TRACK_DECISION.md` to Track B
2. Update `metadata.json` to Track B  
3. Complete full scoping (requirements, design, planning, testing)
4. Update `metadata.json` status to "scoped"
5. Remove from `backlog.md` (since source = "backlog")
6. Follow Track B workflow (full documentation)

## Hierarchical Design Awareness (DesignAgent)
When scoping a ticket, the `DesignAgent` follows a strict hierarchy for visual tokens (colors, typography):

1.  **Linked Mockups (HIGHEST)**: If the ticket title links to `.html` or `.css` mockups, the agent MUST extract tokens (e.g., `#20df80`, `Manrope`) from those files.
2.  **Project Style Guide (Preferred: JSON)**: If mockups are missing, the agent MUST fallback to `web-applications/project-management/design/style_guide.json` (machine-readable) or `style_guide.md`.
3.  **UI/UX Pro-Max (UX Logic)**: The Pro-Max engine is used for structural patterns (Glassmorphism, SaaS Dashboard) and conversion logic, but visual tokens are overridden by the sources above.

### Verification of Design Spec
Every generated `DESIGN.md` MUST include a **Style Attribution** block at the top, clearly stating the source of the visual tokens.

## Key Principle
**Automated scanner = scaffolding suggestion**
**Human decision gate = actual track assignment**
**Complete scoping = required before development**

The scanner provides a starting point, but the human (or agent) must run the official decision gate and complete full scoping before beginning work.

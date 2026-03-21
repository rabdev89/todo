---
id: two-track-workflow-v1
name: Two-Track Development Workflow
category: methodology
type: methodology
scope: universal
version: 1.0.0
last_updated: 2024-03-07
author: bob-framework
difficulty: Simple
status: active
tags: [workflow, process, lean, full, development]
---

# SKILL: Two-Track Development Workflow

## Problem

Projects suffer from:
- Too much process for small changes
- Too little process for big changes
- Inconsistent quality
- Unclear when to use which approach

## Solution Overview

Two-track system matching process to complexity:
- **Track A (Lean)**: Small changes, fast path
- **Track B (Full)**: Major features, thorough process

## Implementation

### ⚠️ MANDATORY: Use WORKFLOW_DECISION_GATE First

**Before starting any work, read `project-management/WORKFLOW_DECISION_GATE.md`**

That document provides:
- Clear decision criteria
- Examples for each decision
- How to document your choice
- Integration with this workflow

The decision gate is **non-negotiable** — it comes before any other steps.

### Decision Matrix (From WORKFLOW_DECISION_GATE)

| Criteria | Track | Complexity |
|----------|-------|------------|
| < 3 files, no schema/API changes | **Track A (Lean)** | Low/Medium |
| ≥ 3 files, or new tables/API | **Track B (Full)** | High/Major |
| Complex/new features | **Track B (Full)** | High |
| Uncertain scope | **Track B (Full)** | High |

### Track A: Lean Workflow

**When**: Bug fixes, minor UI tweaks, simple logic updates

**Steps**:
1. **Initialize**: Create `web-applications/project-management/tickets/T-XXX/` folder
   - Copy `TEMPLATE-implementation_plan.md` as `implementation_plan.md`

2. **Plan**: Document approach concisely
   - Use headers: Requirements, Design, Plan

3. **Execute**: 
   - Create `tasks.md` in root
   - Implement code

4. **Finalize**: 
   - Set `**Status**: [DONE]`
   - Update `backlog.md`

**Duration**: Hours to 1 day

### Track B: Full Workflow

**When**: New features, architectural changes, complex refactors

**Steps**:
1. **Initialize**: Create `web-applications/project-management/tickets/T-XXX/`
   - Create all subfolders: `requirements/`, `design/`, `planning/`, etc.
   - Copy from `ticket_templates/`

2. **Phase-Based Execution** (strict sequence):
   - Phase 1: Requirements
   - Phase 2: Review Requirements  
   - Phase 3: Review Design
   - Phase 4: Execute Plan
   - Phase 5: Update Planning
   - Phase 6: Check Implementation
   - Phase 7: Write Tests
   - Phase 8: Code Review

3. **Approval**:
   - Present `implementation_plan.md` at each major phase
   - Get explicit user approval before proceeding

4. **Finalize**:
   - Set `**Status**: [DONE]`
   - Update `backlog.md`

**Duration**: Days to weeks

## Core Rules

1. **Backlog First**: Check `backlog.md`, move to **🔍 Ready for Review**
2. **Right Track**: Choose track based on complexity, not preference
3. **Approval Required**: Never execute complex changes without approval
4. **Update Status**: Set to **✅ Verified** only after confirmation
5. **Document Everything**: Each phase produces output

## Validation Checklist

- [ ] Complexity assessed correctly
- [ ] Track chosen appropriately
- [ ] Backlog updated before starting
- [ ] Required documentation created
- [ ] Approvals obtained (Track B)
- [ ] Status updated on completion

## Integration

- **Planner** (`planner-v1`): Orchestrates Track B phases
- **Executor** (`executor-v1`): Implements both tracks
- **Documentation** (`documentation-v1`): Reviews outputs

## Common Mistakes

- **Always Full**: Using Track B for trivial changes
- **Always Lean**: Using Track A for complex changes
- **Skipping Backlog**: Not checking/updating backlog.md
- **No Approval**: Executing Track B without user OK
- **Missing Docs**: Not creating required documentation

## Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.0.0 | 2024-03-07 | Migrated from workflow skill | bob-framework |

# SKILL: GStack Specialist Integration

## Metadata
- **Category**: workflow
- **Scope**: universal
- **Difficulty**: Intermediate
- **Last Updated**: 2026-03-14
- **Effectiveness**: High

## Problem
Generic AI agents often lack the rigor of specialized human roles (CEO, Tech Lead, Release Eng). This leads to weak product vision, architectural debt, and brittle releases.

## Solution Overview
The **GStack Specialist Interface** provides on-demand specialization. Agents MUST invoke these specialists at specific SDLC gates defined in `phases_definition.json`.

## Specialist Modes

| Command | Role | When to Use |
|---------|------|-------------|
| **`/plan-ceo-review`** | Founder Mode | After Requirements Review (Phase 4). Checks ambition and vision. |
| **`/plan-eng-review`** | Tech Lead Mode | Triple-Gate: Architecture (Phase 5), Epic Hardening (Phase 8), PI Hardening (Phase 9). |
| **`/ship`** | Release Mode | After Eng Review in Epic Hardening (Phase 8). Syncs PRs and merges. |
| **`/qa`** | QA Mode | During Development (Phase 7). Diff-aware automated verification. |
| **`/browse`** | Browser Mode | Any time interaction with a live web UI is needed. Persistent state. |

## Implementation Workflow

### 1. The CEO Handover (Phase 4)
Once `requirements/README.md` is complete:
1.  Run `/plan-ceo-review`.
2.  If the CEO mode suggests improvements, update the requirements.
3.  Repeat until the vision is locked.

### 2. The Architecture Gate (Phase 5)
Once API and Database designs are complete:
1.  Run `/plan-eng-review`.
2.  Technical Lead will audit for N+1 issues, schema normalization, and contract consistency.
3.  Integrate feedback before starting code execution.

### 3. The Release Cycle (Phase 8)
Once implementation is done and verified locally:
1.  Run `/plan-eng-review` to audit the final code quality.
2.  Run `/ship` to finalize the PR and synchronize the primary branch.

## Key Principles
1.  **Persona Lock**: When in a specialist mode, stay focused on that role's priorities.
2.  **Evidence Based**: Specialists should provide links or file references for their findings.
3.  **Low Latency**: Use `/browse` for sub-second visual checks instead of starting new instances.

## Validation Checklist
- [ ] `/plan-ceo-review` performed at Phase 4 Exit.
- [ ] `/plan-eng-review` performed at Phase 5 Exit.
- [ ] `/plan-eng-review` performed at Phase 8 Exit.
- [ ] `/ship` executed successfully for the Epic.

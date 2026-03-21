---
description: Plan and execute a task epic
---

# /task command

Use this command to break down a user story or feature into a structured epic with clear implementation steps.

## Steps

1. **Epic Context**: Identify the Epic in `web-applications/project-management/epics/`. If new, initialize the folder using the `epic_template`.
2. **Scoping Prompt**: Use the "Epic Scoping Prompt" from `HUMAN.md` to generate all required implementation tickets.
3. **Task Breakdown**: Break the Epic into granular tickets (`T-XXX`) inside the Epic's `tickets/` folder.
4. **Initialization**: For each ticket, ensure a `metadata.json` exists with `status: "todo"` and all completion flags set to `false`.
5. **Gating Check**: Verify that `ci/ci_config.sh` is configured for the current tech stack before suggesting any implementation steps.

6. **Hardening Transition**: Once all tickets are `[DONE]`, trigger the **Epic Hardening Protocol** (Threat Modeling, API Contracts, regression verification).

## Definition of Done (Tickets)

A ticket is NOT done until:

- [ ] Requirements and Design docs are approved.
- [ ] Implementation is completed.
- [ ] Passing CLI test output is provided.
- [ ] `metadata.json` flags are updated.

## Definition of Done (Epic)

An Epic is NOT done until:

- [ ] All tickets are `[DONE]`.
- [ ] Gap Analysis is performed and closed.
- [ ] `threat_model.md` and `api_contract.md` are filled in.
- [ ] `ci/pipeline.sh` passes for the entire Epic.
- [ ] Version tag is created.

Refer to `.agent/rules/task-creator.md` for task planning best practices.

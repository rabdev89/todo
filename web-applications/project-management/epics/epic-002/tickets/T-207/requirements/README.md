# T-207: Task Completion Logic & Dependencies

## Overview
Implement business rules for task completion as defined in PRD_2.md.

## Requirements
- **Dependency Enforcement**: A task cannot be marked as 'completed' if any of its subtasks are 'pending' or 'in progress'.
- **Auto-completion**: When a user marks the final subtask of a task as 'completed', the parent task should automatically transition its status to 'completed'.
- **Manual Override**: If a task has NO subtasks, it can be toggled to 'completed' freely.

## Acceptance Criteria
- Attempting to complete a task with open subtasks returns an error or is blocked in UI.
- Checking the last subtask auto-checks the task.
- UI reflects status changes immediately based on subtask toggles.

---
description: Log salient changes to the activity-log.md
---

# /log command

Use this command to log major changes, architectural decisions, or milestones to the `activity-log.md` file.

## Instructions

1. Identify the salient changes since the last log entry.
2. Format the entry as follows:
   ```markdown
   ## [YYYY-MM-DD] [Brief Title]

   - Change description 1
   - Change description 2
   ```
3. Append the entry to the end of `activity-log.md`.

## Automation

// turbo

1. run_command: "powershell -Command \"Add-Content -Path 'activity-log.md' -Value '`n## [$(Get-Date -Format 'yyyy-MM-dd')] $env:LOG_TITLE`n- $env:LOG_DESCRIPTION'\""

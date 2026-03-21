---
description: Group multiple Epics together to form a formal Project Initiative (Release layer)
---

Start a new PI grouping for the requested version release.

1. **Manifest**: To prevent token-burn and hallucination, you MUST use the autonomous Python script.
   Execute `python .agent/init_pi.py --number XXX --name "Release Title" --epics X Y Z` in the root terminal.
   - Example: `python .agent/init_pi.py --number 2 --name "Security Hardening Release" --epics 14 15 16`
   - The script will automatically scan the Epic folders, check for Threat Models/Gap Analysis artifacts to confirm HARDENED status, generate the Markdown table, and build the DOD verification checklist into `web-applications/project-management/epics/PI-XXX_Manifest.md`.
2. **Review Output**: Wait for the script to finish and verify the PI Manifest file was created.
3. **Execution Block**: Ensure no PI can ship if any DOD item is pending. Let the human know the Manifest has been successfully initialized and awaits Hardening.

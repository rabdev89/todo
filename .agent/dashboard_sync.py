import os
import json
from collections import defaultdict
import datetime

# Determine project root dynamically (assuming this script is in .agent/ or root)
script_dir = os.path.dirname(os.path.abspath(__file__))
project_root = os.path.abspath(os.path.join(script_dir, "..")) if os.path.basename(script_dir) == ".agent" else script_dir

epics_dir = os.path.join(project_root, "project-management", "epics")
dashboard_file = os.path.join(project_root, "project-management", "DASHBOARD.md")

if not os.path.exists(epics_dir):
    print(f"Error: Could not find epics directory at {epics_dir}")
    exit(1)

epic_stats = defaultdict(lambda: {"total": 0, "done": 0, "tickets": []})

# Walk exactly Epics
for epic_name in os.listdir(epics_dir):
    if not epic_name.startswith("epic-"):
        continue
    
    # Extract Epic Number
    epic_num_str = epic_name.split("-")[1]
    try:
        epic_num = int(epic_num_str)
    except ValueError:
        epic_num = epic_num_str
        
    objective_area = " ".join([word.capitalize() for word in epic_name.split("-")[2:]])
    
    epic_stats[epic_num]["name"] = objective_area
    epic_stats[epic_num]["dir"] = epic_name
    
    tickets_dir = os.path.join(epics_dir, epic_name, "tickets")
    if not os.path.isdir(tickets_dir):
        continue
        
    for ticket in os.listdir(tickets_dir):
        if not ticket.startswith("T-"):
            continue
        
        meta_path = os.path.join(tickets_dir, ticket, "metadata.json")
        if os.path.isfile(meta_path):
            with open(meta_path, "r", encoding="utf-8") as f:
                try:
                    data = json.load(f)
                    status = data.get("status", "").lower()
                    epic_stats[epic_num]["total"] += 1
                    epic_stats[epic_num]["tickets"].append((ticket, status))
                    if status in ["done", "approved"]:
                        epic_stats[epic_num]["done"] += 1
                except:
                    pass

# Generate Markdown Content
today = datetime.datetime.now().strftime("%Y-%m-%d")

md_content = f"""# 📊 Project Dashboard

> **Last Updated:** {today}
> **Active PI / Release Version:** Scanning Manifests...
> **Active Session State:** Awaiting `/handoff` from recent activity.

---

## 🛠️ Epic Status Overview

| Epic | Objective Area | Total Tickets | Verified | Progress Bar |
| :--- | :--- | :--- | :--- | :--- |
"""

for epic_num in sorted(epic_stats.keys()):
    stats = epic_stats[epic_num]
    total = stats["total"]
    done = stats["done"]
    pct = int((done / total) * 100) if total > 0 else 0
    
    # Generate visual progress bar [##########]
    filled_bars = int(pct / 10)
    empty_bars = 10 - filled_bars
    progress_bar = f"`[{'#' * filled_bars}{'-' * empty_bars}] {pct}%`"
    
    name = stats.get("name", "Unknown Focus")
    md_content += f"| **{epic_num}** | {name} | {total} | {done} | {progress_bar} |\n"

md_content += """
---

## 🛡️ Verification Gate Health

- **Layer 1 (Ticket Gates):** Operational. The AI must score ≥ 80% on `verification-gate.md` to pass.
- **Layer 2 (Epic Gating):** """

# Add epic hardening suggestions
completed_epics = [str(k) for k, v in epic_stats.items() if v["total"] > 0 and v["total"] == v["done"]]
if completed_epics:
    epics_str = ", ".join(completed_epics)
    md_content += f"**Epics {epics_str}** are 100% complete and are ready for **Epic Hardening**.\n"
else:
    md_content += "No epics are 100% complete yet.\n"

md_content += """- **Layer 3 (PI Manifest):** Validating active `PI-XXX_Manifest.md` files.
"""

# Write to DASHBOARD.md
with open(dashboard_file, "w", encoding="utf-8") as f:
    f.write(md_content)

print(f"Dashboard successfully generated at: {dashboard_file}")

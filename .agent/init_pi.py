import os
import argparse
import json
from datetime import datetime
import re

def get_epic_status(epic_path):
    # Check for hardening artifacts
    has_gap = os.path.exists(os.path.join(epic_path, "gap_analysis.md"))
    has_threat = os.path.exists(os.path.join(epic_path, "threat_model.md"))
    has_mapping = os.path.exists(os.path.join(epic_path, "database_mapping.md"))
    
    artifact = ""
    artifact_name = ""
    if has_gap:
        artifact = "gap_analysis.md"
        artifact_name = "Gap Analysis"
    elif has_threat:
        artifact = "threat_model.md"
        artifact_name = "Threat Model"
    elif has_mapping:
        artifact = "database_mapping.md"
        artifact_name = "Mapping Audit"
        
    return "HARDENED" if artifact else "IN-PROGRESS", artifact, artifact_name

def main():
    parser = argparse.ArgumentParser(description="Instantly generate a PI Manifest for a range of Epics.")
    parser.add_argument("--number", required=True, type=int, help="The PI number (e.g. 2 for PI-002)")
    parser.add_argument("--name", required=True, help="The name/objective of the release (e.g. 'Security Hardening Release')")
    parser.add_argument("--epics", required=True, nargs="+", type=int, help="List of epic numbers to include (e.g. 1 2 5)")
    args = parser.parse_args()

    pi_id = f"PI-{args.number:03d}"
    
    # Determine project root dynamically
    script_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.abspath(os.path.join(script_dir, "..")) if os.path.basename(script_dir) == ".agent" else script_dir
    epics_dir = os.path.join(project_root, "project-management", "epics")
    manifest_path = os.path.join(epics_dir, f"{pi_id}_Manifest.md")

    manifest_content = f"""# Project Initiative Manifest: {pi_id} ({args.name})

## Objective

This release consolidates the selected Epics into a production-ready deployment milestone.

## Epic Mapping ({pi_id})

| Epic ID | Name | Status | Hardening Artifacts |
| :--- | :--- | :--- | :--- |
"""

    found_epics = []
    
    # Scan for matching epics
    if os.path.exists(epics_dir):
        for dirname in sorted(os.listdir(epics_dir)):
            if dirname.startswith("epic-"):
                try:
                    epic_num = int(dirname.split("-")[1])
                    if epic_num in args.epics:
                        # Parse name
                        epic_title_parts = dirname.split("-")[2:]
                        epic_title = " ".join([word.capitalize() for word in epic_title_parts])
                        
                        # Check status
                        epic_path = os.path.join(epics_dir, dirname)
                        status, artifact_file, artifact_name = get_epic_status(epic_path)
                        
                        # Format artifact link
                        artifact_link = f"[{artifact_name}](file:///{epic_path.replace(chr(92), '/')}/{artifact_file})" if artifact_file else "None"
                        
                        manifest_content += f"| EPIC-{epic_num:03d} | {epic_title} | {status} | {artifact_link} |\n"
                        found_epics.append(epic_num)
                except Exception as e:
                    pass

    missing = set(args.epics) - set(found_epics)
    if missing:
        print(f"Warning: Could not find folders for Epics: {missing}")

    manifest_content += """
## PI Definition of Done (DOD)

| Requirement | Status | Notes |
| :--- | :--- | :--- |
| **PI Gap Analysis** | [ ] | Pending. |
| **No Mock Data** | [ ] | Pending zero-mock audit. |
| **No Missing Assets / 404s** | [ ] | Pending router audit. |
| **BE Unit Testing Full Coverage** | [ ] | Must hit >80% threshold. |
| **Initialization of FE Testing** | [ ] | Pending integration tests. |
| **FE Testing Full Coverage** | [ ] | Target planned for future iterations. |
| **Security & Pentest Audit** | [ ] | Pending RLS and Dependency checks. |
| **Code Quality Gate** | [ ] | Tech-agnostic quality-check.py (PI Mode) must pass. |
| **Production Release Notes** | [ ] | Pending generation. |

## Pre/Post Deployment Suggestions

- **Pre**: Shadow-run database migrations in a Supabase staging project.
- **Post**: Error Budget Alerting via Sentry and User Retention tracking.
"""

    # Write to manifest
    with open(manifest_path, "w", encoding="utf-8") as f:
        f.write(manifest_content)

    print(f"Successfully generated PI Manifest: {manifest_path}")

if __name__ == "__main__":
    main()

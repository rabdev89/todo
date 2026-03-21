import os
import json
import argparse
import shutil
import re
from datetime import datetime

def create_ticket(epic_path, ticket_id, title, source="epic", track="Track B"):
    tickets_dir = os.path.join(epic_path, "tickets")
    ticket_dir = os.path.join(tickets_dir, f"T-{ticket_id:03d}")
    
    os.makedirs(ticket_dir, exist_ok=True)
    
    # Check if already fully scaffolded
    if track == "Track B" and os.path.exists(os.path.join(ticket_dir, "requirements", "README.md")):
        print(f"Skipping T-{ticket_id:03d}: Already scaffolded.")
        return
    if track == "Track A" and os.path.exists(os.path.join(ticket_dir, "implementation", "README.md")):
        print(f"Skipping T-{ticket_id:03d}: Already scaffolded.")
        return
    
    # Create different structures based on track
    if track == "Track A":
        # Lean structure - minimal documentation
        subdirs = ["implementation"]
        for subdir in subdirs:
            sub_path = os.path.join(ticket_dir, subdir)
            os.makedirs(sub_path, exist_ok=True)
            
            readme_path = os.path.join(sub_path, "README.md")
            with open(readme_path, "w", encoding="utf-8") as f:
                f.write(f"# T-{ticket_id:03d}: Quick Fix Guide\n\n"
                        f"**Issue**: {title}\n\n"
                        f"**Track**: Track A (Lean)\n\n"
                        f"**Fix**: [Describe the specific fix needed]\n\n"
                        f"**Test**: [How to verify the fix works]\n\n"
                        f"**Files**: [List files to modify]\n")
    else:
        # Full structure - comprehensive documentation
        subdirs = ["requirements", "design", "planning", "implementation", "testing"]
        for subdir in subdirs:
            sub_path = os.path.join(ticket_dir, subdir)
            os.makedirs(sub_path, exist_ok=True)
            
            readme_path = os.path.join(sub_path, "README.md")
            with open(readme_path, "w", encoding="utf-8") as f:
                if subdir == "requirements":
                    f.write(f"# T-{ticket_id:03d}: {title} (Requirements)\n\n## Goal\n\n## User Story\n\n## Acceptance Criteria\n")
                elif subdir == "design":
                    f.write(f"# T-{ticket_id:03d}: Design Notes\n\n## Architecture\n\n## Reference Mockups\n\n## Data Models\n")
                elif subdir == "planning":
                    f.write(f"# T-{ticket_id:03d}: Implementation Plan\n\n## Breath 1: Database/Models\n- [ ] Task\n\n## Breath 2: Services/API\n- [ ] Task\n\n## Breath 3: UI\n- [ ] Task\n")
                elif subdir == "implementation":
                    f.write(f"# T-{ticket_id:03d}: Implementation Log\n\n")
                elif subdir == "testing":
                    f.write(f"# T-{ticket_id:03d}: Testing Strategy\n\n## Unit Tests\n\n## Integration Tests\n")

    # Create TRACK_DECISION.md with actual decision
    track_decision_path = os.path.join(ticket_dir, "TRACK_DECISION.md")
    with open(track_decision_path, "w", encoding="utf-8") as f:
        f.write(f"# Track Decision for T-{ticket_id:03d}\n\n"
                f"**Decision**: {track}\n\n"
                "**Reasoning**: Automated decision based on ticket title analysis using WORKFLOW_DECISION_GATE.md criteria\n\n"
                f"**Date**: {datetime.now().strftime('%Y-%m-%d')}\n"
                "**Decided by**: Bob Framework Decision Gate\n")

    # Create metadata.json with track information
    metadata = {
        "ticket_id": f"T-{ticket_id:03d}",
        "title": title,
        "source": source,
        "status": "draft",
        "track": track,
        "dependencies": [],
        "requirements_done": track == "Track B",  # Only Track B needs requirements phase
        "design_done": track == "Track B",        # Only Track B needs design phase
        "implementation_done": False,
        "tests_done": False,
        "ai_scoped": False,
        "metadata": {}
    }
    
    metadata_path = os.path.join(ticket_dir, "metadata.json")
    if not os.path.exists(metadata_path):
        with open(metadata_path, "w", encoding="utf-8") as f:
            json.dump(metadata, f, indent=2)

    print(f"Generated T-{ticket_id:03d}: {title} ({track})")

def determine_track(title):
    """Determine track based on title keywords"""
    track_b_indicators = [
        'database', 'schema', 'api', 'auth', 'payment', 'pii',
        'external', 'integration', 'migration', 'refactor',
        'architecture', 'new feature', 'implement', 'create'
    ]
    
    track_a_indicators = [
        'fix', 'bug', 'tweak', 'update', 'adjust', 'minor',
        'simple', 'small', 'single', 'validation', 'field'
    ]
    
    title_lower = title.lower()
    
    # Check for Track B indicators first
    for indicator in track_b_indicators:
        if indicator in title_lower:
            return "Track B"
    
    # Check for Track A indicators
    for indicator in track_a_indicators:
        if indicator in title_lower:
            return "Track A"
    
    # Default to Track B if uncertain
    return "Track B"

def main():
    parser = argparse.ArgumentParser(description="Instantly scaffold tickets for an Epic.")
    parser.add_argument("--epic", required=True, help="The name of the epic folder (e.g. 'epic-014-new-feature')")
    parser.add_argument("--tickets", required=False, nargs="+", help="List of 'ID:Title' strings. Example: '55:Create login screen' '56:Add auth endpoints'")
    parser.add_argument("--source", choices=["epic", "backlog"], default="epic", help="Source of tickets: 'epic' for explicit tickets or 'backlog' to import from backlog.md")
    parser.add_argument("--dry-run", action="store_true", help="Show what would be created without writing files")
    args = parser.parse_args()

    # Determine project root dynamically
    script_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.abspath(os.path.join(script_dir, "..")) if os.path.basename(script_dir) == ".agent" else script_dir

    EPICS_BASE = os.path.join(project_root, "web-applications", "project-management", "epics")
    EPICS_ROOT = os.path.join(project_root, "project-management", "epics")

    # Decide epic_path depending on source
    if args.source == 'backlog':
        epic_path = os.path.join(EPICS_BASE, 'backlog')
    else:
        epic_path = os.path.join(EPICS_BASE, args.epic)
    
    if not os.path.exists(epic_path):
        print(f"Epic folder not found: {epic_path}")
        print("Creating it now based on epic_template...")
        template_path = os.path.join(EPICS_ROOT, "epic_template")
        if os.path.exists(template_path):
            try:
                # Copy epic template but skip the generic 'tickets' folder to avoid junk
                shutil.copytree(template_path, epic_path, ignore=shutil.ignore_patterns('tickets'))
                os.makedirs(os.path.join(epic_path, "tickets"), exist_ok=True)
                print(f"Created epic folder: {os.path.basename(epic_path)}")
            except Exception as e:
                print(f"Failed to copy template: {e}")
                exit(1)
        else:
             print(f"Error: Could not find epic template at {template_path}")
             exit(1)

    print(f"Scaffolding tickets for {os.path.basename(epic_path)}... (source={args.source})")

    def read_backlog_entries(backlog_md_path, section_names=None):
        if section_names is None:
            section_names = ["Raw Ideas (Unscoped)", "UAT Bug Fixes"]
        if not os.path.exists(backlog_md_path):
            print(f"Backlog file not found: {backlog_md_path}")
            return []
        entries = []
        with open(backlog_md_path, 'r', encoding='utf-8') as f:
            lines = f.readlines()

        current_section = None
        section_pattern = re.compile(r'^#{1,6}\s*(.*)')
        list_item_pattern = re.compile(r'^\s*[-*+]\s+(.*)')

        for line in lines:
            m = section_pattern.match(line)
            if m:
                heading = m.group(1).strip()
                # normalize
                for s in section_names:
                    if heading.lower().startswith(s.split('(')[0].strip().lower()):
                        current_section = s
                        break
                else:
                    current_section = None
                continue

            if current_section:
                lm = list_item_pattern.match(line)
                if lm:
                    entry = lm.group(1).strip()
                    # remove markdown checkboxes if present
                    entry = re.sub(r'^\[.?\]\s*', '', entry)
                    entries.append(entry)
                else:
                    # stop on next non-list, non-blank line
                    if line.strip() == '':
                        continue
        return entries

    def get_next_ticket_id(epic_tickets_dir):
        max_id = 0
        if os.path.exists(epic_tickets_dir):
            for name in os.listdir(epic_tickets_dir):
                # folders named T-001 or files T-001.md
                m = re.match(r'T-(\d{1,})', name)
                if m:
                    try:
                        n = int(m.group(1))
                        if n > max_id:
                            max_id = n
                    except:
                        pass
        return max_id + 1

    tickets_to_create = []

    if args.source == 'backlog':
        backlog_path = os.path.join(project_root, 'web-applications', 'project-management', 'backlog', 'backlog.md')
        entries = read_backlog_entries(backlog_path)
        if not entries:
            print('No backlog entries found in target sections.')
            exit(0)
        tickets_dir_parent = os.path.join(epic_path, 'tickets')
        os.makedirs(tickets_dir_parent, exist_ok=True)
        next_id = get_next_ticket_id(tickets_dir_parent)
        for e in entries:
            tickets_to_create.append((next_id, e))
            next_id += 1
    else:
        # source == epic
        if not args.tickets:
            print('No tickets provided. Use --tickets when source=epic.')
            exit(1)
        for ticket_data in args.tickets:
            try:
                parts = ticket_data.split(":", 1)
                ticket_id = int(parts[0])
                title = parts[1].strip()
                tickets_to_create.append((ticket_id, title))
            except Exception as e:
                print(f"Failed to parse ticket input '{ticket_data}'. Expected format 'ID:Title'. Error: {e}")

    # Create tickets
    for ticket_id, title in tickets_to_create:
        if args.dry_run:
            print(f"DRY RUN: Would generate T-{ticket_id:03d}: {title} in {epic_path}")
        else:
            # Determine track for all entries based on title
            track = determine_track(title)
            create_ticket(epic_path, ticket_id, title, source=args.source, track=track)

    print("Scaffolding complete.")

if __name__ == "__main__":
    main()

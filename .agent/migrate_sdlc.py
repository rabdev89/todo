import os
import argparse
import shutil
import json
from datetime import datetime

def generate_metadata_if_missing(ticket_path, ticket_id):
    metadata_path = os.path.join(ticket_path, "metadata.json")
    if not os.path.exists(metadata_path):
        metadata = {
            "ticket_id": f"T-{ticket_id:03d}" if isinstance(ticket_id, int) else ticket_id,
            "title": f"Migrated {ticket_id}",
            "status": "done",  # Assuming migrated legacy tickets are mostly done
            "dependencies": [],
            "requirements_done": True,
            "design_done": True,
            "implementation_done": True,
            "tests_done": False,
            "approved": True
        }
        with open(metadata_path, 'w', encoding='utf-8') as f:
            json.dump(metadata, f, indent=2)
        print(f"Generated missing metadata.json for {ticket_id}")

def create_epic_metadata(epic_path, epic_name):
    metadata_path = os.path.join(epic_path, "epic_metadata.json")
    if not os.path.exists(metadata_path):
        metadata = {
            "epic_id": epic_name,
            "title": epic_name.replace("-", " ").title(),
            "status": "in-progress",
            "created_at": datetime.now().isoformat()
        }
        with open(metadata_path, 'w', encoding='utf-8') as f:
            json.dump(metadata, f, indent=2)
        print(f"Generated epic_metadata.json for {epic_name}")

def main():
    parser = argparse.ArgumentParser(description="Migrate loose legacy tickets into formal Epic containers.")
    parser.add_argument("--source", required=True, help="Source directory containing loose ticket folders (e.g. 'project-management/tickets')")
    parser.add_argument("--epic", required=True, help="Target epic name to migrate into (e.g. 'epic-001-legacy')")
    parser.add_argument("--tickets", nargs="*", help="Specific folder names to move (e.g. 'T-001' 'T-002'). If omitted, moves ALL folders in source.")
    args = parser.parse_args()

    # Determine project root dynamically
    script_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.abspath(os.path.join(script_dir, "..")) if os.path.basename(script_dir) == ".agent" else script_dir
    
    source_dir = os.path.join(project_root, args.source)
    if not os.path.exists(source_dir):
        print(f"Error: Source directory does not exist -> {source_dir}")
        exit(1)

    target_epic_dir = os.path.join(project_root, "project-management", "epics", args.epic)
    target_tickets_dir = os.path.join(target_epic_dir, "tickets")
    
    os.makedirs(target_tickets_dir, exist_ok=True)
    create_epic_metadata(target_epic_dir, args.epic)

    # Determine which folders to move
    folders_to_move = args.tickets if args.tickets else [d for d in os.listdir(source_dir) if os.path.isdir(os.path.join(source_dir, d))]

    if not folders_to_move:
        print("No ticket folders found to migrate.")
        return

    print(f"Migrating {len(folders_to_move)} tickets into {args.epic}...")

    for folder_name in folders_to_move:
        src_folder = os.path.join(source_dir, folder_name)
        dest_folder = os.path.join(target_tickets_dir, folder_name)

        if not os.path.exists(src_folder):
            print(f"Warning: {folder_name} not found in source. Skipping.")
            continue

        if os.path.exists(dest_folder):
            print(f"Warning: {folder_name} already exists in target Epic. Skipping move.")
            continue

        try:
            shutil.move(src_folder, dest_folder)
            print(f"Moved {folder_name} -> {args.epic}")
            
            # Post-move: Ensure metadata exists
            generate_metadata_if_missing(dest_folder, folder_name)
            
        except Exception as e:
            print(f"Failed to move {folder_name}: {e}")

    print("Migration complete. Run 'Audit Epic X against PRD' next to check for gaps!")

if __name__ == "__main__":
    main()

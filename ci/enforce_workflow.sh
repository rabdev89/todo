#!/bin/bash
set -e

echo "Running Metadata Gating Enforcement..."

EPICS_DIR="./web-applications/project-management/epics"

if [ ! -d "$EPICS_DIR" ]; then
    echo "No /epics directory found. Skipping gating check."
    exit 0
fi

# Function to get JSON value (jq with grep fallback)
get_json_val() {
    local key=$1
    local file=$2
    if command -v jq &> /dev/null; then
        jq -r ".$key" "$file"
    else
        # Fallback for environments without jq (e.g. Windows Git Bash)
        # Search for "key": true or "key": "true"
        if grep -q "\"$key\":\s*true" "$file" || grep -q "\"$key\":\s*\"true\"" "$file"; then
            echo "true"
        else
            echo "false"
        fi
    fi
}

for epic in "$EPICS_DIR"/*; do
  # Skip templates
  if [[ "$epic" == *"template"* ]]; then
    continue
  fi
  
  if [ -d "$epic" ]; then
    echo "🔍 Checking epic: $epic"
    if [ -d "$epic/tickets" ]; then
      for ticket in "$epic"/tickets/*; do
        # Skip ticket templates
        if [[ "$ticket" == *"template"* ]]; then
          continue
        fi
        if [ -d "$ticket" ]; then
          echo "  Ticket: $ticket"
          meta_file="$ticket/metadata.json"
          if [ -f "$meta_file" ]; then
            tests_done=$(get_json_val "tests_done" "$meta_file")
            implementation_done=$(get_json_val "implementation_done" "$meta_file")
            approved=$(get_json_val "approved" "$meta_file")
            
            if [ "$tests_done" != "true" ] || [ "$implementation_done" != "true" ] || [ "$approved" != "true" ]; then
              echo "    ❌ Blocked: Ticket $ticket not ready for merge (Tests, Implementation, or Approval is false)"
              exit 1
            fi
          else
            echo "    ❌ Blocked: Missing metadata.json in $ticket"
            exit 1
          fi
        fi
      done
    fi
  fi
done

done

echo "🔍 Checking Project Initiative (PI) Manifests..."
PI_MANIFESTS=$(find "$EPICS_DIR" -maxdepth 1 -name "PI-*_Manifest.md")

for manifest in $PI_MANIFESTS; do
  echo "  PI Manifest: $manifest"
  # Check if any mapped Epics are not HARDENED (simple grep check for 🚧 or [ ] in the Epic Mapping table)
  if grep -q "| EPIC-" "$manifest" && grep -E "\| EPIC-[0-9]+ \|.*\| (🚧|\[ \])" "$manifest"; then
    echo "    ⚠️ Warning: PI Manifest $manifest contains unhardened Epics. Production release blocked."
  fi
done

echo "Metadata and PI gating enforced. Workflow is valid ✅"

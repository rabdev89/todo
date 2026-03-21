#!/bin/bash
# Automates the creation of RELEASE_NOTES.md and suggests versioning.

set -e

echo "Starting Release Preparation Scaffolding..."

EPIC_PATH=$1

if [ -z "$EPIC_PATH" ]; then
    echo "❌ Error: Please provide the path to the Epic (e.g., web-applications/project-management/epics/epic-001-user-profile)"
    exit 1
fi

RELEASE_NOTES="$EPIC_PATH/RELEASE_NOTES.md"

if [ -f "$RELEASE_NOTES" ]; then
    echo "⚠️  $RELEASE_NOTES already exists. Skipping creation."
else
    echo "Creating $RELEASE_NOTES template..."
    cat <<EOF > "$RELEASE_NOTES"
# Release Notes: $(basename "$EPIC_PATH")

## 🚀 What's New
- Feature A
- Feature B

## 🛡️ Security & Hardening
- Threat Model verified
- API Contracts locked
- Local CI passed

## 🧪 Verification Results
- E2E User Journey tested
- Staging smoke test results

## 🏷️ Suggested Version
$(date +%Y.%m.%d)-stable
EOF
    echo "Draft $RELEASE_NOTES created ✅"
fi

echo "Release Prep Completed."

#!/bin/bash
set -e

# NOTE: This script is intended to be run from inside the specific EPIC folder (e.g., /epics/epic-001/)

echo "======================================"
echo "🛡️ Running Epic-Level CI Check"
echo "======================================"

# Determine the project root (assuming this script is in /epics/epic-name/)
ROOT_DIR=$(cd ../../../ && pwd)

echo "➡️ Running Global Pipeline Validation..."
bash "$ROOT_DIR/ci/pipeline.sh"

echo "======================================"
echo "✅ Epic Validation Passed. Ready for Delivery Phase."
echo "======================================"

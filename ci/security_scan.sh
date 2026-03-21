#!/bin/bash
set -e

# Source the dynamic CI configuration
source "$(dirname "$0")/ci_config.sh"

echo "Running Dependency Security Scan..."

# 1. Frontend
echo "--- Scanning Frontend ---"
cd "$ROOT_DIR/$FE_DIR" || exit 1
eval "$FE_SECURITY_CMD"

# 2. Backend
echo "--- Scanning Backend ---"
cd "$ROOT_DIR/$BE_DIR" || exit 1
echo "Running Security Scanner..."
eval "$BE_SECURITY_CMD"

echo "Security Scan Passed ✅"

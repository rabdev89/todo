#!/bin/bash
set -e

# Source the dynamic CI configuration
source "$(dirname "$0")/ci_config.sh"

echo "Running Unit Tests..."

# 1. Frontend
echo "--- Testing Frontend ---"
cd "$ROOT_DIR/$FE_DIR" || exit 1
eval "$FE_TEST_CMD"

# 2. Backend
echo "--- Testing Backend ---"
cd "$ROOT_DIR/$BE_DIR" || exit 1
eval "$BE_TEST_CMD"

echo "Tests Passed ✅"

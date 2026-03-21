#!/bin/bash
set -e

# Source the dynamic CI configuration
source "$(dirname "$0")/ci_config.sh"

echo "Running static analysis (Lint)..."

# 1. Frontend
echo "--- Checking Frontend ---"
cd "$ROOT_DIR/$FE_DIR" || exit 1
eval "$FE_LINT_CMD"

# 2. Backend
echo "--- Checking Backend ---"
cd "$ROOT_DIR/$BE_DIR" || exit 1
echo "Running Backend Linter..."
eval "$BE_LINT_CMD"
echo "Running Typechecker..."
eval "$BE_TYPECHECK_CMD"

echo "Lint Passed ✅"

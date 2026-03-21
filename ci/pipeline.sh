#!/bin/bash
set -e

echo "======================================"
echo "🚀 Starting Local CI Validation Pipeline"
echo "======================================"

# Ensure scripts are executed from the project root
ROOT_DIR=$(pwd)

# Parse arguments
BUILD_ENABLED=false
for arg in "$@"; do
    if [ "$arg" == "--build=true" ]; then
        BUILD_ENABLED=true
    fi
done

echo "➡️ Running Unified Quality Checks..."
bash "$ROOT_DIR/ci/quality_check.sh"

echo "➡️ Running TODO/FIXME Comment Check..."
bash "$ROOT_DIR/ci/todo_check.sh"

echo "➡️ Running Environment Validation..."
bash "$ROOT_DIR/ci/env_validation.sh"

if [ "$BUILD_ENABLED" = true ]; then
    echo "➡️ Running Build Verification..."
    bash "$ROOT_DIR/ci/build.sh"
else
    echo "⏭️ Skipping Build Verification (use --build=true to enable)"
fi

echo "======================================"
echo "✅ CI Pipeline Completed Successfully"
echo "======================================"

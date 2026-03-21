#!/bin/bash
# Tech-agnostic Build check script.

set -e

echo "Running Build Verification..."

# Source the dynamic CI configuration to get APP_DIR and BUILD_CMD
source "$(dirname "$0")/ci_config.sh"

# Navigate to the dynamic application directory
cd "$APP_DIR" || { echo "❌ Application directory '$APP_DIR' not found. Please update ci/ci_config.sh."; exit 1; }

# Run the generic build command defined in the config
if [ -n "$BUILD_CMD" ]; then
    eval "$BUILD_CMD"
    echo "Build Verification Passed ✅"
else
    echo "⚠️ No BUILD_CMD defined in ci_config.sh. Skipping."
fi

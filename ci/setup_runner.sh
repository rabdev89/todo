#!/bin/bash
# Tech-agnostic runner setup script for CI/CD.

set -e

source "$(dirname "$0")/ci_config.sh"

echo "Checking environment for $LINT_CMD..."

# Run the project-defined setup command
if [ -n "$FE_SETUP_CMD" ]; then
    echo "Running FE_SETUP_CMD: $FE_SETUP_CMD"
    eval "$FE_SETUP_CMD"
fi

# Run the project-defined setup command
if [ -n "$BE_SETUP_CMD" ]; then
    echo "Running BE_SETUP_CMD: $BE_SETUP_CMD"
    eval "$BE_SETUP_CMD"
fi



echo "Runner setup complete ✅"

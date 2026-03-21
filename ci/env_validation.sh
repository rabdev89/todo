#!/bin/bash
set -e

# Source the dynamic CI configuration
source "$(dirname "$0")/ci_config.sh"

echo "Running Environment Configuration Validation..."

# Hardened Secret Check (Add your project's required secrets here)
REQUIRED_VARS=(
    "DATABASE_URL"
    "SUPABASE_URL"
    "SUPABASE_ANON_KEY"
)

MISSING_VARS=()
for VAR in "${REQUIRED_VARS[@]}"; do
    if [ -z "${!VAR}" ]; then
        MISSING_VARS+=("$VAR")
    fi
done

if [ ${#MISSING_VARS[@]} -ne 0 ]; then
    echo "❌ Missing required environment variables: ${MISSING_VARS[*]}"
    echo "Please set these in your local environment or GitHub Secrets."
    exit 1
fi

# Navigate to the dynamic application directory
cd "$APP_DIR" || { echo "❌ Application directory '$APP_DIR' not found. Please update ci/ci_config.sh."; exit 1; }

# Run the generic environment validation command defined in the config
if [ -n "$ENV_VALIDATION_CMD" ] && [ "$ENV_VALIDATION_CMD" != "echo 'Environment validation passed'" ]; then
    eval "$ENV_VALIDATION_CMD"
    echo "Framework-specific Validation Passed ✅"
else
    echo "Environment Secrets Verified ✅"
fi

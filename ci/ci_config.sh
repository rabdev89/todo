# Configuration file for the Local CI Pipeline.
# This script reads `web-applications/tech_stack.json` to dynamically map commands.

CONFIG_FILE="web-applications/tech_stack.json"

if [ -f "$CONFIG_FILE" ]; then
    # Parse the JSON config using python to ensure broad compatibility
    export FE_DIR=$(python -c "import json; print(json.load(open('$CONFIG_FILE'))['frontend'].get('directory', ''))" 2>/dev/null)
    FE_STACK=$(python -c "import json; print(json.load(open('$CONFIG_FILE'))['frontend'].get('stack', ''))" 2>/dev/null)

    export BE_DIR=$(python -c "import json; print(json.load(open('$CONFIG_FILE'))['backend'].get('directory', ''))" 2>/dev/null)
    BE_STACK=$(python -c "import json; print(json.load(open('$CONFIG_FILE'))['backend'].get('stack', ''))" 2>/dev/null)
else
    echo "Warning: tech_stack.json not found. Falling back to default."
    export FE_DIR="web-applications/frontend-app"
    FE_STACK="npm"
    export BE_DIR="web-applications/backend-service"
    BE_STACK="npm"
fi

# ==========================================
# Frontend Stack Mapping
# ==========================================
if [[ "$FE_STACK" == "flutter" ]]; then
    export FE_LINT_CMD="flutter analyze"
    export FE_TEST_CMD="flutter test"
    export FE_BUILD_CMD="flutter build web"
    export FE_SECURITY_CMD="flutter pub outdated"
    export FE_SETUP_CMD="flutter pub get"
else
    # Default NPM/Node (React, Vue, Next JS, etc)
    export FE_LINT_CMD="npm run lint"
    export FE_TEST_CMD="npm run test"
    export FE_BUILD_CMD="npm run build"
    export FE_SECURITY_CMD="npm audit"
    export FE_SETUP_CMD="npm install"
fi

# ==========================================
# Backend Stack Mapping
# ==========================================
if [[ "$BE_STACK" == "python"* ]]; then
    export BE_LINT_CMD="./venv/Scripts/python.exe -m ruff check ."
    export BE_TYPECHECK_CMD="./venv/Scripts/python.exe -m mypy app"
    export BE_TEST_CMD="./venv/Scripts/python.exe -m pytest tests/"
    export BE_SECURITY_CMD="./venv/Scripts/python.exe -m bandit -r app"
    export BE_SETUP_CMD="./venv/Scripts/pip install -r requirements.txt"
else
    # Default NPM/Node (Express, NestJS, etc)
    export BE_LINT_CMD="npm run lint"
    export BE_TYPECHECK_CMD="npm run typecheck"
    export BE_TEST_CMD="npm run test"
    export BE_SECURITY_CMD="npm run scan"
    export BE_SETUP_CMD="npm install"
fi

# Legacy compatibility (optional)
export APP_DIR="$FE_DIR"
export LINT_CMD="$FE_LINT_CMD"
export TEST_CMD="$FE_TEST_CMD"

# Verification Gate
# Run: bash ci/verify.sh            → Layer 1 (80% threshold)
# Run: bash ci/verify.sh --layer2   → Layer 2 (90% threshold)
# Run: bash ci/verify.sh --layer3   → Layer 3 (100% threshold)

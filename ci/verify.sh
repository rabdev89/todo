#!/usr/bin/env bash
# =============================================================================
# verify.sh — Execution Verification Script
# AI Assisted Development — Layer 1 & Layer 2 CI Gate
#
# Usage:
#   ./ci/verify.sh            → runs Layer 1 checks (ticket-level)
#   ./ci/verify.sh --layer2   → runs Layer 1 + Layer 2 checks (epic-level)
#   ./ci/verify.sh --score    → outputs final score and exits (no remediation prompts)
#
# Exit codes:
#   0 = PASS
#   1 = FAIL (score below threshold)
#   2 = ERROR (script could not complete a check)
# =============================================================================

set -euo pipefail

# ── Config ────────────────────────────────────────────────────────────────────
LAYER=1
SCORE_ONLY=false
PASS_THRESHOLD_L1=56
PASS_THRESHOLD_L2=63
MAX_SCORE=70
SCORE=0
FAILED_CHECKS=()
TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')
LOG_FILE="activity-log.md"

# ── Argument parsing ──────────────────────────────────────────────────────────
for arg in "$@"; do
  case $arg in
    --layer2) LAYER=2 ;;
    --score)  SCORE_ONLY=true ;;
  esac
done

THRESHOLD=$( [ "$LAYER" -eq 2 ] && echo $PASS_THRESHOLD_L2 || echo $PASS_THRESHOLD_L1 )

# ── Helpers ───────────────────────────────────────────────────────────────────
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

pass() { echo -e "  ${GREEN}✔${NC} $1"; }
fail() { echo -e "  ${RED}✘${NC} $1"; FAILED_CHECKS+=("$1"); }
warn() { echo -e "  ${YELLOW}⚠${NC}  $1"; }
section() { echo -e "\n${CYAN}▶ $1${NC}"; }

add_score() { SCORE=$((SCORE + $1)); }

run_check() {
  local description="$1"
  local points="$2"
  local command="$3"

  if eval "$command" &>/dev/null; then
    pass "$description (+$points pts)"
    add_score "$points"
  else
    fail "$description (0 / $points pts)"
  fi
}

# ── Header ────────────────────────────────────────────────────────────────────
echo ""
echo "════════════════════════════════════════════════════"
echo "  VERIFICATION GATE — Layer $LAYER CI Run"
echo "  $TIMESTAMP"
echo "════════════════════════════════════════════════════"

# ── Section B: Code Quality ───────────────────────────────────────────────────
section "Section B — Code Quality"

# B1: TypeScript check (3 pts)
if command -v tsc &>/dev/null; then
  run_check "TypeScript compiles cleanly (tsc --noEmit)" 3 "npx tsc --noEmit"
else
  warn "tsc not found — skipping TypeScript check (0 / 3 pts)"
  FAILED_CHECKS+=("TypeScript check — tsc not installed")
fi

# B2: Linter (3 pts)
if [ -f ".eslintrc.js" ] || [ -f ".eslintrc.json" ] || [ -f ".eslintrc.cjs" ] || [ -f "eslint.config.js" ]; then
  run_check "ESLint passes with zero errors" 3 "npx eslint . --max-warnings=9999 --quiet"
elif [ -f "biome.json" ]; then
  run_check "Biome lint passes" 3 "npx biome check ."
else
  warn "No linter config found — skipping lint check (0 / 3 pts)"
  FAILED_CHECKS+=("Lint check — no ESLint or Biome config found")
fi

# B3: No leftover console.log or debugger in source (2 pts)
SRC_DIRS=("src" "lib" "app" "packages")
SEARCH_DIRS=""
for d in "${SRC_DIRS[@]}"; do [ -d "$d" ] && SEARCH_DIRS="$SEARCH_DIRS $d"; done

if [ -n "$SEARCH_DIRS" ]; then
  if ! grep -rn "console\.log\|debugger" $SEARCH_DIRS --include="*.ts" --include="*.tsx" --include="*.js" &>/dev/null; then
    pass "No console.log or debugger statements in source (+2 pts)"
    add_score 2
  else
    COUNT=$(grep -rn "console\.log\|debugger" $SEARCH_DIRS --include="*.ts" --include="*.tsx" --include="*.js" 2>/dev/null | wc -l | tr -d ' ')
    fail "Found $COUNT console.log/debugger statement(s) in source (0 / 2 pts)"
  fi
else
  warn "No recognisable source directory found — skipping console.log check"
fi

# ── Section C: Testing ────────────────────────────────────────────────────────
section "Section C — Testing"

# C1 + C2: Run test suite (7 pts combined)
if [ -f "package.json" ] && grep -q '"test"' package.json; then
  if npm test -- --passWithNoTests 2>&1 | tee /tmp/test_output.txt | grep -q "passed\|PASS\|ok"; then
    pass "Test suite passes — no regressions (+4 pts)"
    add_score 4
    # C3: Check coverage if available
    if grep -q "coverage" /tmp/test_output.txt 2>/dev/null; then
      COVERAGE=$(grep -oP '\d+(?=%)' /tmp/test_output.txt | tail -1)
      if [ -n "$COVERAGE" ] && [ "$COVERAGE" -ge 80 ]; then
        pass "Code coverage ≥ 80% (${COVERAGE}%) (+3 pts)"
        add_score 3
      else
        fail "Code coverage below 80% (${COVERAGE:-unknown}%) (0 / 3 pts)"
      fi
    else
      warn "Coverage data not found in test output — skipping coverage check (0 / 3 pts)"
    fi
  else
    fail "Test suite has failures (0 / 7 pts)"
  fi
else
  warn "No test script found in package.json — skipping tests (0 / 7 pts)"
  FAILED_CHECKS+=("Tests — no test script in package.json")
fi

# ── Section D: Security ───────────────────────────────────────────────────────
section "Section D — Security & Safety"

# D1: No secrets committed (4 pts)
SECRET_PATTERNS="(API_KEY|SECRET|PASSWORD|TOKEN|PRIVATE_KEY)\s*=\s*['\"][^'\"]{8,}"
if ! git diff --cached --diff-filter=A -U0 2>/dev/null | grep -qP "$SECRET_PATTERNS"; then
  pass "No secrets detected in staged changes (+4 pts)"
  add_score 4
else
  fail "Potential secret detected in staged changes — review immediately (0 / 4 pts)"
fi

# D2: package-lock.json / yarn.lock present (signals dependency hygiene) (2 pts)
if [ -f "package-lock.json" ] || [ -f "yarn.lock" ] || [ -f "pnpm-lock.yaml" ]; then
  pass "Lock file present — dependency versions pinned (+2 pts)"
  add_score 2
else
  fail "No lock file found — dependencies are not pinned (0 / 2 pts)"
fi

# D3: No new deps without lock file update (1 pt)
if git diff --name-only 2>/dev/null | grep -q "package.json"; then
  if git diff --name-only 2>/dev/null | grep -qE "package-lock.json|yarn.lock|pnpm-lock.yaml"; then
    pass "package.json change accompanied by lock file update (+1 pt)"
    add_score 1
  else
    fail "package.json changed but no lock file updated (0 / 1 pt)"
  fi
else
  pass "No package.json changes — dependency check skipped (+1 pt)"
  add_score 1
fi

# ── Section E: Integration & Contracts (Layer 2 only) ────────────────────────
if [ "$LAYER" -eq 2 ]; then
  section "Section E — Integration & Contracts (Layer 2)"

  # E3: Playwright E2E (2 pts)
  if [ -f "playwright.config.ts" ] || [ -f "playwright.config.js" ]; then
    run_check "Playwright E2E tests pass" 2 "npx playwright test"
  else
    warn "No Playwright config found — skipping E2E check (0 / 2 pts)"
    FAILED_CHECKS+=("E2E tests — no playwright.config found")
  fi

  # E1 + E2: API contract check via TypeScript type check across packages (3 pts)
  if [ -d "packages" ]; then
    run_check "Shared package types compile without errors" 3 "npx tsc --noEmit --project packages/tsconfig.json"
  else
    warn "No packages/ directory — skipping API contract check (0 / 3 pts)"
  fi
fi

# ── Section F: Documentation ──────────────────────────────────────────────────
section "Section F — Documentation & Handoff"

# F1: activity-log.md has been updated today (2 pts)
if [ -f "$LOG_FILE" ]; then
  TODAY=$(date '+%Y-%m-%d')
  if grep -q "$TODAY" "$LOG_FILE"; then
    pass "activity-log.md updated today (+2 pts)"
    add_score 2
  else
    fail "activity-log.md not updated today (0 / 2 pts)"
  fi
else
  fail "activity-log.md not found (0 / 2 pts)"
fi

# F2: .env.example present if .env exists (1 pt)
if [ -f ".env" ]; then
  if [ -f ".env.example" ]; then
    pass ".env.example is present (+1 pt)"
    add_score 1
  else
    fail ".env exists but .env.example is missing (0 / 1 pt)"
  fi
else
  pass "No .env file — .env.example check skipped (+1 pt)"
  add_score 1
fi

# ── Final Score ───────────────────────────────────────────────────────────────
echo ""
echo "════════════════════════════════════════════════════"
echo "  FINAL SCORE: $SCORE / $MAX_SCORE"
echo "  THRESHOLD:   $THRESHOLD / $MAX_SCORE ($([ "$LAYER" -eq 2 ] && echo "90% — Layer 2 Epic" || echo "80% — Layer 1 Ticket"))"
echo "════════════════════════════════════════════════════"

if [ "$SCORE" -ge "$THRESHOLD" ]; then
  echo -e "  ${GREEN}✔ GATE PASSED${NC}"
  RESULT="PASS"
else
  echo -e "  ${RED}✘ GATE FAILED${NC}"
  RESULT="FAIL"
  echo ""
  echo "  Failed checks:"
  for check in "${FAILED_CHECKS[@]}"; do
    echo -e "    ${RED}•${NC} $check"
  done
fi

# ── Write to activity log ─────────────────────────────────────────────────────
if [ "$SCORE_ONLY" = false ] && [ -f "$LOG_FILE" ]; then
  cat >> "$LOG_FILE" << EOF

## 🔍 Verification Gate Run — $TIMESTAMP
- **Layer**: $LAYER
- **Score**: $SCORE / $MAX_SCORE
- **Result**: $RESULT
- **Failed checks**: ${#FAILED_CHECKS[@]}
EOF
fi

echo ""
[ "$RESULT" = "PASS" ] && exit 0 || exit 1

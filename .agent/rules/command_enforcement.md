# Command Enforcement Rule

> **AI agents MUST follow the standardized command structure defined in engine/docs/ai_engine.md**

## Rule: Standardized Command Usage

When a user gives an instruction, AI agents **MUST**:

1. **Map the prompt** to the corresponding command from `engine/docs/ai_engine.md`
2. **Execute the exact commands** listed in `engine/docs/ai_engine.md`
3. **Verify completion** before proceeding to next step
4. **Report status** using standardized output format

---

## Enforcement Matrix

| User Says | AI Must Execute | Verification |
|-----------|-----------------|--------------|
| "Install the framework" | `make install` → `make test` | Check `framework-health.json` |
| "Start working" | `make start` → `ai-engine session start` | Export `AI_SESSION_ID` |
| "Index the repo" | `ai-engine index-repo --parallel` | Show file count indexed |
| "Research T-XXX" | `ai-engine research T-XXX` | Output `RESEARCH.md` in ticket folder |
| "Run T-XXX" | `ai-engine run T-XXX` | Finalize with complete SDLC loop |
| "Check status" | `ai-engine status T-XXX` | Show metadata and current phase |
| "Validate changes" | `ai-engine validate T-XXX` | Show score ≥56/70 |

---

## Prohibited Actions

AI agents **MUST NOT**:

1. ❌ **Invent new commands** not in `AGENTS_COMMANDS_INDEX.md`
2. ❌ **Skip verification steps** in command sequences
3. ❌ **Use hardcoded paths** when commands support `--path` flags
4. ❌ **Assume service status** without running `make status`
5. ❌ **Proceed without session** when `AI_SESSION_ID` should be set

---

## Required Pre-Flight Checks

Before executing any command sequence:

```bash
# 1. Check framework health (if not done in last hour)
if [ ! -f .agent/flags/last-status-check.txt ] || \
   [ $(find .agent/flags/last-status-check.txt -mmin +60) ]; then
    make status > .agent/flags/last-status-check.txt
fi

# 2. Verify required services
# - Qdrant must be running for indexing/search
# - Ollama must be running for embeddings
# - Session must be active for learning

# 3. Ensure session context
if [ -z "$AI_SESSION_ID" ]; then
    ai-engine session start
    export AI_SESSION_ID=$(ai-engine session list -n 1 | head -1)
fi
```

---

## Command Output Standards

### Success Format
```
✅ [Command]: [Brief result]
   Details: [Specific output]
   Next: [What happens next]
```

### Failure Format
```
❌ [Command]: [Error summary]
   Reason: [Why it failed]
   Fix: [Command to resolve]
```

### Verification Format
```
🔍 Verification: [Check name]
   Expected: [Expected result]
   Actual: [Actual result]
   Status: [PASS/FAIL]
```

---

## Mandatory Command Sequences

### Repository Work Flow
```
START:   make status → Ensure services running
         ↓
INDEX:   ai-engine index-repo --parallel
         ↓
SESSION: ai-engine session start
         export AI_SESSION_ID=<id>
         ↓
RESEARCH: ai-engine research T-XXX
         ↓
VALIDATE: ai-engine validate T-XXX
          bash ci/verify.sh
```

### Epic Hardening Flow
```
VERIFY:  Check all tickets status: done
         ↓
STEP 1:  bash ci/pipeline.sh
         ↓
STEP 2:  Create threat_model.md
         ↓
STEP 3:  Create api_contract.md
         ↓
STEP 4:  Database sync + seed
         ↓
STEP 5:  E2E journey walkthrough
         ↓
STEP 6:  git tag vX.Y.Z
         ↓
STEP 7:  python packages/code-quality-checking/quality-check.py --mode epic
         ↓
STEP 8:  bash ci/verify.sh --layer2
         ↓
FINAL:   Mark Epic status: HARDENED
```

### Daily Startup Flow
```
HEALTH:  make test → Review framework-health.json
         ↓
START:   make start → Ensure all services running
         ↓
SESSION: ai-engine session list → Find or create session
         export AI_SESSION_ID=<active-session-id>
         ↓
READY:   ai-engine next → List tickets ready for execution
```

---

## Health Check Protocol

AI agents **MUST** run health checks in these scenarios:

| Scenario | Command | Log Location |
|----------|---------|--------------|
| Start of day | `make test` | `.agent/flags/health-check-$(date +%Y%m%d).txt` |
| Before indexing | `make status` | `.agent/flags/pre-index-check.txt` |
| After service restart | `make test` | `.agent/flags/post-restart-check.txt` |
| Every hour (automated) | `make status` | `.agent/flags/last-status-check.txt` |

---

## Error Recovery Protocol

When a command fails:

### 1. Identify Error Type
- **Service down** → `make start` → retry
- **Missing index** → `ai-engine index-repo --reset --parallel`
- **Session invalid** → `ai-engine session start` → retry
- **Permission denied** → Check file permissions → retry

### 2. Log Failure
```bash
echo "$(date): [Command] failed with [Error]" >> .agent/flags/error-log.txt
```

### 3. Circuit Breaker Check
If same command fails twice consecutively:
- Stop execution
- Report to user
- Suggest manual intervention

---

## Documentation References

AI agents **MUST** consult these files when uncertain:

- **Commands**: `AGENTS_COMMANDS_INDEX.md`
- **Prompts**: `AGENTS_PROMPTS_INDEX.md`
- **Workflows**: `AGENTS_COMMANDS_GUIDE.md`
- **Human Guide**: `HUMAN.md`
- **Agent Rules**: `.agent/rules/`

---

## Compliance Checklist

Before marking any task complete:

- [ ] Commands executed match `AGENTS_COMMANDS_INDEX.md`
- [ ] Verification steps completed
- [ ] Health checks logged to `.agent/flags/`
- [ ] Session context established (if required)
- [ ] Output formatted per standards above
- [ ] Errors logged with recovery attempted

---

## Violation Reporting

If AI agent cannot follow this rule:

1. Explain **which command** is missing/unclear
2. Reference **specific documentation** that should exist
3. Suggest **alternative approach** using existing commands
4. Log violation to `.agent/flags/command-violations.txt`

---

> **Enforcement**: This rule is mandatory. AI agents that deviate from standardized commands without justification violate the framework contract.

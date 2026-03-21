# IDE-SPECIFIC RULE: Mandatory Repo Data Consultation for Ticket Scoping

## Rule ID: IDE-REPO-DATA-001

## Scope
Applies to ALL ticket scoping activities within the IDE environment.

## Mandatory Process Flow

### Step 1: Pre-Scoping Repo Data Analysis (MANDATORY)
Before ANY ticket scoping work begins, agent MUST:

1. **Check if repo_data exists**:
   - Check if `web-applications/repo_data/` directory exists
   - If directory does NOT exist, run: `npm run make:setup-index`
   - Wait for repo_data generation to complete

2. **Read repo_data files** in this order:
   - `web-applications/repo_data/files.json` (first 100 lines)
   - `web-applications/repo_data/imports.json` (first 100 lines) 
   - `web-applications/repo_data/chunks.json` (first 100 lines)

3. **Search repo_data for ticket keywords**:
   - Use `grep_search` on repo_data directory
   - Search for all relevant terms from ticket title
   - Show match count and affected file IDs

4. **Present repo_data analysis to user**:
   - Show exact number of files affected
   - List specific components/modules identified
   - Wait for user confirmation before proceeding

### Step 2: User Approval Gate
Agent MUST pause and wait for explicit user approval:
```
"Repo data analysis complete. Found X affected files. 
Ready to proceed with scoping based on this analysis. 
Please confirm: [Y/N]"
```

### Step 3: Proceed with Scoping
Only after user approval may agent proceed with:
- Manual decision gate
- Documentation creation
- Track assignment

## Enforcement Mechanisms

### Hard Stops
- If repo_data directory does not exist, run `npm run make:setup-index` before proceeding
- If repo_data files cannot be read after generation, STOP and report error
- If repo_data analysis shows >3 files affected, MUST assign Track B
- If user does not approve, STOP and wait for further instructions

### Proof of Compliance
Agent must show:
1. Repo data existence check and generation if needed
2. Repo data file read outputs
3. Grep search results with counts
4. User approval confirmation
5. How repo_data influenced scoping decisions

## Violation Handling
If agent violates this rule:
1. Immediately stop current work
2. Report violation to user
3. Re-start process from Step 1
4. Document what was missed and correction applied

## Priority Level: CRITICAL
This rule overrides all general instructions and workflow preferences.
User-specific IDE rules take precedence over general agent guidelines.

## Implementation Status
- ✅ Rule created in .windsurf/ide-rules/
- ⏳ Awaiting agent compliance enforcement
- 🔄 Will be automatically loaded for IDE sessions

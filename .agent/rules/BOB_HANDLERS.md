# BOB Handler Rules & Step Definitions

> Agent reference guide: What to do at each workflow step, what files to check, what input is needed.

---

## Product Definition Phase

### Step 1: vision_generation
**Status**: `DONE` - Continue to next step  
**Handler**: `generateVisionDocument`

**What it does**:
- Checks if `web-applications/project-management/vision_details.json` exists
- If exists → reads it, generates `vision.md`, returns success
- If missing → returns `requires_ai_input: true`

**If you see `requires_ai_input: true`**:
- Read the `ai_prompt` in the response
- Interview user for: problem, solution, target users, features, metrics, timeline
- Create `vision_details.json` with the collected data
- Call `/bob` again

**Success indicator**: ✅ `vision.md` is generated in `project-management/`

---

### Step 2: vision_review
**Status**: `WAITING` - User approval needed  
**Handler**: `userReviewVision`

**What it does**:
- Checks if `vision.md` exists and was generated
- Waits for explicit user approval before advancing

**What agent needs to do**:
1. Show user the generated `vision.md` file
2. Ask: "Does this vision match your project goals? (yes/no)"
3. **If YES**: 
   - Create/update `web-applications/project-management/vision_approval.json`:
     ```json
     {
       "approved": true,
       "approved_by": "user",
       "approved_at": "2026-03-10T...",
       "notes": "optional user feedback"
     }
     ```
   - Call `/bob` to advance
4. **If NO**:
   - Ask user what needs to change
   - Update `vision_details.json` accordingly
   - Call `/bob` to regenerate `vision.md`
   - Return to vision_review for re-approval

**Success indicator**: ✅ `vision_approval.json` exists with `approved: true`

---

### Step 3: user_flow_creation
**Status**: `PENDING` - User flow interview  
**Handler**: `generateUserFlow`

**What it does**:
- Checks if `web-applications/project-management/user_flow_details.json` exists
- If exists → generates `user_flow.md`, returns success
- If missing → returns `requires_ai_input: true`

**If you see `requires_ai_input: true`**:
- Interview user for:
  1. **Overview**: High-level user journey description
  2. **User Stories**: List of personas and their goals
  3. **Screen Flow**: Sequence of screens/pages in the app
  4. **Flow Diagram**: Visual flow (optional, can use Mermaid)
- Create `user_flow_details.json` with structure:
  ```json
  {
    "overview": "...",
    "user_stories": [
      {
        "persona": "Parent",
        "goal": "Create and manage activities",
        "flow": "Login → Dashboard → Create Activity → Save"
      }
    ],
    "screen_flow": ["Login", "Dashboard", "Create Activity", "Activity Library"],
    "flow_diagram": "mermaid syntax (optional)"
  }
  ```
- Call `/bob` again

**Success indicator**: ✅ `user_flow.md` is generated

---

### Step 4: user_flow_validation
**Status**: `PENDING` - Same as vision_review  
**Handler**: `validateUserFlow`

**What it does**:
- Checks if `user_flow.md` exists
- Waits for user approval

**What agent needs to do**:
1. Show user the generated `user_flow.md`
2. Ask: "Does this user flow make sense? (yes/no)"
3. **If YES**:
   - Create `user_flow_approval.json`:
     ```json
     {
       "approved": true,
       "approved_by": "user",
       "approved_at": "2026-03-10T..."
     }
     ```
   - Call `/bob` to advance
4. **If NO**:
   - Update `user_flow_details.json`
   - Call `/bob` to regenerate

**Success indicator**: ✅ `user_flow_approval.json` exists with `approved: true`

---

### Step 5: requirements_alignment
**Status**: `PENDING` - Requirements interview  
**Handler**: `generateRequirements`

**What it does**:
- Checks if `web-applications/project-management/requirements_details.json` exists
- If exists → generates `requirements.md`, returns success
- If missing → returns `requires_ai_input: true`

**If you see `requires_ai_input: true`**:
- Interview user for:
  1. **Functional Requirements**: What features MUST the app have?
  2. **Non-Functional Requirements**: Performance, security, scalability, reliability targets
  3. **Technical Requirements**: Tech stack, frameworks, databases, APIs
- Create `requirements_details.json`:
  ```json
  {
    "functional_requirements": [
      {
        "id": "FR-001",
        "name": "User Authentication",
        "description": "Parents must log in with email/password",
        "priority": "high",
        "acceptance_criteria": ["Login page works", "Session persists"]
      }
    ],
    "non_functional_requirements": [
      {
        "name": "Performance",
        "target": "Page load < 2 seconds",
        "priority": "high"
      }
    ],
    "technical_requirements": {
      "frontend": "Flutter",
      "backend": "TBD",
      "database": "TBD"
    }
  }
  ```
- Call `/bob` again

**Success indicator**: ✅ `requirements.md` is generated

---

## Critical Rules for All Agents

### 1. Never modify `framework_status.json` directly
- ONLY `/bob` engine updates workflow state
- Agent's job is to collect user input and create SEPARATE config files

### 2. Config file naming convention
- `{step_name}_details.json` = User input during collection
- `{step_name}_approval.json` = Approval gate completed
- Example: `vision_details.json`, `vision_approval.json`

### 3. When handler returns `requires_ai_input: true`
- Look at the `ai_prompt` field (already formatted for you)
- Don't invent your own prompts - use what the handler provides
- Collect data → Create config file → Call `/bob`

### 4. When handler returns `success: false` with no `requires_ai_input`
- This is an error state
- Check `error` field for what went wrong
- Report to user and ask how to proceed

### 5. Approval gates (vision_review, user_flow_validation, etc.)
- User provides YES/NO answer
- Create `{step_name}_approval.json` on approval
- Regenerate config file if user says NO
- Call `/bob` only AFTER approval granted

### 6. File locations (NEVER change these)
- All config files: `web-applications/project-management/`
- All generated docs: `web-applications/project-management/`
- Framework state: `web-applications/bob/framework_status.json` (read-only for agents)

---

## Quick Reference: What to do next

**Current status**: vision_review (waiting for approval)

**Next iteration should**:
1. Read `web-applications/project-management/vision.md`
2. Ask user: "Approve this vision? (yes/no)"
3. If YES → Create `vision_approval.json` → Call `/bob`
4. If NO → Modify `vision_details.json` → Call `/bob`

---

## File Checklist by Phase

### After vision_generation
- [ ] `vision_details.json` exists
- [ ] `vision.md` generated
- [ ] Ready for vision_review

### After vision_review (approved)
- [ ] `vision_approval.json` exists
- [ ] Move to user_flow_creation

### After user_flow_creation
- [ ] `user_flow_details.json` exists
- [ ] `user_flow.md` generated
- [ ] Ready for user_flow_validation

### After user_flow_validation (approved)
- [ ] `user_flow_approval.json` exists
- [ ] Move to requirements_alignment

### After requirements_alignment
- [ ] `requirements_details.json` exists
- [ ] `requirements.md` generated
- [ ] Complete product_definition phase

---

> **For developers**: These rules are enforced by Bob handlers. Agents should follow them to ensure smooth workflow progression.

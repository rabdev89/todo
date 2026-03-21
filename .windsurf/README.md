# IDE-Specific Rules

This directory contains IDE-specific rules that override general agent instructions.

## Rule Loading Priority
1. `.windsurf/ide-rules/` - IDE-specific rules (highest priority)
2. `.agent/rules/` - General agent rules
3. System instructions - Default behavior

## Current Rules

### TICKET_SCOPING_RULE.md
- **Rule ID**: IDE-REPO-DATA-001
- **Purpose**: Enforces mandatory repo_data consultation during ticket scoping
- **Status**: Active
- **Enforcement**: Hard stops and user approval gates

## Rule Structure
Each rule file contains:
- Rule ID and scope
- Mandatory process flow
- Enforcement mechanisms
- Violation handling
- Priority level

## Adding New Rules
1. Create rule file in `.windsurf/ide-rules/`
2. Follow the established structure
3. Include clear enforcement mechanisms
4. Set appropriate priority level

## Compliance
Agents must check this directory first before processing any requests that match rule scope.

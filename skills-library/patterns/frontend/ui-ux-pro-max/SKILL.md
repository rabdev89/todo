# SKILL: UI-UX Pro Max Design Intelligence

> **Intelligent design system generation and UI analytics.**

## Overview
UI-UX Pro Max provides a reasoning engine that matches product requirements against 161 industry-specific rules, 67 UI styles, and 161 color palettes. It automates the creation of high-fidelity, premium design specifications.

## Usage
The skill is automatically invoked by the **DesignAgent** during the `scopeTicket` phase. It can also be triggered manually.

### Manual Search
```bash
python scripts/search.py "<query>" --domain <domain>
```

### Design System Generation
```bash
python scripts/search.py "<query>" --design-system -f markdown
```

## Structure
- `data/`: Canonical CSV databases (styles, colors, typography, etc.)
- `scripts/`: Reasoning engine scripts (`search.py`, `design_system.py`)
- `templates/`: Platform-specific templates for Antigravity, Windsurf, Trae, etc.

## Best Practices
1. **Be Specific**: Include industry keywords (e.g., "fintech dashboard" instead of just "dashboard").
2. **Review Anti-Patterns**: Always check the "Anti-Patterns to Avoid" section in the generated `DESIGN.md`.
3. **Accessibility**: Ensure all recommendations respect WCAG AA contrast ratios.

---
*Status: Registered as Core Design Skill*

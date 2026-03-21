# SKILL: UI Design System Engineering

## Metadata
- **Category**: agents
- **Scope**: universal
- **Difficulty**: Complex
- **Last Updated**: 2026-03-09
- **Effectiveness**: High

## Problem
UI implementation often drifts from design intent or lacks consistency due to ad-hoc styling. This creates design debt, visual fragmentation, and poor accessibility (WCAG violations).

## Solution Overview
The **UI Designer Agent** bridges the gap between high-level requirements and pixel-perfect implementation by creating explicit UI specifications (`UI_SPEC.md`) and enforcing a coherent Design System (Tokens, Components, Patterns).

## Implementation

### Files to Create
| File | Purpose | Layer |
|------|---------|-------|
| `UI_SPEC.md` | Detailed UI specifications (layout, tokens, accessibility) | Design Handoff |
| `style_guide.md` | Living design system documentation (tokens, components) | Design System |

### Code Pattern (Design Tokens)
```css
/* Using Semantic Tokens (Avoid Hardcoded Values) */
.button-primary {
  /* BAD: background-color: #007bff; */
  background-color: var(--color-primary-main);
  /* BAD: padding: 10px 20px; */
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--radius-base);
}
```

### Key Principles
1.  **Consistency**: Reuse components and tokens; invent only when necessary.
2.  **Hierarchy**: Visual weight guides user attention (Color, Size, Spacing).
3.  **Accessibility**: WCAG AA compliance is non-negotiable (Contrast, Focus, semantics).
4.  **Responsiveness**: Mobile-first, fluid layouts.

## Variations

### Variation A: Component Architecture (Design Phase)
Define atomic components (Button, Input) -> Molecules (Form) -> Organisms (Page).
Focus on: Props, States (Hover/Focus/Disabled), Variants.

### Variation B: Interaction Design (Design Phase)
Define micro-interactions, transitions, loading states, and error feedback.

### Variation C: Visual Intelligence (Asset Generation)
Identify where the UI needs custom graphics, icons, or illustrations.
1.  **Requirement**: "Add a hero illustration showing a rocket."
2.  **Action**: Call `generate_image` tool.
3.  **Naming**: Save to `public/assets/images/[feature-name]/[asset-name].png`.
4.  **Refactor**: Update code to reference the generated asset.

## Integration

### With Other Skills
- **Planner**: Needs UI specs to break down tasks.
- **Executor**: Implements the specs using the design system.
- **Verifier**: Validates implementation against the `UI_SPEC.md`.

### Dependencies
- Access to `style_guide.md`, `user_flow.md`, and `PRD.md`.

## Examples

### Example 1: Login Form Specification
**Layout**: Centered card, max-width 400px.
**Tokens**: `bg-surface`, `shadow-md`, `text-primary`.
**Accessibility**: Inputs have `<label>`, errors linked via `aria-describedby`.

## Common Mistakes
- **Pixel-Pushing**: Using arbitrary values (e.g., `margin-top: 13px`) instead of system spacing.
- **Hidden Focus**: Removing outline on focus (`outline: none`) without replacement.
- **Color Reliance**: Conveying meaning only via color (e.g., red border for error) without text/icon.

## Validation Checklist
- [ ] Design uses established tokens/components.
- [ ] Responsive behavior defined (breakpoints).
- [ ] Accessibility requirements (contrast, ARIA) specified.
- [ ] All component states (hover, focus, empty, error, loading) covered.
- [ ] Custom visual assets generated and linked (images, icons, illustrations).

## References
- [Material Design](https://m3.material.io/)
- [WCAG 2.1 Guidelines](https://www.w3.org/TR/WCAG21/)

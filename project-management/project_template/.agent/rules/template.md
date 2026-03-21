# AI Agent Rules: [Domain/Technology Name] Template

## Context

This project uses a [Tech Stack, e.g., Flutter/React/Node.js] architecture. All agents must adhere to the best practices and established patterns defined here.

## Core Principles

- **Design Fidelity**: Always use the HTML/CSS mockups in `project-management/design/` as the visual source of truth. Translate CSS properties (colors, spacing, shadows) exactly into the project's styling system.
- **TDD (Test-Driven Development)**: Write failing tests before implementing features. Ensure 100% coverage for core business logic.
- **Clean Architecture**: Maintain a strict separation of concerns between [e.g., UI, Business Logic, and Data layers].

## Task Guidelines

- **Track A (Lean)**: [Definition for small tasks]
- **Track B (Full)**: [Definition for major features]

## Specific Rules

### 🛠 Development Workflow

1. [Rule 1]
2. [Rule 2]

### 🧪 Testing Standards

1. [Rule 1]
2. [Rule 2]

### 🎨 UI & UX Best Practices

1. **Faithful Translation**: Do not use "default" component styles if the mockup specifies custom tokens. Open the HTML/CSS mockups and extract exact values for:
   - `padding` / `margin`
   - `border-radius`
   - `box-shadow` (offsets, blur, spread, color)
   - `font-family` / `font-weight` / `line-height`
   - `linear-gradient` / `background-color`
2. **Micro-interactions**: Reference the `interaction_guide.md` for transitions and feedback.

## Key Files

- `VISION.md`: The goal.
- `PRD.md`: The roadmap.
- `FRD.md`: The capabilities.
- `DESIGN.md`: The visual guide.

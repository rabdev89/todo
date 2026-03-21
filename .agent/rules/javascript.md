# JavaScript/TypeScript Rules

Act as a top-tier software engineer with serious JavaScript/TypeScript discipline.

## Principles

- **Simplicity**: Remove the obvious, add the meaningful.
- **Functional**: Favor pure, composable functions.
- **Immutability**: Use `const`, spread, and rest operators.
- **SDA (Self Describing APIs)**: Explicitly name and express parameter values in signatures.

## Constraints

- One job per function; separate mapping from IO.
- Favor `map`, `filter`, `reduce` over manual loops.
- Avoid `class` and `extends` where possible; favor composition.
- Use concise syntax: arrow functions, destructuring, template literals.
- Modularize by feature; one concern per file.

## Naming

- Functions should be verbs (e.g., `increment()`).
- Predicates should be questions (e.g., `isActive`).
- Use active voice and clear, consistent naming.

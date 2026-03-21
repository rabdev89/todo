# Core Principles for AI-Assisted Development

**Universal principles** for all agents working in this codebase, regardless of tech stack or task type.

---

## 1. Simplicity First

- Remove the obvious, add the meaningful
- Prefer simple solutions over clever ones
- One job per function; separate concerns
- If it's hard to explain, reconsider the approach

## 2. Self-Describing Code

- Name functions as verbs (`increment()`, `validate()`)
- Name predicates as questions (`isActive()`, `hasPermission()`)
- Use clear, consistent naming across the codebase
- Comments should explain "why", not "what"

## 3. Immutability by Default

- Use `const`, not `let` or `var`
- Avoid mutating function parameters
- Prefer spread/rest operators for data transformation
- Treat state changes as explicit operations

## 4. Composition Over Inheritance

- Favor functional composition
- Avoid deep class hierarchies
- Reuse behavior through function composition
- Make dependencies explicit in function signatures

## 5. Testability Is Design

- Code that is hard to test is poorly designed
- Write tests as you write code (test-driven)
- Tests should answer: What is this? What should it do? What broke?
- Collocate tests with code unless directed otherwise

## 6. Errors Are Data

- Treat errors as values, not just exceptions
- Return meaningful error information
- Fail fast with clear messages
- Escalate only when you cannot fix autonomously

## 7. Explicit Over Implicit

- Make intent clear in code
- Avoid hidden side effects
- Document assumptions and constraints
- Configuration should not be magic

## 8. Separation of Concerns

- Keep input/output (I/O) separate from business logic
- Keep presentation separate from state
- Keep data transformation separate from communication
- One module per concern

---

## Applied to Common Scenarios

### Writing a Function
✓ Simple, named clearly, handles one job  
✓ Testable with clear inputs/outputs  
✓ Uses composition, not inheritance  
✗ Does multiple things  
✗ Has hidden side effects  
✗ Requires deep context to understand

### Testing Code
✓ Tests answer the 5 key questions  
✓ Clear setup, action, assertion  
✓ Independent tests (no shared state)  
✗ Tests that are hard to read  
✗ Shared fixtures causing test coupling  
✗ Tests that test implementation, not behavior

### Designing an API
✓ Clear inputs and outputs  
✓ Consistent naming patterns  
✓ Explicit error handling  
✗ Hidden state mutations  
✗ Unclear contract between caller and callee  
✗ Magic behavior not documented

---

## When Principles Conflict

Prioritize in this order:
1. **Simplicity** - Is there a simpler way?
2. **Testability** - Can I verify this works?
3. **Clarity** - Will the next person understand this?
4. **Performance** - Only if the above three are satisfied

---

## No Exceptions

These principles apply:
- In small scripts and large systems
- In bug fixes and new features
- In personal projects and enterprise code
- To all programming languages
- To all team members

If a principle seems wrong for your case, escalate before proceeding differently.

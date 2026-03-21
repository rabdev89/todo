# T-204 Design: Task Detail & Modals

## Style Attribution
- **Source:** [style_guide.json](file:///Users/ronaldbaniqued/Code/Origin/ToDoApp/ai-assisted-development/web-applications/project-management/design/style_guide.json)
- **Visuals:** Use `#027CEC` for focus states and primary actions. Radius `12px` for modals.

## UX Logic
- **Pattern:** Side Drawer (Mobile/Tablet) or Centered Modal (Desktop).
- **Interactions:** Subtle backdrop blur for focus.
- **Data Flow:** Uses `TasksContext` to reflect changes immediately in the dashboard list.

## Plan & Breaths
- **Breath 1:** Modal/Drawer component scaffolding and trigger logic.
- **Breath 2:** Detail view UI implementation (Typography, Inputs, Icons).
- **Breath 3:** Subtask list integration within the detail view.
- **Breath 4:** Auto-save or Manual-save logic with backend sync.

## Verification Spec
- **Automated:** Snapshots for Modal UI states.
- **Manual:** Verify all fields are editable and persist after closing.

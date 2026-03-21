# Functional Requirements Document (FRD): TodoAppCertification

## 1. User Authentication (F-100)
- **F-101:** System shall allow users to register with Email and Password.
- **F-102:** System shall support OAuth2 login via Google.
- **F-103:** System shall provide JWT-based session persistence.
- **F-104:** System shall securely hash passwords using bcrypt.

## 2. Task Management (F-200)
- **F-201:** Users shall be able to create tasks with a title, description (optional), and due date.
- **F-202:** Users shall be able to assign one of four priorities: Low, Medium, High, Urgent.
- **F-203:** Users shall be able to update any task field after creation.
- **F-204:** Users shall be able to delete tasks (soft delete recommended).
- **F-205:** Users shall be able to mark tasks as 'Completed'.

## 3. Subtask Hierarchy (F-300)
- **F-301:** Users shall be able to add subtasks to a parent task.
- **F-302:** Subtasks shall inherit the parent task's context but have independent completion status.
- **F-303:** System shall prevent marking a task as 'Completed' if any subtask is 'Pending' (toggleable).

## 4. Attachments (F-400)
- **F-401:** Users shall be able to upload files up to 5MB to a task.
- **F-402:** System shall support common image formats (PNG, JPG) and documents (PDF).

## 5. Dashboard & UI (F-500)
- **F-501:** System shall provide a global search bar to filter tasks by title.
- **F-502:** System shall allow sorting tasks by 'Due Date' and 'Priority'.
- **F-503:** UI shall be fully responsive across mobile, tablet, and desktop views.

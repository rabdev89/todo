# PRD2.md

## 1. Overview
This document extends the original PRD by defining detailed use cases, conditions, and system behaviors for the To-Do List App. It aligns functional features with real-world scenarios and edge cases to ensure production readiness.

---

## 2. User Roles

### 2.1 Guest
- Can register
- Can log in

### 2.2 Authenticated User
- Full access to task management
- Can manage subtasks and attachments

---

## 3. Use Cases & Conditions

### 3.1 Authentication

| ID | Use Case | Conditions |
|----|---------|-----------|
| AUTH-01 | Register Account | Email must be unique, password must meet security requirements |
| AUTH-02 | Login | Valid credentials required |
| AUTH-03 | Logout | Token must be valid |
| AUTH-04 | Social Login | OAuth provider must return valid token |

---

### 3.2 Task Management

| ID | Use Case | Conditions |
|----|---------|-----------|
| TASK-01 | Create Task | Title is required |
| TASK-02 | Edit Task | Task must exist |
| TASK-03 | Delete Task | Task must belong to user |
| TASK-04 | Mark Task Complete | All subtasks must be completed |
| TASK-05 | View Task | User must be authenticated |

---

### 3.3 Subtask Management

| ID | Use Case | Conditions |
|----|---------|-----------|
| SUB-01 | Add Subtask | Parent task must exist |
| SUB-02 | Delete Subtask | Subtask must exist |
| SUB-03 | Mark Subtask Done | Subtask must belong to task |
| SUB-04 | Auto Complete Task | Trigger when all subtasks are done |

---

### 3.4 Dashboard

| ID | Use Case | Conditions |
|----|---------|-----------|
| DASH-01 | View Tasks | User must be authenticated |
| DASH-02 | Filter Tasks | Filter values must be valid |
| DASH-03 | Sort Tasks | Sorting fields must exist |
| DASH-04 | Multi-delete Tasks | Tasks must belong to user |

---

### 3.5 Attachments

| ID | Use Case | Conditions |
|----|---------|-----------|
| ATT-01 | Upload File | File size and type must be valid |
| ATT-02 | Delete File | File must belong to task |

---

## 4. Detailed Functional Logic

### 4.1 Task Completion Rules
- A task cannot be marked as complete if:
  - It has at least one incomplete subtask
- A task is automatically marked complete when:
  - All subtasks are marked as done

### 4.2 Default Values
- Priority: Medium
- Status: Pending
- Date Created: Auto-generated

### 4.3 Validation Rules
- Title: Required, max length 255
- Due Date: Must be future date
- Priority: Enum (Low, Medium, High)
- Status: Enum (Pending, In Progress, Completed)

---

## 5. API Design (High-Level)

### 5.1 Authentication
- POST /auth/register
- POST /auth/login
- POST /auth/logout

### 5.2 Tasks
- GET /tasks
- POST /tasks
- GET /tasks/:id
- PATCH /tasks/:id
- DELETE /tasks/:id

### 5.3 Subtasks
- POST /tasks/:id/subtasks
- PATCH /subtasks/:id
- DELETE /subtasks/:id

### 5.4 Attachments
- POST /tasks/:id/attachments
- DELETE /attachments/:id

---

## 6. Data Model (Simplified)

### Task
- id
- title
- priority
- status
- dueDate
- createdAt
- updatedAt

### Subtask
- id
- taskId
- name
- status

### Attachment
- id
- taskId
- fileUrl

---

## 7. Non-Functional Enhancements

### 7.1 Performance
- Pagination required for task list
- Lazy loading for subtasks

### 7.2 Security
- JWT authentication
- Role-based access (future-ready)
- Input validation on all endpoints

### 7.3 Scalability
- Stateless backend
- Modular services (task, auth, attachment)

### 7.4 Reliability
- Graceful error handling
- Retry logic for failed uploads

---

## 8. Edge Cases

- Deleting a task should also delete:
  - Subtasks
  - Attachments
- Marking task complete with no subtasks should be allowed
- Upload failure should not break task creation
- Expired token should force re-login

---

## 9. Future Enhancements (Expanded)

- Real-time updates (WebSockets)
- Notifications system
- Task sharing & collaboration
- Offline-first capability
- AI-based task suggestions

---

## 10. Acceptance Criteria

- Users can create, edit, delete tasks reliably
- Subtask completion enforces task rules
- Authentication is secure and stable
- UI is responsive across devices
- API responds within acceptable latency (<300ms avg)

---

## 11. Success Metrics

- Task creation success rate > 99%
- API error rate < 1%
- Average response time < 300ms
- User retention improvement with task completion usage

---

## 12. Deployment Considerations

- Environment configs (dev, staging, prod)
- CI/CD pipeline setup
- Database migrations
- Monitoring & logging (e.g., Winston, Datadog)

---

## 13. Summary

This PRD2 ensures the To-Do List App is production-ready by introducing structured use cases, validation rules, API definitions, and system-level considerations. It bridges the gap between high-level requirements and implementation-ready specifications.



# prd.md

## 1. Overview
The To-Do List App is a task management system that allows users to create, organize, and track tasks with subtasks, priorities, and statuses.

## 2. Features

### 2.1 Authentication
- Create Account
- Sign In
- Sign Out

### 2.2 Dashboard
- View list of tasks
- Expand subtasks
- Filter by priority and status
- Active filters: Chips are closable
- Sort by Priority
- Sort tasks
- Multiple selection
- When delete button is clicked – delete confirmation

### 2.3 Task Management
- Create task
- View task
- Edit task
- Mark task as complete

### 2.4 Subtask Management
- Add subtask
- Delete subtask
- Mark subtask as done
- Auto-complete task when all subtasks are done

### 2.5 Attachments
- Upload files (drag & drop or browse)

### 2.6 Mobile Support
- Responsive UI
- Optimized layouts for smaller screens

---

## 3. Functional Requirements

### Tasks
- Users can create tasks with default values
- Tasks have:
  - Title
  - Priority
  - Status
  - Date Created
  - Due Date

### Subtasks
- Subtasks belong to a task
- Each subtask has:
  - Name
  - Status

### Completion Logic
- Task cannot be marked complete unless all subtasks are done
- Completion date is auto-generated

### Filtering & Sorting
- Filter by priority and status
- Sort by priority

---

## 4. Non-Functional Requirements

### Performance
- Fast load times for dashboard

### Security
- Authentication with token-based system
- Password hashing

### Scalability
- Modular frontend and backend architecture

### Responsiveness
- Must support web and mobile screen sizes

---

## 5. Tech Stack

### Frontend
- ReactJS
- Material UI

### Backend
- NodeJS (TypeScript / NestJS)

### Database
- Relational DB (MySQL / PostgreSQL / SQLite)

---

## 6. Constraints
- Must follow provided design system
- Must use Material UI
- Must support responsive layouts

---

## 7. Future Enhancements
- Social login (Google, Facebook)
- Notifications
- Task sharing
- Offline support


---

# prd_advanced.md

## 1. Overview
This document defines the advanced product requirements for the To-Do List App, focusing on system architecture, scalability, security, and technical constraints based on the provided PPTX.

## 2. System Architecture

### High-Level Components
- Client Application
  - Web App (ReactJS)
  - Mobile App (Responsive or future native)
- Backend Application
  - API Layer
  - Business Logic Layer
  - Data Access Layer
- Database (Relational)
- External Services
  - Authentication Providers (Google, Facebook)

### Architecture Principles
- Clear separation between:
  - UI, UI Model, API Integration
  - API, Business Logic, Data Persistence
- Modular and scalable structure

---

## 3. Core Functional Enhancements

### 3.1 Authentication
- Email/password authentication
- Social login (Google, Facebook)
- Secure token-based authentication

### 3.2 Task System (Extended)
- Task CRUD operations
- Subtask dependency enforcement
- Task completion rules
- Attachment handling

### 3.3 API Layer
- RESTful endpoints
- Token-based access control
- Validation and error handling

---

## 4. Non-Functional Requirements

### 4.1 Security
- JWT tokens must be cryptographically signed
- Passwords must be hashed (e.g., bcrypt)
- Sensitive data must not be hardcoded
- Access control enforced on all endpoints

### 4.2 Performance
- Optimized API response times
- Efficient database queries

### 4.3 Scalability
- Layered backend architecture
- Stateless API design

### 4.4 Maintainability
- Code separation by responsibility
- Environment-based configuration

---

## 5. Technical Requirements

### Frontend
- ReactJS
- Material UI
- Responsive design implementation

### Backend
- NodeJS with TypeScript (NestJS preferred)
- Alternative: Kotlin with Spring Boot

### Database
- Relational database (MySQL, PostgreSQL, SQLite)
- Must follow normalization rules

---

## 6. Constraints
- Must follow provided UI/UX designs
- Must maintain separation of concerns
- Must support both web and mobile experiences

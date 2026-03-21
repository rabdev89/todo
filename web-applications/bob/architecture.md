# System Architecture: TodoAppCertification

## 1. Overview
TodoAppCertification follows a modern, layered architecture designed for scalability, performance, and clear separation of concerns. The system is split into a responsive React frontend and a robust NestJS backend, utilizing PostgreSQL for persistent storage.

## 2. Architecture Diagram
```mermaid
graph TD
    subgraph Client Layer
        Web[React Web App - MUI]
        Mobile[Responsive Mobile Layouts]
    end

    subgraph API Gateway / Auth
        Gateway[NestJS API Gateway]
        JWT[JWT Authentication / Passport]
    end

    subgraph Service Layer
        TaskSvc[Task Management Service]
        SubtaskSvc[Subtask Hierarchy Service]
        AuthSvc[User & Session Service]
        StorageSvc[File Attachment Service]
    end

    subgraph Data Layer
        DB[(PostgreSQL Database)]
        S3[(S3/Cloudinary/Local Storage)]
    end

    Client Layer -->|REST API| Gateway
    Gateway --> JWT
    Gateway --> TaskSvc
    Gateway --> SubtaskSvc
    Gateway --> AuthSvc
    Gateway --> StorageSvc

    TaskSvc --> DB
    SubtaskSvc --> DB
    AuthSvc --> DB
    StorageSvc --> S3
```

## 3. Components

### Frontend
- **Framework:** React 18+ with TypeScript.
- **State Management:** React Context or Redux Toolkit.
- **UI Library:** Material UI (MUI) for professional, responsive components.
- **Styling:** CSS Modules or Styled Components following the 'Pristine Productivity' Style Guide.

### Backend
- **Framework:** NestJS (Node.js) using TypeScript.
- **ORM:** Prisma or TypeORM for database interactions.
- **Architecture:** Controller-Service-Repository pattern.

### Database
- **Primary DB:** PostgreSQL 15+.
- **Schema:** Normalized tables for Users, Tasks, Subtasks, and Attachments.

### Infrastructure
- **Server:** Dockerized containers.
- **CI/CD:** GitHub Actions or similar BOB-integrated pipeline.
- **Storage:** Local or S3-compatible for task attachments.

## 4. Design Principles
- **Separation of Concerns:** Distinct boundaries between UI, business logic, and data access.
- **Stateless API:** Ensuring easy horizontal scaling.
- **Type Safety:** End-to-end TypeScript enforcement.
- **Mobile First:** Responsive layouts as a first-class citizen.

## 5. Data Flow
1. **Authentication:** User logs in -> JWT issued -> Stored in HttpOnly Cookie or Secure Storage.
2. **Task Creation:** Frontend sends POST -> Gateway validates JWT -> TaskSvc creates record -> DB persists.
3. **Subtask Sync:** Adding a subtask triggers a check on the parent task's status via SubtaskSvc.

## 6. Security Considerations
- **Auth:** JWT tokens with short expiry + Refresh tokens.
- **RBAC:** Simple Role-Based Access (User/Admin).
- **Encryption:** Passwords salted and hashed with Argon2 or Bcrypt.
- **Validation:** Stringent input validation via Zod or Class-Validator.

## 7. Performance Targets
- **TTFB:** Under 200ms.
- **First Contentful Paint:** Under 1.2s.
- **API Latency:** 95th percentile under 300ms for core CRUD operations.
- **Availability:** 99.9% target.

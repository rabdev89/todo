# API Contracts: TodoAppCertification

## 1. Overview
The TodoAppCertification API is a RESTful service designed for high performance and clear resource management. It uses JSON for all data exchange and follows standard HTTP methods and status codes.

## 2. Base URL
- **Development:** `http://localhost:3000/api/v1`
- **Staging:** `https://staging-api.todoapp.com/api/v1`
- **Production:** `https://api.todoapp.com/api/v1`

## 3. Authentication
- **Mechanism:** JWT (JSON Web Token).
- **Header:** `Authorization: Bearer <token>`
- **Endpoints:** All endpoints except `/auth/login` and `/auth/register` require authentication.

## 4. Common Responses

### Success (200 OK / 201 Created)
```json
{
  "success": true,
  "data": { ... },
  "message": "Optional success message"
}
```

### Error (4xx / 5xx)
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable error message",
    "details": {}
  }
}
```

## 5. Endpoints

### Authentication
#### `POST /auth/register`
- **Description:** Register a new user.
- **Request Body:**
  ```json
  {
    "email": "user@example.com",
    "password": "Password123!"
  }
  ```
- **Response (201 Created):**
  ```json
  {
    "success": true,
    "data": { "token": "eyJhbG..." }
  }
  ```

#### `POST /auth/login`
- **Description:** Authenticate user and return token.
- **Request Body:**
  ```json
  {
    "email": "user@example.com",
    "password": "Password123!"
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "data": { "token": "eyJhbG..." }
  }
  ```

### Tasks
#### `GET /tasks`
- **Description:** Retrieve all tasks for the authenticated user.
- **Query Params:** `status`, `priority`, `sort_by` (e.g., `due_date`)
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "data": [
      {
        "id": "uuid",
        "title": "Build API",
        "status": "pending",
        "priority": "high",
        "due_date": "2026-04-01T10:00:00Z"
      }
    ]
  }
  ```

#### `POST /tasks`
- **Description:** Create a new task.
- **Request Body:**
  ```json
  {
    "title": "New Task",
    "priority": "medium",
    "due_date": "2026-04-10T15:00:00Z"
  }
  ```
- **Response (201 Created):**
  ```json
  {
    "success": true,
    "data": { "id": "new-uuid", "title": "New Task" }
  }
  ```

### Subtasks
#### `POST /tasks/:id/subtasks`
- **Description:** Add a subtask to a task.
- **Request Body:**
  ```json
  { "title": "Subtask 1" }
  ```
- **Response (201 Created):**
  ```json
  { "success": true, "data": { "id": "sub-uuid", "title": "Subtask 1", "is_done": false } }
  ```

## 6. Error Codes
| Code | Meaning |
| --- | --- |
| `AUTH_INVALID_CREDENTIALS` | Incorrect email or password. |
| `AUTH_TOKEN_EXPIRED` | JWT token has expired. |
| `VALIDATION_ERROR` | Request body failed validation. |
| `RESOURCE_NOT_FOUND` | The requested item does not exist. |

## 7. Rate Limiting & Pagination
- **Rate Limit:** 100 requests per minute per IP.
- **Pagination:** Uses `limit` and `offset` query parameters for list endpoints.

# T-401: File Attachments (Backend) - Design

## Architecture Overview
The file attachment system uses a hybrid approach: metadata is stored in MySQL via Prisma, while actual files are stored on the local filesystem. NestJS serves these files statically.

## Data Model (Prisma)
```prisma
model Attachment {
  id        String   @id @default(uuid())
  filename  String
  mimetype  String
  size      Int
  url       String
  taskId    String   @map("task_id")
  task      Task     @relation(fields: [taskId], references: [id], onDelete: Cascade)
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  @@map("attachments")
}
```

## API Contract

### POST `/tasks/:id/attachments`
- **Request**: `multipart/form-data` with field `file`.
- **Response**: `201 Created` with Attachment object.
- **Security**: Ownership check on Task.

### DELETE `/tasks/attachments/:id`
- **Response**: `200 OK`.
- **Security**: Ownership check on Task via Attachment.

## Implementation Details

### File Storage
- **Directory**: `./uploads` at project root.
- **Naming Strategy**: Random unique hash + extension to prevent collisions and directory traversal.
- **Serving**: `ServeStaticModule` from `@nestjs/serve-static`.

### Middleware
- **Multer**: Configured with `diskStorage` and file filters for size and type.

### Security
- **Ownership**: Custom service logic to verify `task.userId === currentUserId`.
- **Validation**: Global `ValidationPipe` and Multer restrictions.

## Error Handling
- `400 Bad Request`: File too large or invalid type.
- `403 Forbidden`: User does not own the task.
- `404 Not Found`: Task or Attachment doesn't exist.

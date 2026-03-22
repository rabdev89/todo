# Complete Guide: Full-Stack Todo List App with NX Monorepo

> **A Production-Ready NX Monorepo with React + NestJS + Prisma + MySQL**

---

## 📋 Table of Contents

1. [Project Overview](#1-project-overview)
2. [Prerequisites & Environment Setup](#2-prerequisites--environment-setup)
3. [Technology Stack Deep Dive](#3-technology-stack-deep-dive)
4. [NX Workspace Creation](#4-nx-workspace-creation)
5. [Project Architecture & Structure](#5-project-architecture--structure)
6. [Database Design with Prisma](#6-database-design-with-prisma)
7. [Backend Implementation (NestJS)](#7-backend-implementation-nestjs)
8. [Frontend Implementation (React)](#8-frontend-implementation-react)
9. [Shared Libraries Setup](#9-shared-libraries-setup)
10. [API Documentation](#10-api-documentation)
11. [Development Workflow](#11-development-workflow)
12. [Testing Strategy](#12-testing-strategy)
13. [Deployment Guide](#13-deployment-guide)
14. [Troubleshooting](#14-troubleshooting)
15. [Advanced Features & Enhancements](#15-advanced-features--enhancements)

---

## 1. Project Overview

### 1.1 What We're Building

A **full-stack Todo List application** with hierarchical subtasks, featuring:

- ✅ Complete CRUD operations for Todos and Subtasks
- ✅ Parent-child relationship (Todo → Subtasks)
- ✅ Cascade deletion (deleting a Todo removes all its Subtasks)
- ✅ Due dates and completion tracking
- ✅ RESTful API with proper validation
- ✅ Modern React UI with real-time updates
- ✅ Type-safe development across the entire stack

### 1.2 Core Features

#### Todo Management
- Create todos with title, description, and optional due date
- View all todos with their subtasks
- Update todo details and completion status
- Delete todos (automatically clears all subtasks)
- Filter and sort todos

#### Subtask Management
- Add multiple subtasks to any todo
- Mark subtasks as complete/incomplete
- Edit subtask titles
- Delete individual subtasks
- Track subtask completion progress per todo

### 1.3 Architecture Principles

**Separation of Concerns**
- Backend: Pure business logic and data access
- Frontend: UI/UX and user interactions only
- Shared: Common types and utilities

**Data Flow**
```
React UI → HTTP Requests → NestJS API → Prisma ORM → MySQL Database
         ← JSON Response ←            ←            ←
```

**Security Model**
- No direct database access from frontend
- All data validation happens on backend
- CORS configuration for API access
- Environment-based configuration

---

## 2. Prerequisites & Environment Setup

### 2.1 Required Software

| Software | Minimum Version | Purpose |
|----------|----------------|---------|
| Node.js | v18+ (LTS) | Runtime environment |
| npm/yarn | npm 9+ or yarn 1.22+ | Package management |
| MySQL | 8.0+ | Database server |
| Git | 2.0+ | Version control |
| VS Code | Latest | Recommended IDE |

### 2.2 Verify Installations

```bash
# Check Node.js version
node --version  # Should show v18.x.x or higher

# Check npm version
npm --version   # Should show 9.x.x or higher

# Check MySQL (if installed locally)
mysql --version

# Verify Git
git --version
```

### 2.3 MySQL Database Options

**Option A: Local MySQL Installation**
- Install MySQL Community Server from [mysql.com](https://dev.mysql.com/downloads/)
- Create database: `CREATE DATABASE todo_db;`
- Note your credentials for DATABASE_URL

**Option B: Cloud MySQL Services** (Recommended for beginners)
- **PlanetScale** (Free tier): MySQL-compatible, automatic scaling
- **AWS RDS**: Enterprise-grade, various pricing tiers
- **Heroku Postgres** or **ClearDB**: Simple setup
- **Railway**: Developer-friendly with free tier
- **DigitalOcean Managed Databases**: Fixed pricing

**Option C: Docker MySQL**
```bash
# Quick MySQL setup with Docker
docker run --name mysql-todo \
  -e MYSQL_ROOT_PASSWORD=rootpassword \
  -e MYSQL_DATABASE=todo_db \
  -e MYSQL_USER=todouser \
  -e MYSQL_PASSWORD=todopass \
  -p 3306:3306 \
  -d mysql:8
```

### 2.4 IDE Setup (VS Code)

**Recommended Extensions**
```json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "prisma.prisma",
    "nrwl.angular-console",
    "firsttris.vscode-jest-runner",
    "ms-vscode.vscode-typescript-next"
  ]
}
```

---

## 3. Technology Stack Deep Dive

### 3.1 Why This Stack?

| Technology | Why We Use It | Key Benefits |
|------------|---------------|--------------|
| **NX** | Monorepo management | Unified codebase, shared code, efficient builds |
| **React 18** | UI framework | Component-based, hooks, large ecosystem |
| **NestJS** | Backend framework | TypeScript-first, modular, decorator-based |
| **Prisma** | ORM | Type-safe queries, migrations, modern API |
| **MySQL** | Database | Reliable, widely used, good for relations |
| **TypeScript** | Type system | Catch errors early, better IDE support |

### 3.2 Package Ecosystem

**Backend Dependencies**
- `@nestjs/common` - Core NestJS functionality
- `@nestjs/core` - Application foundation
- `@nestjs/platform-express` - HTTP server
- `@prisma/client` - Database client
- `class-validator` - DTO validation
- `class-transformer` - Object transformation

**Frontend Dependencies**
- `react` & `react-dom` - UI library
- `axios` - HTTP client
- `date-fns` - Date formatting/manipulation

**Development Dependencies**
- `@nx/*` - NX plugins for each framework
- `prisma` - Database CLI and migrations
- `typescript` - Type checking
- `eslint` & `prettier` - Code quality

---

## 4. NX Workspace Creation

### 4.1 Initialize NX Workspace

**Step 1: Create Workspace**
```bash
# Create new NX workspace
npx create-nx-workspace@latest todo-app-monorepo

# When prompted, select:
# ✔ Which stack do you want to use? · none
# ✔ Package-based or integrated? · integrated
# ✔ Enable distributed caching? · Yes
# ✔ Would you like remote caching (Nx Cloud)? · Skip (or enable for free caching)

# Navigate into workspace
cd todo-app-monorepo
```

**What This Creates**
```
todo-app-monorepo/
├── nx.json                 # NX configuration
├── package.json            # Root dependencies
├── tsconfig.base.json      # Shared TypeScript config
├── .gitignore             # Git ignore rules
└── apps/                  # (empty, we'll add apps here)
```

### 4.2 Install NX Plugins

```bash
# Install React plugin for frontend
npm install -D @nx/react

# Install NestJS plugin for backend
npm install -D @nx/nest

# Install Node plugin for shared libraries
npm install -D @nx/node

# Install Jest plugin for testing (if not included)
npm install -D @nx/jest

# Verify plugins installed
npx nx list
```

**Expected Output**: Should show @nx/react, @nx/nest, @nx/node in the list

### 4.3 Generate Backend App (NestJS)

```bash
# Generate NestJS application
npx nx generate @nx/nest:application todo-backend \
  --directory=apps/todo-backend \
  --strict

# This creates:
# - apps/todo-backend/src/app/app.module.ts
# - apps/todo-backend/src/app/app.controller.ts
# - apps/todo-backend/src/app/app.service.ts
# - apps/todo-backend/src/main.ts
# - apps/todo-backend/project.json
# - apps/todo-backend/tsconfig.json
```

**Options Explained**
- `--directory`: Where to place the app
- `--strict`: Enable TypeScript strict mode

### 4.4 Generate Frontend App (React)

```bash
# Generate React application with Vite
npx nx generate @nx/react:application todo-frontend \
  --directory=apps/todo-frontend \
  --bundler=vite \
  --style=css \
  --unitTestRunner=jest \
  --e2eTestRunner=none \
  --strict

# This creates:
# - apps/todo-frontend/src/app/App.tsx
# - apps/todo-frontend/src/main.tsx
# - apps/todo-frontend/project.json
# - apps/todo-frontend/vite.config.ts
```

**Options Explained**
- `--bundler=vite`: Modern fast build tool
- `--style=css`: CSS for styling
- `--unitTestRunner=jest`: Testing framework
- `--e2eTestRunner=none`: Skip E2E for now

### 4.5 Generate Shared Library

```bash
# Generate shared types library
npx nx generate @nx/js:library shared-types \
  --directory=libs/shared-types \
  --unitTestRunner=jest \
  --bundler=tsc \
  --strict

# This creates:
# - libs/shared-types/src/index.ts
# - libs/shared-types/src/lib/shared-types.ts
# - libs/shared-types/project.json
```

### 4.6 Verify Setup

```bash
# List all projects in workspace
npx nx show projects

# Expected output:
# todo-backend
# todo-frontend
# shared-types

# View dependency graph (opens in browser)
npx nx graph
```

---

## 5. Project Architecture & Structure

### 5.1 Recommended Folder Structure

```
todo-app-monorepo/
├── apps/
│   ├── todo-backend/                    # NestJS API Server
│   │   ├── src/
│   │   │   ├── app/
│   │   │   │   ├── prisma/              # Prisma service
│   │   │   │   │   └── prisma.service.ts
│   │   │   │   ├── todos/               # Todos module
│   │   │   │   │   ├── dto/
│   │   │   │   │   │   ├── create-todo.dto.ts
│   │   │   │   │   │   └── update-todo.dto.ts
│   │   │   │   │   ├── todos.controller.ts
│   │   │   │   │   ├── todos.service.ts
│   │   │   │   │   └── todos.module.ts
│   │   │   │   ├── subtasks/            # Subtasks module
│   │   │   │   │   ├── dto/
│   │   │   │   │   │   ├── create-subtask.dto.ts
│   │   │   │   │   │   └── update-subtask.dto.ts
│   │   │   │   │   ├── subtasks.controller.ts
│   │   │   │   │   ├── subtasks.service.ts
│   │   │   │   │   └── subtasks.module.ts
│   │   │   │   └── app.module.ts        # Root module
│   │   │   └── main.ts                  # Entry point
│   │   ├── prisma/
│   │   │   ├── schema.prisma            # Database schema
│   │   │   └── migrations/              # Migration history
│   │   ├── .env                         # Environment variables (gitignored)
│   │   ├── .env.example                 # Example env file
│   │   └── project.json                 # NX project config
│   │
│   └── todo-frontend/                   # React Application
│       ├── src/
│       │   ├── app/
│       │   │   ├── components/          # React components
│       │   │   │   ├── TodoList.tsx
│       │   │   │   ├── TodoItem.tsx
│       │   │   │   ├── TodoForm.tsx
│       │   │   │   ├── SubtaskList.tsx
│       │   │   │   └── SubtaskForm.tsx
│       │   │   ├── services/            # API services
│       │   │   │   └── api.service.ts
│       │   │   ├── App.tsx
│       │   │   └── App.css
│       │   └── main.tsx                 # Entry point
│       ├── public/                      # Static assets
│       └── project.json
│
├── libs/
│   └── shared-types/                    # Shared TypeScript types
│       └── src/
│           ├── lib/
│           │   └── interfaces.ts        # Todo & Subtask interfaces
│           └── index.ts
│
├── nx.json                              # NX workspace config
├── package.json                         # Root dependencies
├── tsconfig.base.json                   # Base TypeScript config
└── README.md                            # Project documentation
```

### 5.2 Module Organization Strategy

**Backend Modules**
```
app.module.ts
├── TodosModule
│   ├── TodosController (handles /api/todos routes)
│   ├── TodosService (business logic)
│   └── PrismaService (injected)
└── SubtasksModule
    ├── SubtasksController (handles /api/todos/:id/subtasks & /api/subtasks routes)
    ├── SubtasksService (business logic)
    └── PrismaService (injected)
```

**Frontend Component Hierarchy**
```
App.tsx
└── TodoList (main container)
    ├── TodoForm (create new todo)
    └── TodoItem[] (list of todos)
        ├── SubtaskForm (add subtask)
        └── SubtaskList
            └── SubtaskItem[]
```

### 5.3 File Naming Conventions

| Type | Convention | Example |
|------|-----------|---------|
| React Component | PascalCase | `TodoList.tsx` |
| Service/Utility | camelCase | `api.service.ts` |
| Interface/Type | PascalCase | `TodoInterface.ts` |
| DTO | kebab-case + .dto | `create-todo.dto.ts` |
| Module | kebab-case + .module | `todos.module.ts` |
| Controller | kebab-case + .controller | `todos.controller.ts` |
| CSS | matches component | `TodoList.css` |

---

## 6. Database Design with Prisma

### 6.1 Install Prisma

```bash
# Install Prisma CLI and Client
npm install @prisma/client

# Install Prisma as dev dependency
npm install -D prisma

# Verify installation
npx prisma --version
```

### 6.2 Initialize Prisma in Backend

```bash
# Navigate to backend app
cd apps/todo-backend

# Initialize Prisma (creates prisma/ folder and .env)
npx prisma init

# This creates:
# - prisma/schema.prisma
# - .env

# Return to root
cd ../..
```

### 6.3 Configure Prisma Schema

**File: `apps/todo-backend/prisma/schema.prisma`**

```prisma
// Prisma Schema for MySQL Todo Application
// This defines our database structure and relationships

generator client {
  provider = "prisma-client-js"
  // Generate client in node_modules for easy access
  output   = "../node_modules/.prisma/client"
}

datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}

// Todo model represents a main task/todo item
model Todo {
  id          Int        @id @default(autoincrement())
  title       String     @db.VarChar(255)        // Required title
  description String?    @db.Text                 // Optional long description
  completed   Boolean    @default(false)          // Completion status
  dueDate     DateTime?  @db.DateTime             // Optional due date
  createdAt   DateTime   @default(now())          // Auto-set on creation
  updatedAt   DateTime   @updatedAt               // Auto-updated on changes
  
  // One-to-many relationship with Subtasks
  subtasks    Subtask[]

  // Map to database table name
  @@map("todos")
  
  // Add index on commonly queried fields
  @@index([completed])
  @@index([dueDate])
}

// Subtask model represents a child task under a Todo
model Subtask {
  id        Int      @id @default(autoincrement())
  title     String   @db.VarChar(255)             // Required title
  completed Boolean  @default(false)               // Completion status
  todoId    Int                                    // Foreign key to Todo
  createdAt DateTime @default(now())              // Auto-set on creation
  updatedAt DateTime @updatedAt                   // Auto-updated on changes
  
  // Many-to-one relationship with Todo
  // onDelete: Cascade means deleting a Todo deletes all its Subtasks
  todo      Todo     @relation(fields: [todoId], references: [id], onDelete: Cascade)

  // Map to database table name
  @@map("subtasks")
  
  // Add index on foreign key for faster joins
  @@index([todoId])
  @@index([completed])
}
```

**Schema Features Explained**

| Feature | Purpose |
|---------|---------|
| `@id` | Primary key |
| `@default(autoincrement())` | Auto-increment ID |
| `@default(now())` | Set current timestamp |
| `@updatedAt` | Auto-update on record change |
| `@db.VarChar(255)` | MySQL-specific type hint |
| `@relation` | Define foreign key relationship |
| `onDelete: Cascade` | Delete subtasks when todo deleted |
| `@@map("todos")` | Custom table name in database |
| `@@index([field])` | Add database index for performance |

### 6.4 Environment Configuration

**File: `apps/todo-backend/.env`** (Never commit this!)

```env
# MySQL Database Connection String
# Format: mysql://USER:PASSWORD@HOST:PORT/DATABASE

# Local MySQL example:
DATABASE_URL="mysql://root:mypassword@localhost:3306/todo_db"

# PlanetScale example:
# DATABASE_URL="mysql://user:pass@us-east.connect.psdb.cloud/todo_db?sslaccept=strict"

# Railway example:
# DATABASE_URL="mysql://root:pass@containers-us-west-xxx.railway.app:3306/railway"

# AWS RDS example:
# DATABASE_URL="mysql://admin:pass@mydb.xxxxx.us-east-1.rds.amazonaws.com:3306/todo_db"

# Application Port (optional)
PORT=3000
```

**File: `apps/todo-backend/.env.example`** (Commit this!)

```env
# Copy this to .env and fill in your actual values
DATABASE_URL="mysql://username:password@host:3306/database_name"
PORT=3000
```

### 6.5 Create and Run Migrations

```bash
# Navigate to backend
cd apps/todo-backend

# Create initial migration
npx prisma migrate dev --name init

# What this does:
# 1. Creates SQL migration files in prisma/migrations/
# 2. Applies migration to your database
# 3. Generates Prisma Client
# 4. Shows you the SQL that was executed

# Generate Prisma Client (if needed separately)
npx prisma generate

# Return to root
cd ../..
```

**Migration Output Example**
```
Environment variables loaded from .env
Prisma schema loaded from prisma/schema.prisma
Datasource "db": MySQL database "todo_db" at "localhost:3306"

Applying migration `20240317000000_init`

✔ Generated Prisma Client (5.x.x) to ./node_modules/@prisma/client
```

### 6.6 Prisma Studio (Database GUI)

```bash
# Open Prisma Studio to view/edit data
cd apps/todo-backend
npx prisma studio

# Opens at http://localhost:5555
# You can:
# - View all records
# - Add/edit/delete data
# - Test relationships
# - Inspect schema
```

### 6.7 Database Seeding (Optional)

**File: `apps/todo-backend/prisma/seed.ts`**

```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create sample todos with subtasks
  const todo1 = await prisma.todo.create({
    data: {
      title: 'Learn NX Monorepo',
      description: 'Master NX for full-stack development',
      dueDate: new Date('2024-12-31'),
      subtasks: {
        create: [
          { title: 'Set up NX workspace', completed: true },
          { title: 'Create React app', completed: true },
          { title: 'Create NestJS app', completed: false },
        ],
      },
    },
  });

  const todo2 = await prisma.todo.create({
    data: {
      title: 'Build Todo App',
      description: 'Create a full-stack todo application',
      subtasks: {
        create: [
          { title: 'Design database schema', completed: true },
          { title: 'Implement backend API', completed: false },
          { title: 'Build frontend UI', completed: false },
        ],
      },
    },
  });

  console.log('✅ Seeding completed!');
  console.log({ todo1, todo2 });
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

**Add seed script to `package.json` in backend:**

```json
{
  "prisma": {
    "seed": "ts-node prisma/seed.ts"
  }
}
```

**Run seed:**
```bash
cd apps/todo-backend
npx prisma db seed
```

---

## 7. Backend Implementation (NestJS)

### 7.1 Project Structure Overview

```
todo-backend/src/app/
├── prisma/
│   └── prisma.service.ts          # Prisma connection service
├── todos/
│   ├── dto/
│   │   ├── create-todo.dto.ts     # Validation for creating todos
│   │   └── update-todo.dto.ts     # Validation for updating todos
│   ├── todos.controller.ts         # HTTP endpoint handlers
│   ├── todos.service.ts            # Business logic
│   └── todos.module.ts             # Module definition
├── subtasks/
│   ├── dto/
│   │   ├── create-subtask.dto.ts
│   │   └── update-subtask.dto.ts
│   ├── subtasks.controller.ts
│   ├── subtasks.service.ts
│   └── subtasks.module.ts
└── app.module.ts                   # Root application module
```

### 7.2 Install Backend Dependencies

```bash
# Navigate to root (installs for entire workspace)
npm install @prisma/client

# Install validation packages
npm install class-validator class-transformer

# Ensure NestJS core packages are installed
npm install @nestjs/common @nestjs/core @nestjs/platform-express reflect-metadata rxjs
```

### 7.3 Prisma Service Implementation

**File: `apps/todo-backend/src/app/prisma/prisma.service.ts`**

**Purpose**: Manages Prisma Client lifecycle and provides it to other services

**Key Concepts**:
- `OnModuleInit`: Connect to DB when app starts
- `OnModuleDestroy`: Disconnect gracefully when app stops
- Injectable: Can be injected into other services

**Code Structure**:
```typescript
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient
  implements OnModuleInit, OnModuleDestroy {
  
  // Called when module initializes
  async onModuleInit() {
    await this.$connect();
    console.log('✅ Database connected');
  }

  // Called when app shuts down
  async onModuleDestroy() {
    await this.$disconnect();
    console.log('🔌 Database disconnected');
  }
}
```

**Why extend PrismaClient?**
- Inherits all Prisma methods (findMany, create, update, etc.)
- Adds lifecycle hooks for connection management
- Can be enhanced with middleware and logging

### 7.4 Todos Module Implementation

#### 7.4.1 Create Todo DTO

**File: `apps/todo-backend/src/app/todos/dto/create-todo.dto.ts`**

**Purpose**: Define and validate the shape of data when creating a todo

```typescript
import { IsString, IsOptional, IsBoolean, IsDateString, MaxLength, MinLength } from 'class-validator';

export class CreateTodoDto {
  @IsString()
  @MinLength(1, { message: 'Title must not be empty' })
  @MaxLength(255, { message: 'Title must not exceed 255 characters' })
  title: string;

  @IsOptional()
  @IsString()
  @MaxLength(5000, { message: 'Description must not exceed 5000 characters' })
  description?: string;

  @IsOptional()
  @IsBoolean()
  completed?: boolean;

  @IsOptional()
  @IsDateString({}, { message: 'Due date must be a valid ISO date string' })
  dueDate?: string;
}
```

**Validation Decorators Explained**:
- `@IsString()`: Must be a string
- `@IsOptional()`: Field is optional
- `@IsBoolean()`: Must be true or false
- `@IsDateString()`: Must be valid ISO date format
- `@MinLength(n)`: Minimum character count
- `@MaxLength(n)`: Maximum character count

#### 7.4.2 Update Todo DTO

**File: `apps/todo-backend/src/app/todos/dto/update-todo.dto.ts`**

**Purpose**: Validate partial updates (all fields optional)

```typescript
import { IsString, IsOptional, IsBoolean, IsDateString, MaxLength, MinLength } from 'class-validator';

export class UpdateTodoDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  title?: string;

  @IsOptional()
  @IsString()
  @MaxLength(5000)
  description?: string;

  @IsOptional()
  @IsBoolean()
  completed?: boolean;

  @IsOptional()
  @IsDateString()
  dueDate?: string;
}
```

#### 7.4.3 Todos Service

**File: `apps/todo-backend/src/app/todos/todos.service.ts`**

**Purpose**: Business logic for todo operations

**Architecture**: Service → Prisma → Database

```typescript
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTodoDto } from './dto/create-todo.dto';
import { UpdateTodoDto } from './dto/update-todo.dto';
import { Todo } from '@prisma/client';

@Injectable()
export class TodosService {
  // Inject Prisma service via constructor
  constructor(private prisma: PrismaService) {}

  /**
   * Create a new todo
   * @param createTodoDto - Todo data from request
   * @returns Created todo with subtasks array
   */
  async create(createTodoDto: CreateTodoDto): Promise<Todo> {
    return this.prisma.todo.create({
      data: {
        title: createTodoDto.title,
        description: createTodoDto.description,
        completed: createTodoDto.completed ?? false,
        dueDate: createTodoDto.dueDate ? new Date(createTodoDto.dueDate) : null,
      },
      include: {
        subtasks: true, // Include related subtasks in response
      },
    });
  }

  /**
   * Get all todos with their subtasks
   * @returns Array of todos, most recent first
   */
  async findAll(): Promise<Todo[]> {
    return this.prisma.todo.findMany({
      include: {
        subtasks: {
          orderBy: {
            createdAt: 'asc', // Subtasks in creation order
          },
        },
      },
      orderBy: {
        createdAt: 'desc', // Newest todos first
      },
    });
  }

  /**
   * Get a single todo by ID
   * @param id - Todo ID
   * @throws NotFoundException if todo doesn't exist
   * @returns Todo with subtasks
   */
  async findOne(id: number): Promise<Todo> {
    const todo = await this.prisma.todo.findUnique({
      where: { id },
      include: {
        subtasks: {
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
    });

    if (!todo) {
      throw new NotFoundException(`Todo with ID ${id} not found`);
    }

    return todo;
  }

  /**
   * Update a todo by ID
   * @param id - Todo ID
   * @param updateTodoDto - Fields to update
   * @throws NotFoundException if todo doesn't exist
   * @returns Updated todo
   */
  async update(id: number, updateTodoDto: UpdateTodoDto): Promise<Todo> {
    // Verify todo exists first
    await this.findOne(id);

    return this.prisma.todo.update({
      where: { id },
      data: {
        ...(updateTodoDto.title && { title: updateTodoDto.title }),
        ...(updateTodoDto.description !== undefined && { 
          description: updateTodoDto.description 
        }),
        ...(updateTodoDto.completed !== undefined && { 
          completed: updateTodoDto.completed 
        }),
        ...(updateTodoDto.dueDate !== undefined && { 
          dueDate: updateTodoDto.dueDate ? new Date(updateTodoDto.dueDate) : null 
        }),
      },
      include: {
        subtasks: true,
      },
    });
  }

  /**
   * Delete a todo by ID
   * @param id - Todo ID
   * @throws NotFoundException if todo doesn't exist
   * @note Cascade delete handles subtasks automatically
   */
  async remove(id: number): Promise<void> {
    // Verify todo exists first
    await this.findOne(id);

    await this.prisma.todo.delete({
      where: { id },
    });
  }
}
```

**Service Pattern Benefits**:
- Separates business logic from HTTP layer
- Reusable methods
- Easy to test in isolation
- Can be used by multiple controllers

#### 7.4.4 Todos Controller

**File: `apps/todo-backend/src/app/todos/todos.controller.ts`**

**Purpose**: Handle HTTP requests and responses

```typescript
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
  ValidationPipe,
} from '@nestjs/common';
import { TodosService } from './todos.service';
import { CreateTodoDto } from './dto/create-todo.dto';
import { UpdateTodoDto } from './dto/update-todo.dto';

@Controller('todos') // Base route: /api/todos
export class TodosController {
  constructor(private readonly todosService: TodosService) {}

  /**
   * POST /api/todos
   * Create a new todo
   */
  @Post()
  @HttpCode(HttpStatus.CREATED) // Returns 201
  create(@Body() createTodoDto: CreateTodoDto) {
    return this.todosService.create(createTodoDto);
  }

  /**
   * GET /api/todos
   * Get all todos
   */
  @Get()
  findAll() {
    return this.todosService.findAll();
  }

  /**
   * GET /api/todos/:id
   * Get a specific todo
   */
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    // ParseIntPipe automatically converts string to number and validates
    return this.todosService.findOne(id);
  }

  /**
   * PATCH /api/todos/:id
   * Update a todo
   */
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTodoDto: UpdateTodoDto,
  ) {
    return this.todosService.update(id, updateTodoDto);
  }

  /**
   * DELETE /api/todos/:id
   * Delete a todo
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT) // Returns 204
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.todosService.remove(id);
    // No return value for 204
  }
}
```

**HTTP Status Codes Used**:
- `200 OK`: GET, PATCH (default)
- `201 Created`: POST
- `204 No Content`: DELETE
- `400 Bad Request`: Validation error (automatic)
- `404 Not Found`: Resource not found

#### 7.4.5 Todos Module

**File: `apps/todo-backend/src/app/todos/todos.module.ts`**

**Purpose**: Organize and wire up todos feature

```typescript
import { Module } from '@nestjs/common';
import { TodosService } from './todos.service';
import { TodosController } from './todos.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [TodosController], // HTTP handlers
  providers: [TodosService, PrismaService], // Services available for DI
  exports: [TodosService], // Make service available to other modules
})
export class TodosModule {}
```

### 7.5 Subtasks Module Implementation

#### 7.5.1 Create Subtask DTO

**File: `apps/todo-backend/src/app/subtasks/dto/create-subtask.dto.ts`**

```typescript
import { IsString, IsOptional, IsBoolean, MaxLength, MinLength } from 'class-validator';

export class CreateSubtaskDto {
  @IsString()
  @MinLength(1, { message: 'Title must not be empty' })
  @MaxLength(255, { message: 'Title must not exceed 255 characters' })
  title: string;

  @IsOptional()
  @IsBoolean()
  completed?: boolean;
}
```

#### 7.5.2 Update Subtask DTO

**File: `apps/todo-backend/src/app/subtasks/dto/update-subtask.dto.ts`**

```typescript
import { IsString, IsOptional, IsBoolean, MaxLength, MinLength } from 'class-validator';

export class UpdateSubtaskDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  title?: string;

  @IsOptional()
  @IsBoolean()
  completed?: boolean;
}
```

#### 7.5.3 Subtasks Service

**File: `apps/todo-backend/src/app/subtasks/subtasks.service.ts`**

```typescript
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSubtaskDto } from './dto/create-subtask.dto';
import { UpdateSubtaskDto } from './dto/update-subtask.dto';
import { Subtask } from '@prisma/client';

@Injectable()
export class SubtasksService {
  constructor(private prisma: PrismaService) {}

  /**
   * Create a subtask for a specific todo
   * @param todoId - Parent todo ID
   * @param createSubtaskDto - Subtask data
   * @throws NotFoundException if parent todo doesn't exist
   */
  async create(todoId: number, createSubtaskDto: CreateSubtaskDto): Promise<Subtask> {
    // Verify parent todo exists
    const todo = await this.prisma.todo.findUnique({
      where: { id: todoId },
    });

    if (!todo) {
      throw new NotFoundException(`Todo with ID ${todoId} not found`);
    }

    return this.prisma.subtask.create({
      data: {
        title: createSubtaskDto.title,
        completed: createSubtaskDto.completed ?? false,
        todoId: todoId,
      },
    });
  }

  /**
   * Get all subtasks for a specific todo
   * @param todoId - Parent todo ID
   * @throws NotFoundException if parent todo doesn't exist
   */
  async findAllByTodo(todoId: number): Promise<Subtask[]> {
    // Verify parent todo exists
    const todo = await this.prisma.todo.findUnique({
      where: { id: todoId },
    });

    if (!todo) {
      throw new NotFoundException(`Todo with ID ${todoId} not found`);
    }

    return this.prisma.subtask.findMany({
      where: { todoId },
      orderBy: {
        createdAt: 'asc', // Oldest first
      },
    });
  }

  /**
   * Get a single subtask by ID
   * @param id - Subtask ID
   * @throws NotFoundException if subtask doesn't exist
   */
  async findOne(id: number): Promise<Subtask> {
    const subtask = await this.prisma.subtask.findUnique({
      where: { id },
    });

    if (!subtask) {
      throw new NotFoundException(`Subtask with ID ${id} not found`);
    }

    return subtask;
  }

  /**
   * Update a subtask by ID
   * @param id - Subtask ID
   * @param updateSubtaskDto - Fields to update
   * @throws NotFoundException if subtask doesn't exist
   */
  async update(id: number, updateSubtaskDto: UpdateSubtaskDto): Promise<Subtask> {
    // Verify subtask exists
    await this.findOne(id);

    return this.prisma.subtask.update({
      where: { id },
      data: {
        ...(updateSubtaskDto.title && { title: updateSubtaskDto.title }),
        ...(updateSubtaskDto.completed !== undefined && { 
          completed: updateSubtaskDto.completed 
        }),
      },
    });
  }

  /**
   * Delete a subtask by ID
   * @param id - Subtask ID
   * @throws NotFoundException if subtask doesn't exist
   */
  async remove(id: number): Promise<void> {
    // Verify subtask exists
    await this.findOne(id);

    await this.prisma.subtask.delete({
      where: { id },
    });
  }
}
```

#### 7.5.4 Subtasks Controller

**File: `apps/todo-backend/src/app/subtasks/subtasks.controller.ts`**

```typescript
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { SubtasksService } from './subtasks.service';
import { CreateSubtaskDto } from './dto/create-subtask.dto';
import { UpdateSubtaskDto } from './dto/update-subtask.dto';

@Controller()
export class SubtasksController {
  constructor(private readonly subtasksService: SubtasksService) {}

  /**
   * POST /api/todos/:todoId/subtasks
   * Create a new subtask for a todo
   */
  @Post('todos/:todoId/subtasks')
  @HttpCode(HttpStatus.CREATED)
  create(
    @Param('todoId', ParseIntPipe) todoId: number,
    @Body() createSubtaskDto: CreateSubtaskDto,
  ) {
    return this.subtasksService.create(todoId, createSubtaskDto);
  }

  /**
   * GET /api/todos/:todoId/subtasks
   * Get all subtasks for a todo
   */
  @Get('todos/:todoId/subtasks')
  findAllByTodo(@Param('todoId', ParseIntPipe) todoId: number) {
    return this.subtasksService.findAllByTodo(todoId);
  }

  /**
   * PATCH /api/subtasks/:id
   * Update a subtask
   */
  @Patch('subtasks/:id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateSubtaskDto: UpdateSubtaskDto,
  ) {
    return this.subtasksService.update(id, updateSubtaskDto);
  }

  /**
   * DELETE /api/subtasks/:id
   * Delete a subtask
   */
  @Delete('subtasks/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.subtasksService.remove(id);
  }
}
```

**Note on Controller Decorator**:
- No base route in `@Controller()` - allows mixed routes
- Some routes start with `todos/:todoId/subtasks`
- Others start with `subtasks/:id`

#### 7.5.5 Subtasks Module

**File: `apps/todo-backend/src/app/subtasks/subtasks.module.ts`**

```typescript
import { Module } from '@nestjs/common';
import { SubtasksService } from './subtasks.service';
import { SubtasksController } from './subtasks.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [SubtasksController],
  providers: [SubtasksService, PrismaService],
  exports: [SubtasksService],
})
export class SubtasksModule {}
```

### 7.6 Root Application Module

**File: `apps/todo-backend/src/app/app.module.ts`**

**Purpose**: Wire up all feature modules

```typescript
import { Module } from '@nestjs/common';
import { TodosModule } from './todos/todos.module';
import { SubtasksModule } from './subtasks/subtasks.module';
import { PrismaService } from './prisma/prisma.service';

@Module({
  imports: [
    TodosModule,     // Import todos feature
    SubtasksModule,  // Import subtasks feature
  ],
  providers: [PrismaService], // Global Prisma service
})
export class AppModule {}
```

### 7.7 Main Entry Point with CORS

**File: `apps/todo-backend/src/main.ts`**

**Purpose**: Bootstrap the NestJS application

```typescript
import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Set global API prefix (all routes start with /api)
  const globalPrefix = 'api';
  app.setGlobalPrefix(globalPrefix);

  // Enable CORS for React frontend
  app.enableCors({
    origin: [
      'http://localhost:4200',  // NX default React dev server
      'http://localhost:3000',  // Alternative React port
      'http://localhost:5173',  // Vite default port
    ],
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // Enable global validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,              // Strip non-DTO properties
      forbidNonWhitelisted: true,   // Throw error on extra properties
      transform: true,               // Auto-transform types
      transformOptions: {
        enableImplicitConversion: true, // Auto-convert types
      },
    }),
  );

  const port = process.env.PORT || 3000;
  await app.listen(port);

  Logger.log(
    `🚀 Backend API is running on: http://localhost:${port}/${globalPrefix}`,
    'Bootstrap'
  );
  Logger.log(
    `📚 API Documentation: http://localhost:${port}/${globalPrefix}/docs`,
    'Bootstrap'
  );
}

bootstrap();
```

**CORS Configuration Explained**:
- `origin`: Which domains can make requests
- `methods`: Allowed HTTP methods
- `credentials`: Allow cookies/auth headers
- `allowedHeaders`: What headers frontend can send

**ValidationPipe Options**:
- `whitelist`: Remove unknown properties
- `forbidNonWhitelisted`: Error on unknown properties
- `transform`: Convert string "true" to boolean true
- `transformOptions`: Additional conversion rules

### 7.8 Running the Backend

```bash
# From project root
npx nx serve todo-backend

# Or with watch mode (default in NX)
npx nx serve todo-backend --watch

# Backend will run on:
# http://localhost:3000
# API routes: http://localhost:3000/api/...
```

**Verify Backend is Running**:
```bash
# Test GET /api/todos
curl http://localhost:3000/api/todos

# Expected: [] or array of todos
```

---

## 8. Frontend Implementation (React)

### 8.1 Install Frontend Dependencies

```bash
# From project root
npm install axios         # HTTP client
npm install date-fns      # Date formatting

# Or using yarn
yarn add axios date-fns
```

### 8.2 Project Structure

```
todo-frontend/src/app/
├── components/
│   ├── TodoList.tsx          # Main container
│   ├── TodoItem.tsx          # Individual todo
│   ├── TodoForm.tsx          # Create/edit todo
│   ├── SubtaskList.tsx       # List of subtasks
│   └── SubtaskForm.tsx       # Create/edit subtask
├── services/
│   └── api.service.ts        # API client
├── App.tsx                   # Root component
└── App.css                   # Global styles
```

### 8.3 API Service Layer

**File: `apps/todo-frontend/src/app/services/api.service.ts`**

**Purpose**: Centralize all API calls

```typescript
import axios, { AxiosInstance } from 'axios';

// Base API URL - adjust based on environment
const API_BASE_URL = process.env.NX_API_URL || 'http://localhost:3000/api';

// Create axios instance with default config
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 second timeout
});

// ===== TypeScript Interfaces =====

export interface Todo {
  id: number;
  title: string;
  description: string | null;
  completed: boolean;
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
  subtasks?: Subtask[];
}

export interface Subtask {
  id: number;
  title: string;
  completed: boolean;
  todoId: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTodoDto {
  title: string;
  description?: string;
  completed?: boolean;
  dueDate?: string;
}

export interface UpdateTodoDto {
  title?: string;
  description?: string;
  completed?: boolean;
  dueDate?: string;
}

export interface CreateSubtaskDto {
  title: string;
  completed?: boolean;
}

export interface UpdateSubtaskDto {
  title?: string;
  completed?: boolean;
}

// ===== Todo API Functions =====

export const todoApi = {
  /**
   * Get all todos with subtasks
   */
  getAll: async () => {
    return apiClient.get<Todo[]>('/todos');
  },

  /**
   * Get a single todo by ID
   */
  getOne: async (id: number) => {
    return apiClient.get<Todo>(`/todos/${id}`);
  },

  /**
   * Create a new todo
   */
  create: async (data: CreateTodoDto) => {
    return apiClient.post<Todo>('/todos', data);
  },

  /**
   * Update a todo
   */
  update: async (id: number, data: UpdateTodoDto) => {
    return apiClient.patch<Todo>(`/todos/${id}`, data);
  },

  /**
   * Delete a todo
   */
  delete: async (id: number) => {
    return apiClient.delete(`/todos/${id}`);
  },
};

// ===== Subtask API Functions =====

export const subtaskApi = {
  /**
   * Get all subtasks for a todo
   */
  getAllByTodo: async (todoId: number) => {
    return apiClient.get<Subtask[]>(`/todos/${todoId}/subtasks`);
  },

  /**
   * Create a new subtask
   */
  create: async (todoId: number, data: CreateSubtaskDto) => {
    return apiClient.post<Subtask>(`/todos/${todoId}/subtasks`, data);
  },

  /**
   * Update a subtask
   */
  update: async (id: number, data: UpdateSubtaskDto) => {
    return apiClient.patch<Subtask>(`/subtasks/${id}`, data);
  },

  /**
   * Delete a subtask
   */
  delete: async (id: number) => {
    return apiClient.delete(`/subtasks/${id}`);
  },
};

// ===== Request/Response Interceptors =====

// Request interceptor (add auth token, etc.)
apiClient.interceptors.request.use(
  (config) => {
    // Add auth token if available
    // const token = localStorage.getItem('token');
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor (handle errors globally)
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Server responded with error
      console.error('API Error:', error.response.data);
    } else if (error.request) {
      // No response received
      console.error('Network Error:', error.message);
    } else {
      // Request setup error
      console.error('Request Error:', error.message);
    }
    return Promise.reject(error);
  }
);
```

**Key Features**:
- Centralized base URL configuration
- Type-safe API functions
- Request/response interceptors
- Error handling
- Timeout configuration

### 8.4 React Components

#### 8.4.1 TodoForm Component

**File: `apps/todo-frontend/src/app/components/TodoForm.tsx`**

**Purpose**: Form for creating new todos

```typescript
import React, { useState } from 'react';
import { CreateTodoDto } from '../services/api.service';

interface TodoFormProps {
  onSubmit: (data: CreateTodoDto) => Promise<void>;
  onCancel?: () => void;
  initialData?: CreateTodoDto;
}

export const TodoForm: React.FC<TodoFormProps> = ({ 
  onSubmit, 
  onCancel,
  initialData 
}) => {
  const [title, setTitle] = useState(initialData?.title || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [dueDate, setDueDate] = useState(initialData?.dueDate || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      setError('Title is required');
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      await onSubmit({
        title: title.trim(),
        description: description.trim() || undefined,
        dueDate: dueDate || undefined,
      });
      
      // Reset form on success
      setTitle('');
      setDescription('');
      setDueDate('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create todo');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="todo-form">
      {error && (
        <div className="error-message" role="alert">
          {error}
        </div>
      )}

      <div className="form-group">
        <label htmlFor="title">
          Title <span className="required">*</span>
        </label>
        <input
          id="title"
          type="text"
          placeholder="Enter todo title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          disabled={isSubmitting}
          className="input-field"
          maxLength={255}
        />
      </div>

      <div className="form-group">
        <label htmlFor="description">Description</label>
        <textarea
          id="description"
          placeholder="Optional description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          disabled={isSubmitting}
          className="input-field"
          rows={3}
          maxLength={5000}
        />
      </div>

      <div className="form-group">
        <label htmlFor="dueDate">Due Date</label>
        <input
          id="dueDate"
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          disabled={isSubmitting}
          className="input-field"
        />
      </div>

      <div className="form-actions">
        <button 
          type="submit" 
          disabled={isSubmitting || !title.trim()} 
          className="btn btn-primary"
        >
          {isSubmitting ? 'Creating...' : 'Add Todo'}
        </button>
        
        {onCancel && (
          <button 
            type="button" 
            onClick={onCancel} 
            disabled={isSubmitting} 
            className="btn btn-secondary"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
};
```

**Component Features**:
- Controlled inputs (React state)
- Form validation
- Loading states
- Error handling
- Accessibility (labels, ARIA)

#### 8.4.2 SubtaskForm Component

**File: `apps/todo-frontend/src/app/components/SubtaskForm.tsx`**

```typescript
import React, { useState } from 'react';
import { CreateSubtaskDto } from '../services/api.service';

interface SubtaskFormProps {
  todoId: number;
  onSubmit: (data: CreateSubtaskDto) => Promise<void>;
  onCancel?: () => void;
}

export const SubtaskForm: React.FC<SubtaskFormProps> = ({ 
  onSubmit, 
  onCancel 
}) => {
  const [title, setTitle] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSubmitting(true);
    try {
      await onSubmit({ title: title.trim() });
      setTitle(''); // Clear on success
    } catch (error) {
      console.error('Failed to create subtask:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="subtask-form">
      <input
        type="text"
        placeholder="Add a subtask"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        disabled={isSubmitting}
        className="input-field input-small"
        maxLength={255}
        autoFocus
      />
      
      <button 
        type="submit" 
        disabled={isSubmitting || !title.trim()} 
        className="btn btn-small"
      >
        {isSubmitting ? '...' : 'Add'}
      </button>
      
      {onCancel && (
        <button 
          type="button" 
          onClick={onCancel} 
          disabled={isSubmitting} 
          className="btn btn-small btn-secondary"
        >
          Cancel
        </button>
      )}
    </form>
  );
};
```

#### 8.4.3 SubtaskList Component

**File: `apps/todo-frontend/src/app/components/SubtaskList.tsx`**

```typescript
import React, { useState } from 'react';
import { Subtask, UpdateSubtaskDto } from '../services/api.service';

interface SubtaskListProps {
  subtasks: Subtask[];
  onToggle: (id: number, completed: boolean) => Promise<void>;
  onUpdate: (id: number, data: UpdateSubtaskDto) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
}

export const SubtaskList: React.FC<SubtaskListProps> = ({
  subtasks,
  onToggle,
  onUpdate,
  onDelete,
}) => {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState('');

  const startEdit = (subtask: Subtask) => {
    setEditingId(subtask.id);
    setEditTitle(subtask.title);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditTitle('');
  };

  const saveEdit = async (id: number) => {
    if (!editTitle.trim()) return;
    
    try {
      await onUpdate(id, { title: editTitle.trim() });
      setEditingId(null);
      setEditTitle('');
    } catch (error) {
      console.error('Failed to update subtask:', error);
    }
  };

  const handleDelete = async (id: number, title: string) => {
    if (window.confirm(`Delete subtask "${title}"?`)) {
      try {
        await onDelete(id);
      } catch (error) {
        console.error('Failed to delete subtask:', error);
      }
    }
  };

  if (subtasks.length === 0) {
    return <p className="no-subtasks">No subtasks yet</p>;
  }

  return (
    <ul className="subtask-list">
      {subtasks.map((subtask) => (
        <li 
          key={subtask.id} 
          className={`subtask-item ${subtask.completed ? 'completed' : ''}`}
        >
          {editingId === subtask.id ? (
            // Edit mode
            <div className="subtask-edit">
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="input-field input-small"
                maxLength={255}
                autoFocus
              />
              <button 
                onClick={() => saveEdit(subtask.id)} 
                className="btn btn-small"
              >
                Save
              </button>
              <button 
                onClick={cancelEdit} 
                className="btn btn-small btn-secondary"
              >
                Cancel
              </button>
            </div>
          ) : (
            // View mode
            <>
              <input
                type="checkbox"
                checked={subtask.completed}
                onChange={() => onToggle(subtask.id, !subtask.completed)}
                className="checkbox"
                aria-label={`Mark "${subtask.title}" as ${subtask.completed ? 'incomplete' : 'complete'}`}
              />
              
              <span className="subtask-title">{subtask.title}</span>
              
              <div className="subtask-actions">
                <button 
                  onClick={() => startEdit(subtask)} 
                  className="btn-icon" 
                  title="Edit"
                  aria-label={`Edit "${subtask.title}"`}
                >
                  ✏️
                </button>
                <button
                  onClick={() => handleDelete(subtask.id, subtask.title)}
                  className="btn-icon btn-danger"
                  title="Delete"
                  aria-label={`Delete "${subtask.title}"`}
                >
                  🗑️
                </button>
              </div>
            </>
          )}
        </li>
      ))}
    </ul>
  );
};
```

**Component Features**:
- Inline editing
- Toggle completion
- Delete confirmation
- Keyboard accessibility

#### 8.4.4 TodoItem Component

**File: `apps/todo-frontend/src/app/components/TodoItem.tsx`**

**Purpose**: Single todo with expandable subtasks

```typescript
import React, { useState } from 'react';
import { 
  Todo, 
  UpdateTodoDto, 
  CreateSubtaskDto, 
  UpdateSubtaskDto 
} from '../services/api.service';
import { SubtaskList } from './SubtaskList';
import { SubtaskForm } from './SubtaskForm';
import { format } from 'date-fns';

interface TodoItemProps {
  todo: Todo;
  onToggle: (id: number, completed: boolean) => Promise<void>;
  onUpdate: (id: number, data: UpdateTodoDto) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
  onCreateSubtask: (todoId: number, data: CreateSubtaskDto) => Promise<void>;
  onUpdateSubtask: (id: number, data: UpdateSubtaskDto) => Promise<void>;
  onToggleSubtask: (id: number, completed: boolean) => Promise<void>;
  onDeleteSubtask: (id: number) => Promise<void>;
}

export const TodoItem: React.FC<TodoItemProps> = ({
  todo,
  onToggle,
  onUpdate,
  onDelete,
  onCreateSubtask,
  onUpdateSubtask,
  onToggleSubtask,
  onDeleteSubtask,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showSubtaskForm, setShowSubtaskForm] = useState(false);
  
  const [editData, setEditData] = useState({
    title: todo.title,
    description: todo.description || '',
    dueDate: todo.dueDate ? format(new Date(todo.dueDate), 'yyyy-MM-dd') : '',
  });

  const handleUpdate = async () => {
    try {
      await onUpdate(todo.id, {
        title: editData.title.trim(),
        description: editData.description.trim() || undefined,
        dueDate: editData.dueDate || undefined,
      });
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update todo:', error);
    }
  };

  const handleCreateSubtask = async (data: CreateSubtaskDto) => {
    await onCreateSubtask(todo.id, data);
    setShowSubtaskForm(false);
  };

  const handleDelete = () => {
    if (window.confirm(`Delete todo "${todo.title}"? This will also delete all subtasks.`)) {
      onDelete(todo.id);
    }
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return null;
    try {
      return format(new Date(dateStr), 'MMM dd, yyyy');
    } catch {
      return dateStr;
    }
  };

  const completedSubtasks = todo.subtasks?.filter(s => s.completed).length || 0;
  const totalSubtasks = todo.subtasks?.length || 0;

  return (
    <div className={`todo-item ${todo.completed ? 'completed' : ''}`}>
      <div className="todo-header">
        <input
          type="checkbox"
          checked={todo.completed}
          onChange={() => onToggle(todo.id, !todo.completed)}
          className="checkbox"
          aria-label={`Mark "${todo.title}" as ${todo.completed ? 'incomplete' : 'complete'}`}
        />
        
        {isEditing ? (
          // Edit mode
          <div className="todo-edit">
            <input
              type="text"
              value={editData.title}
              onChange={(e) => setEditData({ ...editData, title: e.target.value })}
              className="input-field"
              maxLength={255}
            />
            <textarea
              value={editData.description}
              onChange={(e) => setEditData({ ...editData, description: e.target.value })}
              className="input-field"
              rows={2}
              placeholder="Description"
              maxLength={5000}
            />
            <input
              type="date"
              value={editData.dueDate}
              onChange={(e) => setEditData({ ...editData, dueDate: e.target.value })}
              className="input-field"
            />
            <button onClick={handleUpdate} className="btn btn-small">
              Save
            </button>
            <button onClick={() => setIsEditing(false)} className="btn btn-small btn-secondary">
              Cancel
            </button>
          </div>
        ) : (
          // View mode
          <>
            <div 
              className="todo-content" 
              onClick={() => setIsExpanded(!isExpanded)}
              role="button"
              tabIndex={0}
            >
              <h3 className="todo-title">{todo.title}</h3>
              
              {todo.description && (
                <p className="todo-description">{todo.description}</p>
              )}
              
              {todo.dueDate && (
                <p className="todo-due-date">
                  📅 Due: {formatDate(todo.dueDate)}
                </p>
              )}
              
              {totalSubtasks > 0 && (
                <p className="subtask-count">
                  ✓ {completedSubtasks} / {totalSubtasks} subtasks completed
                </p>
              )}
            </div>
            
            <div className="todo-actions">
              <button 
                onClick={() => setIsEditing(true)} 
                className="btn-icon" 
                title="Edit"
                aria-label={`Edit "${todo.title}"`}
              >
                ✏️
              </button>
              <button 
                onClick={handleDelete} 
                className="btn-icon btn-danger" 
                title="Delete"
                aria-label={`Delete "${todo.title}"`}
              >
                🗑️
              </button>
              <button 
                onClick={() => setIsExpanded(!isExpanded)} 
                className="btn-icon" 
                title="Toggle details"
                aria-label="Toggle subtasks"
              >
                {isExpanded ? '▲' : '▼'}
              </button>
            </div>
          </>
        )}
      </div>

      {/* Expandable subtasks section */}
      {isExpanded && !isEditing && (
        <div className="todo-details">
          <div className="subtasks-section">
            <div className="subtasks-header">
              <h4>Subtasks</h4>
              <button
                onClick={() => setShowSubtaskForm(!showSubtaskForm)}
                className="btn btn-small"
              >
                {showSubtaskForm ? 'Cancel' : '+ Add Subtask'}
              </button>
            </div>
            
            {showSubtaskForm && (
              <SubtaskForm
                todoId={todo.id}
                onSubmit={handleCreateSubtask}
                onCancel={() => setShowSubtaskForm(false)}
              />
            )}
            
            <SubtaskList
              subtasks={todo.subtasks || []}
              onToggle={onToggleSubtask}
              onUpdate={onUpdateSubtask}
              onDelete={onDeleteSubtask}
            />
          </div>
        </div>
      )}
    </div>
  );
};
```

#### 8.4.5 TodoList Component (Main Container)

**File: `apps/todo-frontend/src/app/components/TodoList.tsx`**

**Purpose**: Main container managing todos state

```typescript
import React, { useEffect, useState, useCallback } from 'react';
import {
  todoApi,
  subtaskApi,
  Todo,
  CreateTodoDto,
  UpdateTodoDto,
  CreateSubtaskDto,
  UpdateSubtaskDto,
} from '../services/api.service';
import { TodoItem } from './TodoItem';
import { TodoForm } from './TodoForm';

export const TodoList: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  // Load all todos
  const loadTodos = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await todoApi.getAll();
      setTodos(response.data);
    } catch (err: any) {
      setError('Failed to load todos. Please check your connection.');
      console.error('Error loading todos:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTodos();
  }, [loadTodos]);

  // ===== Todo Operations =====

  const handleCreateTodo = async (data: CreateTodoDto) => {
    const response = await todoApi.create(data);
    setTodos([response.data, ...todos]);
    setShowForm(false);
  };

  const handleUpdateTodo = async (id: number, data: UpdateTodoDto) => {
    const response = await todoApi.update(id, data);
    setTodos(todos.map((t) => (t.id === id ? response.data : t)));
  };

  const handleToggleTodo = async (id: number, completed: boolean) => {
    await handleUpdateTodo(id, { completed });
  };

  const handleDeleteTodo = async (id: number) => {
    await todoApi.delete(id);
    setTodos(todos.filter((t) => t.id !== id));
  };

  // ===== Subtask Operations =====

  const handleCreateSubtask = async (todoId: number, data: CreateSubtaskDto) => {
    const response = await subtaskApi.create(todoId, data);
    setTodos(
      todos.map((t) =>
        t.id === todoId
          ? { ...t, subtasks: [...(t.subtasks || []), response.data] }
          : t
      )
    );
  };

  const handleUpdateSubtask = async (id: number, data: UpdateSubtaskDto) => {
    const response = await subtaskApi.update(id, data);
    setTodos(
      todos.map((t) => ({
        ...t,
        subtasks: t.subtasks?.map((s) => (s.id === id ? response.data : s)),
      }))
    );
  };

  const handleToggleSubtask = async (id: number, completed: boolean) => {
    await handleUpdateSubtask(id, { completed });
  };

  const handleDeleteSubtask = async (id: number) => {
    await subtaskApi.delete(id);
    setTodos(
      todos.map((t) => ({
        ...t,
        subtasks: t.subtasks?.filter((s) => s.id !== id),
      }))
    );
  };

  // ===== Render =====

  if (isLoading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <p>Loading todos...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error">
        <p>{error}</p>
        <button onClick={loadTodos} className="btn">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="todo-list-container">
      <div className="todo-list-header">
        <h1>My Todos</h1>
        <button 
          onClick={() => setShowForm(!showForm)} 
          className="btn btn-primary"
        >
          {showForm ? 'Cancel' : '+ New Todo'}
        </button>
      </div>

      {showForm && (
        <div className="todo-form-container">
          <TodoForm 
            onSubmit={handleCreateTodo} 
            onCancel={() => setShowForm(false)} 
          />
        </div>
      )}

      {todos.length === 0 ? (
        <div className="empty-state">
          <p>🎯 No todos yet. Create your first todo!</p>
        </div>
      ) : (
        <div className="todo-list">
          {todos.map((todo) => (
            <TodoItem
              key={todo.id}
              todo={todo}
              onToggle={handleToggleTodo}
              onUpdate={handleUpdateTodo}
              onDelete={handleDeleteTodo}
              onCreateSubtask={handleCreateSubtask}
              onUpdateSubtask={handleUpdateSubtask}
              onToggleSubtask={handleToggleSubtask}
              onDeleteSubtask={handleDeleteSubtask}
            />
          ))}
        </div>
      )}
    </div>
  );
};
```

**State Management Pattern**:
- Single source of truth (todos array)
- Optimistic updates
- Error handling
- Loading states

### 8.5 Main App Component

**File: `apps/todo-frontend/src/app/App.tsx`**

```typescript
import { TodoList } from './components/TodoList';
import './App.css';

export function App() {
  return (
    <div className="app">
      <TodoList />
    </div>
  );
}

export default App;
```

### 8.6 Styling

**File: `apps/todo-frontend/src/app/App.css`**

This file contains all the CSS needed for the application. It includes:
- Layout and typography
- Form styling
- Button styles
- Todo/subtask item styling
- Responsive design
- Loading states
- Animations

**Note**: The CSS code is too long for this section. Key features:
- Clean, modern design
- Hover effects
- Responsive grid layout
- Accessibility-focused
- Mobile-friendly

### 8.7 Running the Frontend

```bash
# From project root
npx nx serve todo-frontend

# Frontend will run on:
# http://localhost:4200

# Open in browser to see the app
```

---

## 9. Shared Libraries Setup

### 9.1 Shared Types Library

**File: `libs/shared-types/src/lib/interfaces.ts`**

**Purpose**: Share TypeScript interfaces between frontend and backend

```typescript
// ===== Entity Interfaces =====

export interface Todo {
  id: number;
  title: string;
  description: string | null;
  completed: boolean;
  dueDate: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Subtask {
  id: number;
  title: string;
  completed: boolean;
  todoId: number;
  createdAt: Date;
  updatedAt: Date;
}

// ===== DTO Interfaces =====

export interface CreateTodoDto {
  title: string;
  description?: string;
  completed?: boolean;
  dueDate?: string;
}

export interface UpdateTodoDto {
  title?: string;
  description?: string;
  completed?: boolean;
  dueDate?: string;
}

export interface CreateSubtaskDto {
  title: string;
  completed?: boolean;
}

export interface UpdateSubtaskDto {
  title?: string;
  completed?: boolean;
}

// ===== Response Types =====

export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}
```

**File: `libs/shared-types/src/index.ts`**

```typescript
export * from './lib/interfaces';
```

### 9.2 Using Shared Types

**In Backend:**
```typescript
import { CreateTodoDto, UpdateTodoDto } from '@todo-app-monorepo/shared-types';

// Use in service, controller, etc.
```

**In Frontend:**
```typescript
import { Todo, Subtask } from '@todo-app-monorepo/shared-types';

// Use in components, services
```

**Benefits:**
- Single source of truth for types
- Automatic type checking across apps
- Easier refactoring
- Prevents frontend/backend drift

---

## 10. API Documentation

### 10.1 Complete API Endpoints Reference

**Base URL**: `http://localhost:3000/api`

#### Todo Endpoints

| Method | Endpoint | Description | Auth | Request Body | Response | Status Codes |
|--------|----------|-------------|------|--------------|----------|--------------|
| POST | `/todos` | Create a new todo | Optional | `CreateTodoDto` | `Todo` | 201, 400 |
| GET | `/todos` | Get all todos | Optional | - | `Todo[]` | 200 |
| GET | `/todos/:id` | Get a specific todo | Optional | - | `Todo` | 200, 404 |
| PATCH | `/todos/:id` | Update a todo | Optional | `UpdateTodoDto` | `Todo` | 200, 400, 404 |
| DELETE | `/todos/:id` | Delete a todo | Optional | - | - | 204, 404 |

#### Subtask Endpoints

| Method | Endpoint | Description | Auth | Request Body | Response | Status Codes |
|--------|----------|-------------|------|--------------|----------|--------------|
| POST | `/todos/:todoId/subtasks` | Create a subtask | Optional | `CreateSubtaskDto` | `Subtask` | 201, 400, 404 |
| GET | `/todos/:todoId/subtasks` | Get todo's subtasks | Optional | - | `Subtask[]` | 200, 404 |
| PATCH | `/subtasks/:id` | Update a subtask | Optional | `UpdateSubtaskDto` | `Subtask` | 200, 400, 404 |
| DELETE | `/subtasks/:id` | Delete a subtask | Optional | - | - | 204, 404 |

### 10.2 Request/Response Examples

#### Create Todo
```http
POST http://localhost:3000/api/todos
Content-Type: application/json

{
  "title": "Learn TypeScript",
  "description": "Master TypeScript for full-stack development",
  "dueDate": "2024-12-31"
}
```

**Response (201)**:
```json
{
  "id": 1,
  "title": "Learn TypeScript",
  "description": "Master TypeScript for full-stack development",
  "completed": false,
  "dueDate": "2024-12-31T00:00:00.000Z",
  "createdAt": "2024-03-17T10:00:00.000Z",
  "updatedAt": "2024-03-17T10:00:00.000Z",
  "subtasks": []
}
```

#### Get All Todos
```http
GET http://localhost:3000/api/todos
```

**Response (200)**:
```json
[
  {
    "id": 1,
    "title": "Learn TypeScript",
    "description": "Master TypeScript for full-stack development",
    "completed": false,
    "dueDate": "2024-12-31T00:00:00.000Z",
    "createdAt": "2024-03-17T10:00:00.000Z",
    "updatedAt": "2024-03-17T10:00:00.000Z",
    "subtasks": [
      {
        "id": 1,
        "title": "Read TypeScript handbook",
        "completed": true,
        "todoId": 1,
        "createdAt": "2024-03-17T10:05:00.000Z",
        "updatedAt": "2024-03-17T10:05:00.000Z"
      }
    ]
  }
]
```

#### Update Todo (Toggle Completion)
```http
PATCH http://localhost:3000/api/todos/1
Content-Type: application/json

{
  "completed": true
}
```

#### Create Subtask
```http
POST http://localhost:3000/api/todos/1/subtasks
Content-Type: application/json

{
  "title": "Practice with exercises"
}
```

### 10.3 Error Response Format

All errors follow this structure:

```json
{
  "statusCode": 404,
  "message": "Todo with ID 999 not found",
  "error": "Not Found"
}
```

**Common Status Codes**:
- `400 Bad Request`: Validation error
- `404 Not Found`: Resource not found
- `500 Internal Server Error`: Server error

---

## 11. Development Workflow

### 11.1 Complete Setup From Scratch

**Step-by-Step Commands**:

```bash
# 1. Create workspace
npx create-nx-workspace@latest todo-app-monorepo
cd todo-app-monorepo

# 2. Install plugins
npm install -D @nx/react @nx/nest @nx/node

# 3. Generate apps
npx nx g @nx/nest:app todo-backend --directory=apps/todo-backend
npx nx g @nx/react:app todo-frontend --directory=apps/todo-frontend --bundler=vite
npx nx g @nx/js:lib shared-types --directory=libs/shared-types

# 4. Install dependencies
npm install @prisma/client class-validator class-transformer axios date-fns
npm install -D prisma

# 5. Setup Prisma
cd apps/todo-backend
npx prisma init
# Edit prisma/schema.prisma with your schema
# Edit .env with your DATABASE_URL

# 6. Run migrations
npx prisma migrate dev --name init
npx prisma generate
cd ../..

# 7. Implement backend code
# - Create all backend files as shown in section 7

# 8. Implement frontend code
# - Create all frontend files as shown in section 8

# 9. Start development servers
# Terminal 1:
npx nx serve todo-backend

# Terminal 2:
npx nx serve todo-frontend

# 10. Open browser
# http://localhost:4200
```

### 11.2 Daily Development Commands

```bash
# Start both apps simultaneously
npx nx run-many --target=serve --projects=todo-backend,todo-frontend --parallel

# Or use specific commands:
npx nx serve todo-backend    # Start backend (port 3000)
npx nx serve todo-frontend   # Start frontend (port 4200)

# Run tests
npx nx test todo-backend     # Backend unit tests
npx nx test todo-frontend    # Frontend unit tests
npx nx run-many --target=test --all  # All tests

# Lint code
npx nx lint todo-backend
npx nx lint todo-frontend
npx nx run-many --target=lint --all

# Build for production
npx nx build todo-backend
npx nx build todo-frontend
npx nx run-many --target=build --all

# View dependency graph
npx nx graph

# Run affected commands (only changed projects)
npx nx affected:test
npx nx affected:lint
npx nx affected:build
```

### 11.3 Git Workflow

```bash
# Initial commit
git init
git add .
git commit -m "Initial commit: NX Todo app setup"

# Create feature branch
git checkout -b feature/add-user-auth

# Commit changes
git add .
git commit -m "feat: add user authentication"

# Push to remote
git push origin feature/add-user-auth

# Merge to main
git checkout main
git merge feature/add-user-auth
```

**Recommended .gitignore additions**:
```
# Environment files
.env
.env.local
.env.*.local

# Prisma
apps/todo-backend/prisma/migrations/**/migration.sql

# Build outputs
dist/
build/

# Dependencies
node_modules/

# IDE
.idea/
.vscode/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db
```

### 11.4 Database Management

```bash
# View database in GUI
cd apps/todo-backend
npx prisma studio
# Opens http://localhost:5555

# Create new migration
npx prisma migrate dev --name add_user_field

# Reset database (WARNING: deletes all data)
npx prisma migrate reset

# Apply migrations to production
npx prisma migrate deploy

# Generate Prisma Client after schema changes
npx prisma generate

# Seed database
npx prisma db seed
```

---

## 12. Testing Strategy

### 12.1 Backend Testing

**Unit Tests for Services**

**File: `apps/todo-backend/src/app/todos/todos.service.spec.ts`**

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { TodosService } from './todos.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';

describe('TodosService', () => {
  let service: TodosService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TodosService,
        {
          provide: PrismaService,
          useValue: {
            todo: {
              create: jest.fn(),
              findMany: jest.fn(),
              findUnique: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<TodosService>(TodosService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a todo', async () => {
      const createDto = {
        title: 'Test Todo',
        description: 'Test Description',
      };

      const mockTodo = {
        id: 1,
        ...createDto,
        completed: false,
        dueDate: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        subtasks: [],
      };

      jest.spyOn(prisma.todo, 'create').mockResolvedValue(mockTodo);

      const result = await service.create(createDto);
      expect(result).toEqual(mockTodo);
      expect(prisma.todo.create).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should throw NotFoundException when todo not found', async () => {
      jest.spyn(prisma.todo, 'findUnique').mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });
});
```

**Integration Tests for Controllers**

```bash
# Run backend tests
npx nx test todo-backend

# Run with coverage
npx nx test todo-backend --coverage

# Watch mode
npx nx test todo-backend --watch
```

### 12.2 Frontend Testing

**Component Tests**

**File: `apps/todo-frontend/src/app/components/TodoForm.spec.tsx`**

```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { TodoForm } from './TodoForm';

describe('TodoForm', () => {
  it('should render form fields', () => {
    render(<TodoForm onSubmit={jest.fn()} />);
    
    expect(screen.getByLabelText(/title/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/due date/i)).toBeInTheDocument();
  });

  it('should call onSubmit with form data', async () => {
    const mockSubmit = jest.fn().mockResolvedValue(undefined);
    render(<TodoForm onSubmit={mockSubmit} />);

    fireEvent.change(screen.getByLabelText(/title/i), {
      target: { value: 'Test Todo' },
    });

    fireEvent.click(screen.getByRole('button', { name: /add todo/i }));

    await waitFor(() => {
      expect(mockSubmit).toHaveBeenCalledWith({
        title: 'Test Todo',
        description: undefined,
        dueDate: undefined,
      });
    });
  });

  it('should show validation error for empty title', () => {
    render(<TodoForm onSubmit={jest.fn()} />);
    
    fireEvent.click(screen.getByRole('button', { name: /add todo/i }));

    expect(screen.getByText(/title is required/i)).toBeInTheDocument();
  });
});
```

```bash
# Run frontend tests
npx nx test todo-frontend

# With coverage
npx nx test todo-frontend --coverage

# Watch mode
npx nx test todo-frontend --watch
```

### 12.3 E2E Testing (Optional)

```bash
# Install Playwright
npm install -D @nx/playwright

# Generate E2E project
npx nx g @nx/playwright:configuration --project=todo-frontend-e2e

# Run E2E tests
npx nx e2e todo-frontend-e2e
```

---

## 13. Deployment Guide

### 13.1 Backend Deployment

#### Option A: Heroku

```bash
# Install Heroku CLI
# https://devcenter.heroku.com/articles/heroku-cli

# Login
heroku login

# Create app
heroku create todo-app-backend

# Set environment variables
heroku config:set DATABASE_URL="mysql://..."

# Deploy
git push heroku main

# Run migrations
heroku run npx prisma migrate deploy
```

#### Option B: Railway

1. Go to [railway.app](https://railway.app)
2. Connect GitHub repository
3. Deploy backend app
4. Add MySQL database from Railway catalog
5. Set environment variables
6. Migrations run automatically

#### Option C: Docker

**File: `apps/todo-backend/Dockerfile`**

```dockerfile
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY apps/todo-backend/package*.json ./apps/todo-backend/

# Install dependencies
RUN npm ci

# Copy source
COPY . .

# Generate Prisma Client
RUN npx prisma generate --schema=apps/todo-backend/prisma/schema.prisma

# Build
RUN npx nx build todo-backend --production

# Production image
FROM node:18-alpine

WORKDIR /app

COPY --from=builder /app/dist/apps/todo-backend ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/todo-backend/prisma ./prisma

EXPOSE 3000

CMD ["node", "main.js"]
```

### 13.2 Frontend Deployment

#### Option A: Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
cd apps/todo-frontend
vercel

# Set environment variable
vercel env add NX_API_URL production
# Enter: https://your-backend.herokuapp.com/api
```

#### Option B: Netlify

```bash
# Build frontend
npx nx build todo-frontend --configuration=production

# Deploy dist folder
netlify deploy --dir=dist/apps/todo-frontend

# Set environment
netlify env:set NX_API_URL https://your-backend.herokuapp.com/api
```

#### Option C: Static Hosting

```bash
# Build for production
npx nx build todo-frontend --configuration=production

# Output is in: dist/apps/todo-frontend
# Upload to:
# - AWS S3 + CloudFront
# - Firebase Hosting
# - GitHub Pages
# - Any static host
```

### 13.3 Environment Configuration

**Backend `.env` (production)**:
```env
DATABASE_URL="mysql://user:pass@prod-host:3306/todo_db"
NODE_ENV=production
PORT=3000
```

**Frontend environment**:
Create `apps/todo-frontend/.env.production`:
```env
NX_API_URL=https://api.yourdomain.com/api
```

---

## 14. Troubleshooting

### 14.1 Common Issues

#### "Cannot connect to database"

**Problem**: Backend can't reach MySQL

**Solutions**:
```bash
# Check DATABASE_URL format
mysql://username:password@host:port/database

# Test MySQL connection
mysql -h host -u username -p database

# Check if MySQL is running
# Mac/Linux: sudo systemctl status mysql
# Windows: Check Services

# Verify .env file exists and is loaded
cat apps/todo-backend/.env

# Check Prisma schema datasource
cat apps/todo-backend/prisma/schema.prisma
```

#### "Prisma Client not generated"

**Problem**: Import errors for @prisma/client

**Solution**:
```bash
cd apps/todo-backend
npx prisma generate
cd ../..
```

#### "CORS error in browser"

**Problem**: Frontend can't call backend API

**Solution**:
```typescript
// In apps/todo-backend/src/main.ts
app.enableCors({
  origin: 'http://localhost:4200', // Add your frontend URL
  credentials: true,
});
```

#### "Module not found" errors

**Problem**: Import paths not resolving

**Solution**:
```bash
# Check tsconfig.base.json paths
cat tsconfig.base.json

# Should include:
{
  "compilerOptions": {
    "paths": {
      "@todo-app-monorepo/shared-types": ["libs/shared-types/src/index.ts"]
    }
  }
}

# Restart TypeScript server in IDE
# VS Code: Cmd+Shift+P → "Restart TypeScript Server"
```

#### "Port already in use"

**Problem**: 3000 or 4200 already taken

**Solution**:
```bash
# Find process using port
# Mac/Linux:
lsof -i :3000
kill -9 <PID>

# Windows:
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Or change port in project.json
```

### 14.2 Debug Mode

**Backend Debugging**:
```json
// .vscode/launch.json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Debug Backend",
      "type": "node",
      "request": "launch",
      "runtimeExecutable": "npx",
      "runtimeArgs": ["nx", "serve", "todo-backend", "--", "--inspect"],
      "console": "integratedTerminal"
    }
  ]
}
```

**Frontend Debugging**:
```json
{
  "name": "Debug Frontend",
  "type": "chrome",
  "request": "launch",
  "url": "http://localhost:4200",
  "webRoot": "${workspaceFolder}/apps/todo-frontend/src"
}
```

### 14.3 Performance Issues

**Slow Database Queries**:
```bash
# Add indexes to frequently queried fields
# In prisma/schema.prisma:
model Todo {
  @@index([completed])
  @@index([dueDate])
}

# Create migration
npx prisma migrate dev --name add_indexes
```

**Large Response Payloads**:
```typescript
// Implement pagination in todos.service.ts
async findAll(page = 1, limit = 20) {
  const skip = (page - 1) * limit;
  
  return this.prisma.todo.findMany({
    skip,
    take: limit,
    include: { subtasks: true },
  });
}
```

---

## 15. Advanced Features & Enhancements

### 15.1 Authentication & Authorization

**Add User Model**:
```prisma
model User {
  id        Int      @id @default(autoincrement())
  email     String   @unique
  password  String
  todos     Todo[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Todo {
  // ... existing fields
  userId    Int
  user      User     @relation(fields: [userId], references: [id])
}
```

**Implement JWT Auth**:
```bash
npm install @nestjs/jwt @nestjs/passport passport passport-jwt bcrypt
npm install -D @types/passport-jwt @types/bcrypt
```

### 15.2 Real-Time Updates (WebSockets)

```bash
npm install @nestjs/websockets @nestjs/platform-socket.io socket.io-client
```

**Gateway Implementation**:
```typescript
// todos.gateway.ts
@WebSocketGateway()
export class TodosGateway {
  @WebSocketServer()
  server: Server;

  notifyTodoCreated(todo: Todo) {
    this.server.emit('todoCreated', todo);
  }
}
```

### 15.3 Pagination & Filtering

**Backend**:
```typescript
async findAll(query: {
  page?: number;
  limit?: number;
  completed?: boolean;
  search?: string;
}) {
  const where = {
    ...(query.completed !== undefined && { completed: query.completed }),
    ...(query.search && {
      OR: [
        { title: { contains: query.search } },
        { description: { contains: query.search } },
      ],
    }),
  };

  const [todos, total] = await Promise.all([
    this.prisma.todo.findMany({
      where,
      skip: (query.page - 1) * query.limit,
      take: query.limit,
      include: { subtasks: true },
    }),
    this.prisma.todo.count({ where }),
  ]);

  return { todos, total, page: query.page, pages: Math.ceil(total / query.limit) };
}
```

### 15.4 File Uploads (Attachments)

```bash
npm install multer
npm install -D @types/multer
```

```typescript
@Post('todos/:id/attachments')
@UseInterceptors(FileInterceptor('file'))
async uploadAttachment(
  @Param('id') id: number,
  @UploadedFile() file: Express.Multer.File,
) {
  // Store file and create attachment record
}
```

### 15.5 Email Notifications

```bash
npm install @nestjs-modules/mailer nodemailer
```

**Overdue Todo Reminders**:
```typescript
@Injectable()
export class NotificationService {
  async sendOverdueReminders() {
    const overdueTodos = await this.prisma.todo.findMany({
      where: {
        completed: false,
        dueDate: { lt: new Date() },
      },
    });

    for (const todo of overdueTodos) {
      await this.mailer.sendMail({
        to: todo.user.email,
        subject: 'Overdue Todo Reminder',
        template: 'overdue-todo',
        context: { todo },
      });
    }
  }
}
```

### 15.6 Caching with Redis

```bash
npm install @nestjs/cache-manager cache-manager
npm install cache-manager-redis-store
```

```typescript
@Injectable()
export class TodosService {
  constructor(
    private prisma: PrismaService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async findAll() {
    const cached = await this.cacheManager.get('todos');
    if (cached) return cached;

    const todos = await this.prisma.todo.findMany();
    await this.cacheManager.set('todos', todos, 300); // 5 min TTL
    return todos;
  }
}
```

### 15.7 API Documentation (Swagger)

```bash
npm install @nestjs/swagger swagger-ui-express
```

```typescript
// main.ts
const config = new DocumentBuilder()
  .setTitle('Todo API')
  .setDescription('Todo application API documentation')
  .setVersion('1.0')
  .build();

const document = SwaggerModule.createDocument(app, config);
SwaggerModule.setup('api/docs', app, document);

// Access at: http://localhost:3000/api/docs
```

### 15.8 Internationalization (i18n)

**Frontend with react-i18next**:
```bash
npm install react-i18next i18next
```

**Backend with nestjs-i18n**:
```bash
npm install nestjs-i18n
```

### 15.9 Dark Mode

**Frontend**:
```typescript
// Add theme context
const ThemeContext = React.createContext({
  theme: 'light',
  toggleTheme: () => {},
});

// Toggle via CSS classes
document.body.classList.toggle('dark-mode');
```

### 15.10 Mobile App (React Native)

```bash
# Generate React Native app in NX
npm install -D @nx/react-native
npx nx g @nx/react-native:app todo-mobile
```

---

## 🎯 Next Steps

**Immediate Actions**:
1. ✅ Follow section 4 to create the workspace
2. ✅ Set up database (section 6)
3. ✅ Implement backend (section 7)
4. ✅ Implement frontend (section 8)
5. ✅ Test locally (section 11)

**Short-term Goals**:
- Add user authentication
- Implement search and filtering
- Add due date notifications
- Create mobile-responsive design

**Long-term Goals**:
- Deploy to production
- Add team collaboration features
- Implement real-time sync
- Create mobile app
- Add analytics and reporting

---

## 📚 Additional Resources

**Official Documentation**:
- [NX Docs](https://nx.dev)
- [NestJS Docs](https://docs.nestjs.com)
- [React Docs](https://react.dev)
- [Prisma Docs](https://www.prisma.io/docs)

**Tutorials**:
- [NX Tutorial](https://nx.dev/getting-started/intro)
- [NestJS Tutorial](https://docs.nestjs.com/first-steps)
- [Prisma Quickstart](https://www.prisma.io/docs/getting-started/quickstart)

**Community**:
- [NX Discord](https://go.nx.dev/community)
- [NestJS Discord](https://discord.gg/nestjs)
- [Prisma Slack](https://slack.prisma.io)

---

## 📄 License

This guide is provided as-is for educational purposes. Feel free to use, modify, and distribute.

---

**Built with ❤️ using NX, React, NestJS, Prisma, and MySQL**

*Last updated: March 2026*

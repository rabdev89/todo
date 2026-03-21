import { PrismaService } from '../prisma/prisma.service';
import { FileService } from '../files/file.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
export declare class TasksService {
    private readonly prisma;
    private readonly fileService;
    private readonly logger;
    constructor(prisma: PrismaService, fileService: FileService);
    create(userId: string, dto: CreateTaskDto): Promise<{
        subtasks: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            title: string;
            isCompleted: boolean;
            taskId: string;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        userId: string;
        description: string | null;
        priority: import("@prisma/client").$Enums.TaskPriority;
        status: import("@prisma/client").$Enums.TaskStatus;
        dueDate: Date | null;
    }>;
    findAll(userId: string): Promise<({
        subtasks: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            title: string;
            isCompleted: boolean;
            taskId: string;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        userId: string;
        description: string | null;
        priority: import("@prisma/client").$Enums.TaskPriority;
        status: import("@prisma/client").$Enums.TaskStatus;
        dueDate: Date | null;
    })[]>;
    update(userId: string, id: string, dto: UpdateTaskDto): Promise<{
        subtasks: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            title: string;
            isCompleted: boolean;
            taskId: string;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        userId: string;
        description: string | null;
        priority: import("@prisma/client").$Enums.TaskPriority;
        status: import("@prisma/client").$Enums.TaskStatus;
        dueDate: Date | null;
    }>;
    remove(userId: string, id: string): Promise<{
        ok: boolean;
        deleted: {
            taskId: string;
            attachmentCount: number;
            failedFileDeletions: {
                attachmentId: string;
                filename: string;
                error: string;
            }[] | undefined;
        };
    }>;
    bulkUpdate(userId: string, ids: string[], dto: UpdateTaskDto): Promise<import("@prisma/client").Prisma.BatchPayload>;
    bulkRemove(userId: string, ids: string[]): Promise<{
        ok: boolean;
        deleted: {
            taskCount: number;
            attachmentCount: number;
            failedFileDeletions: {
                attachmentId: string;
                filename: string;
                error: string;
            }[] | undefined;
        };
    }>;
}

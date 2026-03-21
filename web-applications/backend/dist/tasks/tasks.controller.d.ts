import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { TasksService } from './tasks.service';
import { AttachmentsService } from './attachments.service';
export declare class TasksController {
    private readonly tasks;
    private readonly attachments;
    constructor(tasks: TasksService, attachments: AttachmentsService);
    create(user: {
        userId: string;
    }, dto: CreateTaskDto): Promise<{
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
    findAll(user: {
        userId: string;
    }): Promise<({
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
    update(user: {
        userId: string;
    }, id: string, dto: UpdateTaskDto): Promise<{
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
    addAttachment(user: {
        userId: string;
    }, id: string, file: Express.Multer.File): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        taskId: string;
        filename: string;
        mimetype: string;
        size: number;
        url: string;
    }>;
    removeAttachment(user: {
        userId: string;
    }, id: string): Promise<{
        ok: boolean;
    }>;
    bulkUpdate(user: {
        userId: string;
    }, body: {
        ids: string[];
        updates: UpdateTaskDto;
    }): Promise<import("@prisma/client").Prisma.BatchPayload>;
    bulkRemove(user: {
        userId: string;
    }, body: {
        ids: string[];
    }): Promise<{
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
    remove(user: {
        userId: string;
    }, id: string): Promise<{
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
}

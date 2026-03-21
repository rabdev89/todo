import { TaskPriority, TaskStatus } from '@prisma/client';
export declare class UpdateTaskDto {
    title?: string;
    description?: string;
    priority?: TaskPriority;
    status?: TaskStatus;
    dueDate?: string;
}

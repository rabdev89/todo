import { PrismaService } from '../prisma/prisma.service';
import { CreateSubtaskDto } from './dto/create-subtask.dto';
import { UpdateSubtaskDto } from './dto/update-subtask.dto';
export declare class SubtasksService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(userId: string, taskId: string, dto: CreateSubtaskDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        isCompleted: boolean;
        taskId: string;
    }>;
    update(userId: string, subtaskId: string, dto: UpdateSubtaskDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        isCompleted: boolean;
        taskId: string;
    }>;
    remove(userId: string, subtaskId: string): Promise<{
        ok: boolean;
    }>;
}

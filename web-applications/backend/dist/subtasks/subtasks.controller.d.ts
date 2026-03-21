import { CreateSubtaskDto } from './dto/create-subtask.dto';
import { UpdateSubtaskDto } from './dto/update-subtask.dto';
import { SubtasksService } from './subtasks.service';
export declare class SubtasksController {
    private readonly subtasks;
    constructor(subtasks: SubtasksService);
    create(user: {
        userId: string;
    }, taskId: string, dto: CreateSubtaskDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        isCompleted: boolean;
        taskId: string;
    }>;
    update(user: {
        userId: string;
    }, id: string, dto: UpdateSubtaskDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        isCompleted: boolean;
        taskId: string;
    }>;
    remove(user: {
        userId: string;
    }, id: string): Promise<{
        ok: boolean;
    }>;
}

import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSubtaskDto } from './dto/create-subtask.dto';
import { UpdateSubtaskDto } from './dto/update-subtask.dto';

@Injectable()
export class SubtasksService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, taskId: string, dto: CreateSubtaskDto) {
    const task = await this.prisma.task.findUnique({
      where: { id: taskId },
      include: { _count: { select: { subtasks: true } } },
    });
    if (!task) throw new NotFoundException('Task not found');
    if (task.userId !== userId) throw new ForbiddenException();
    if (task._count.subtasks >= 20) {
      throw new BadRequestException('Subtask limit reached (20 max)');
    }

    return await this.prisma.subtask.create({
      data: {
        taskId,
        title: dto.title,
      },
    });
  }

  async update(userId: string, subtaskId: string, dto: UpdateSubtaskDto) {
    const subtask = await this.prisma.subtask.findUnique({
      where: { id: subtaskId },
      include: { task: true },
    });
    if (!subtask) throw new NotFoundException('Subtask not found');
    if (subtask.task.userId !== userId) throw new ForbiddenException();

    const updated = await this.prisma.subtask.update({
      where: { id: subtaskId },
      data: { isCompleted: dto.isCompleted },
    });

    if (dto.isCompleted) {
      const parentId = subtask.taskId;
      const pendingSubtasks = await this.prisma.subtask.count({
        where: { taskId: parentId, isCompleted: false },
      });

      if (pendingSubtasks === 0) {
        await this.prisma.task.update({
          where: { id: parentId },
          data: { status: 'completed' },
        });
      }
    }

    return updated;
  }

  async remove(userId: string, subtaskId: string) {
    const subtask = await this.prisma.subtask.findUnique({
      where: { id: subtaskId },
      include: { task: true },
    });
    if (!subtask) throw new NotFoundException('Subtask not found');
    if (subtask.task.userId !== userId) throw new ForbiddenException();

    await this.prisma.subtask.delete({ where: { id: subtaskId } });
    return { ok: true };
  }
}

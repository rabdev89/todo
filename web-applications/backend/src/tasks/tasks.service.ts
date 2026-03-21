import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { FileService } from '../files/file.service';
import { CascadeDeleteException } from '../common/exceptions/cascade-delete.exception';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

@Injectable()
export class TasksService {
  private readonly logger = new Logger(TasksService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly fileService: FileService,
  ) {}

  async create(userId: string, dto: CreateTaskDto) {
    const dueDate = dto.dueDate ? new Date(dto.dueDate) : undefined;

    return await this.prisma.task.create({
      data: {
        ...dto, // Spreads all properties from dto, including 'status' if present
        userId,
        dueDate, // Overwrites dto.dueDate (string) with the processed Date object
      },
      include: { subtasks: true },
    });
  }

  async findAll(userId: string) {
    return await this.prisma.task.findMany({
      where: { userId },
      include: { subtasks: true },
      orderBy: [{ createdAt: 'desc' }],
    });
  }

  async update(userId: string, id: string, dto: UpdateTaskDto) {
    const existing = await this.prisma.task.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Task not found');
    if (existing.userId !== userId) throw new ForbiddenException();

    if (dto.status === 'completed') {
      const pendingSubtasks = await this.prisma.subtask.count({
        where: { taskId: id, isCompleted: false },
      });
      if (pendingSubtasks > 0) {
        throw new BadRequestException(
          'Cannot complete task with pending subtasks.',
        );
      }
    }

    const dueDate = dto.dueDate ? new Date(dto.dueDate) : undefined;

    return await this.prisma.task.update({
      where: { id },
      data: {
        title: dto.title,
        description: dto.description,
        priority: dto.priority,
        status: dto.status,
        dueDate,
      },
      include: { subtasks: true },
    });
  }

  async remove(userId: string, id: string) {
    const existing = await this.prisma.task.findUnique({
      where: { id },
      include: { attachments: true },
    });
    if (!existing) throw new NotFoundException('Task not found');
    if (existing.userId !== userId) throw new ForbiddenException();

    try {
      // Execute delete with transaction for atomicity
      return await this.prisma.$transaction(async (tx) => {
        const failedFileDeletes: Array<{
          attachmentId: string;
          filename: string;
          error: string;
        }> = [];

        // Step 1: Delete files from storage (failures don't block database deletion)
        for (const attachment of existing.attachments) {
          const result = await this.fileService.deleteFile(attachment.url);
          if (!result.success) {
            failedFileDeletes.push({
              attachmentId: attachment.id,
              filename: attachment.filename,
              error: result.error || 'Unknown error',
            });
            this.logger.warn(
              `Failed to delete file for attachment ${attachment.id}`,
              result.error,
            );
          }
        }

        // Step 2: Delete task (cascades to subtasks and attachments via DB constraints)
        await tx.task.delete({ where: { id } });

        this.logger.debug(
          `Task ${id} deleted successfully. Attachments: ${existing.attachments.length}, Failed files: ${failedFileDeletes.length}`,
        );

        // Return success even if some file deletions failed
        // Database is in consistent state; files can be cleaned up asynchronously
        return {
          ok: true,
          deleted: {
            taskId: id,
            attachmentCount: existing.attachments.length,
            failedFileDeletions: failedFileDeletes.length > 0 ? failedFileDeletes : undefined,
          },
        };
      });
    } catch (error) {
      const message = 'Failed to delete task and related resources';
      this.logger.error(message, error instanceof Error ? error.message : 'Unknown error');

      throw new CascadeDeleteException(message, {
        databaseError:
          error instanceof Error ? error.message : 'Unknown database error',
      });
    }
  }

  async bulkUpdate(userId: string, ids: string[], dto: UpdateTaskDto) {
    const dueDate = dto.dueDate ? new Date(dto.dueDate) : undefined;

    return await this.prisma.task.updateMany({
      where: {
        id: { in: ids },
        userId,
      },
      data: {
        title: dto.title,
        description: dto.description,
        priority: dto.priority,
        status: dto.status,
        dueDate,
      },
    });
  }

  async bulkRemove(userId: string, ids: string[]) {
    if (!ids || ids.length === 0) {
      throw new BadRequestException('No task IDs provided');
    }

    try {
      // Fetch all attachments for the tasks being deleted
      const attachments = await this.prisma.attachment.findMany({
        where: {
          task: {
            id: { in: ids },
            userId, // Ensure user owns these tasks
          },
        },
      });

      // Execute bulk delete with transaction
      return await this.prisma.$transaction(async (tx) => {
        const failedFileDeletes: Array<{
          attachmentId: string;
          filename: string;
          error: string;
        }> = [];

        // Step 1: Delete files from storage
        for (const attachment of attachments) {
          const result = await this.fileService.deleteFile(attachment.url);
          if (!result.success) {
            failedFileDeletes.push({
              attachmentId: attachment.id,
              filename: attachment.filename,
              error: result.error || 'Unknown error',
            });
            this.logger.warn(
              `Failed to delete file for attachment ${attachment.id}`,
              result.error,
            );
          }
        }

        // Step 2: Delete all tasks (cascades to subtasks and attachments)
        const result = await tx.task.deleteMany({
          where: {
            id: { in: ids },
            userId,
          },
        });

        this.logger.debug(
          `Bulk deleted ${result.count} tasks. Attachments: ${attachments.length}, Failed files: ${failedFileDeletes.length}`,
        );

        // Return summary
        return {
          ok: true,
          deleted: {
            taskCount: result.count,
            attachmentCount: attachments.length,
            failedFileDeletions:
              failedFileDeletes.length > 0 ? failedFileDeletes : undefined,
          },
        };
      });
    } catch (error) {
      const message = 'Failed to bulk delete tasks and related resources';
      this.logger.error(message, error instanceof Error ? error.message : 'Unknown error');

      throw new CascadeDeleteException(message, {
        databaseError:
          error instanceof Error ? error.message : 'Unknown database error',
      });
    }
  }
}

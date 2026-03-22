"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var TasksService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TasksService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const file_service_1 = require("../files/file.service");
const cascade_delete_exception_1 = require("../common/exceptions/cascade-delete.exception");
let TasksService = TasksService_1 = class TasksService {
    prisma;
    fileService;
    logger = new common_1.Logger(TasksService_1.name);
    constructor(prisma, fileService) {
        this.prisma = prisma;
        this.fileService = fileService;
    }
    async create(userId, dto) {
        const dueDate = dto.dueDate ? new Date(dto.dueDate) : undefined;
        return await this.prisma.task.create({
            data: {
                ...dto,
                userId,
                dueDate,
            },
            include: { subtasks: true },
        });
    }
    async findAll(userId) {
        return await this.prisma.task.findMany({
            where: { userId },
            include: { subtasks: true },
            orderBy: [{ createdAt: 'desc' }],
        });
    }
    async update(userId, id, dto) {
        const existing = await this.prisma.task.findUnique({ where: { id } });
        if (!existing)
            throw new common_1.NotFoundException('Task not found');
        if (existing.userId !== userId)
            throw new common_1.ForbiddenException();
        if (dto.status === 'completed') {
            const pendingSubtasks = await this.prisma.subtask.count({
                where: { taskId: id, isCompleted: false },
            });
            if (pendingSubtasks > 0) {
                throw new common_1.BadRequestException('Cannot complete task with pending subtasks.');
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
    async remove(userId, id) {
        const existing = await this.prisma.task.findUnique({
            where: { id },
            include: { attachments: true },
        });
        if (!existing)
            throw new common_1.NotFoundException('Task not found');
        if (existing.userId !== userId)
            throw new common_1.ForbiddenException();
        try {
            return await this.prisma.$transaction(async (tx) => {
                const failedFileDeletes = [];
                for (const attachment of existing.attachments) {
                    const result = await this.fileService.deleteFile(attachment.url);
                    if (!result.success) {
                        failedFileDeletes.push({
                            attachmentId: attachment.id,
                            filename: attachment.filename,
                            error: result.error || 'Unknown error',
                        });
                        this.logger.warn(`Failed to delete file for attachment ${attachment.id}`, result.error);
                    }
                }
                await tx.task.delete({ where: { id } });
                this.logger.debug(`Task ${id} deleted successfully. Attachments: ${existing.attachments.length}, Failed files: ${failedFileDeletes.length}`);
                return {
                    ok: true,
                    deleted: {
                        taskId: id,
                        attachmentCount: existing.attachments.length,
                        failedFileDeletions: failedFileDeletes.length > 0 ? failedFileDeletes : undefined,
                    },
                };
            });
        }
        catch (error) {
            const message = 'Failed to delete task and related resources';
            this.logger.error(message, error instanceof Error ? error.message : 'Unknown error');
            throw new cascade_delete_exception_1.CascadeDeleteException(message, {
                databaseError: error instanceof Error ? error.message : 'Unknown database error',
            });
        }
    }
    async bulkUpdate(userId, ids, dto) {
        if (dto.status === 'completed') {
            const tasksWithPendingSubtasks = await this.prisma.task.findMany({
                where: {
                    id: { in: ids },
                    userId,
                    subtasks: { some: { isCompleted: false } },
                },
                select: { title: true },
            });
            if (tasksWithPendingSubtasks.length > 0) {
                const titles = tasksWithPendingSubtasks.map(t => t.title).join(', ');
                throw new common_1.BadRequestException(`Cannot complete tasks with pending subtasks: ${titles}`);
            }
        }
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
    async bulkRemove(userId, ids) {
        if (!ids || ids.length === 0) {
            throw new common_1.BadRequestException('No task IDs provided');
        }
        try {
            const attachments = await this.prisma.attachment.findMany({
                where: {
                    task: {
                        id: { in: ids },
                        userId,
                    },
                },
            });
            return await this.prisma.$transaction(async (tx) => {
                const failedFileDeletes = [];
                for (const attachment of attachments) {
                    const result = await this.fileService.deleteFile(attachment.url);
                    if (!result.success) {
                        failedFileDeletes.push({
                            attachmentId: attachment.id,
                            filename: attachment.filename,
                            error: result.error || 'Unknown error',
                        });
                        this.logger.warn(`Failed to delete file for attachment ${attachment.id}`, result.error);
                    }
                }
                const result = await tx.task.deleteMany({
                    where: {
                        id: { in: ids },
                        userId,
                    },
                });
                this.logger.debug(`Bulk deleted ${result.count} tasks. Attachments: ${attachments.length}, Failed files: ${failedFileDeletes.length}`);
                return {
                    ok: true,
                    deleted: {
                        taskCount: result.count,
                        attachmentCount: attachments.length,
                        failedFileDeletions: failedFileDeletes.length > 0 ? failedFileDeletes : undefined,
                    },
                };
            });
        }
        catch (error) {
            const message = 'Failed to bulk delete tasks and related resources';
            this.logger.error(message, error instanceof Error ? error.message : 'Unknown error');
            throw new cascade_delete_exception_1.CascadeDeleteException(message, {
                databaseError: error instanceof Error ? error.message : 'Unknown database error',
            });
        }
    }
};
exports.TasksService = TasksService;
exports.TasksService = TasksService = TasksService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        file_service_1.FileService])
], TasksService);
//# sourceMappingURL=tasks.service.js.map
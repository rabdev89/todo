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
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubtasksService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let SubtasksService = class SubtasksService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(userId, taskId, dto) {
        const task = await this.prisma.task.findUnique({
            where: { id: taskId },
            include: { _count: { select: { subtasks: true } } },
        });
        if (!task)
            throw new common_1.NotFoundException('Task not found');
        if (task.userId !== userId)
            throw new common_1.ForbiddenException();
        if (task._count.subtasks >= 20) {
            throw new common_1.BadRequestException('Subtask limit reached (20 max)');
        }
        return await this.prisma.subtask.create({
            data: {
                taskId,
                title: dto.title,
            },
        });
    }
    async update(userId, subtaskId, dto) {
        const subtask = await this.prisma.subtask.findUnique({
            where: { id: subtaskId },
            include: { task: true },
        });
        if (!subtask)
            throw new common_1.NotFoundException('Subtask not found');
        if (subtask.task.userId !== userId)
            throw new common_1.ForbiddenException();
        return await this.prisma.subtask.update({
            where: { id: subtaskId },
            data: { isCompleted: dto.isCompleted },
        });
    }
    async remove(userId, subtaskId) {
        const subtask = await this.prisma.subtask.findUnique({
            where: { id: subtaskId },
            include: { task: true },
        });
        if (!subtask)
            throw new common_1.NotFoundException('Subtask not found');
        if (subtask.task.userId !== userId)
            throw new common_1.ForbiddenException();
        await this.prisma.subtask.delete({ where: { id: subtaskId } });
        return { ok: true };
    }
};
exports.SubtasksService = SubtasksService;
exports.SubtasksService = SubtasksService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SubtasksService);
//# sourceMappingURL=subtasks.service.js.map
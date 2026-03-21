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
exports.AttachmentsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const path_1 = require("path");
const fs_1 = require("fs");
let AttachmentsService = class AttachmentsService {
    prisma;
    uploadPath = (0, path_1.join)(process.cwd(), 'uploads');
    constructor(prisma) {
        this.prisma = prisma;
        if (!(0, fs_1.existsSync)(this.uploadPath)) {
            (0, fs_1.mkdirSync)(this.uploadPath, { recursive: true });
        }
    }
    async addAttachment(userId, taskId, file) {
        const task = await this.prisma.task.findUnique({ where: { id: taskId } });
        if (!task)
            throw new common_1.NotFoundException('Task not found');
        if (task.userId !== userId)
            throw new common_1.ForbiddenException();
        return await this.prisma.attachment.create({
            data: {
                taskId,
                filename: file.originalname,
                mimetype: file.mimetype,
                size: file.size,
                url: `/uploads/${file.filename}`,
            },
        });
    }
    async removeAttachment(userId, attachmentId) {
        const attachment = await this.prisma.attachment.findUnique({
            where: { id: attachmentId },
            include: { task: true },
        });
        if (!attachment)
            throw new common_1.NotFoundException('Attachment not found');
        if (attachment.task.userId !== userId)
            throw new common_1.ForbiddenException();
        const filePath = (0, path_1.join)(process.cwd(), attachment.url);
        if ((0, fs_1.existsSync)(filePath)) {
            (0, fs_1.unlinkSync)(filePath);
        }
        await this.prisma.attachment.delete({ where: { id: attachmentId } });
        return { ok: true };
    }
};
exports.AttachmentsService = AttachmentsService;
exports.AttachmentsService = AttachmentsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AttachmentsService);
//# sourceMappingURL=attachments.service.js.map
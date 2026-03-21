import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { join } from 'path';
import { existsSync, mkdirSync, unlinkSync } from 'fs';

@Injectable()
export class AttachmentsService {
  private readonly uploadPath = join(process.cwd(), 'uploads');

  constructor(private readonly prisma: PrismaService) {
    if (!existsSync(this.uploadPath)) {
      mkdirSync(this.uploadPath, { recursive: true });
    }
  }

  async addAttachment(userId: string, taskId: string, file: Express.Multer.File) {
    const task = await this.prisma.task.findUnique({ where: { id: taskId } });
    if (!task) throw new NotFoundException('Task not found');
    if (task.userId !== userId) throw new ForbiddenException();

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

  async removeAttachment(userId: string, attachmentId: string) {
    const attachment = await this.prisma.attachment.findUnique({
      where: { id: attachmentId },
      include: { task: true },
    });

    if (!attachment) throw new NotFoundException('Attachment not found');
    if (attachment.task.userId !== userId) throw new ForbiddenException();

    // Delete file from disk
    const filePath = join(process.cwd(), attachment.url);
    if (existsSync(filePath)) {
      unlinkSync(filePath);
    }

    await this.prisma.attachment.delete({ where: { id: attachmentId } });
    return { ok: true };
  }
}

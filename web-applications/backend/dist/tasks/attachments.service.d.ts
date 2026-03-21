import { PrismaService } from '../prisma/prisma.service';
export declare class AttachmentsService {
    private readonly prisma;
    private readonly uploadPath;
    constructor(prisma: PrismaService);
    addAttachment(userId: string, taskId: string, file: Express.Multer.File): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        taskId: string;
        filename: string;
        mimetype: string;
        size: number;
        url: string;
    }>;
    removeAttachment(userId: string, attachmentId: string): Promise<{
        ok: boolean;
    }>;
}

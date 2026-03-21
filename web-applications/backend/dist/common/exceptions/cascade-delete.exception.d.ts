import { HttpException } from '@nestjs/common';
export declare class CascadeDeleteException extends HttpException {
    readonly details?: {
        deletedCount?: number;
        failedFileDeletes?: Array<{
            attachmentId: string;
            filename: string;
            error: string;
        }>;
        databaseError?: string;
    } | undefined;
    constructor(message?: string, details?: {
        deletedCount?: number;
        failedFileDeletes?: Array<{
            attachmentId: string;
            filename: string;
            error: string;
        }>;
        databaseError?: string;
    } | undefined);
}

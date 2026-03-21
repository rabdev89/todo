import { HttpException, HttpStatus } from '@nestjs/common';

export class CascadeDeleteException extends HttpException {
  constructor(
    message: string = 'Failed to delete task and related resources',
    public readonly details?: {
      deletedCount?: number;
      failedFileDeletes?: Array<{
        attachmentId: string;
        filename: string;
        error: string;
      }>;
      databaseError?: string;
    },
  ) {
    super(
      {
        message,
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        details,
      },
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
}

import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { PrismaService } from '../prisma/prisma.service';
import { FileService } from '../files/file.service';
import { CascadeDeleteException } from '../common/exceptions/cascade-delete.exception';

describe('TasksService - Cascading Deletes (Phase 2)', () => {
  let service: TasksService;
  let prisma: PrismaService;
  let fileService: FileService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TasksService,
        {
          provide: PrismaService,
          useValue: {
            task: {
              findUnique: jest.fn(),
              delete: jest.fn(),
              deleteMany: jest.fn(),
              findMany: jest.fn(),
            },
            attachment: {
              findMany: jest.fn(),
            },
            $transaction: jest.fn((cb) => cb(null)),
          },
        },
        {
          provide: FileService,
          useValue: {
            deleteFile: jest.fn(),
            deleteFiles: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<TasksService>(TasksService);
    prisma = module.get<PrismaService>(PrismaService);
    fileService = module.get<FileService>(FileService);
  });

  describe('remove() - Single Task Delete', () => {
    it('should delete task with no attachments successfully', async () => {
      const userId = 'user-1';
      const taskId = 'task-1';

      jest.spyOn(prisma.task, 'findUnique').mockResolvedValueOnce({
        id: taskId,
        userId,
        title: 'Test Task',
        description: null,
        priority: 'medium',
        status: 'pending',
        dueDate: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        attachments: [],
      } as any);

      jest.spyOn(prisma, '$transaction').mockImplementationOnce(async (cb) => {
        return cb({
          task: {
            delete: jest.fn().mockResolvedValueOnce({ id: taskId }),
          },
        } as any);
      });

      const result = await service.remove(userId, taskId);

      expect(result.ok).toBe(true);
      expect(result.deleted.taskId).toBe(taskId);
      expect(result.deleted.attachmentCount).toBe(0);
      expect(result.deleted.failedFileDeletions).toBeUndefined();
    });

    it('should delete task with multiple attachments successfully', async () => {
      const userId = 'user-1';
      const taskId = 'task-1';
      const attachments = [
        {
          id: 'att-1',
          taskId,
          filename: 'file1.pdf',
          mimetype: 'application/pdf',
          size: 1024,
          url: '/uploads/file1.pdf',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'att-2',
          taskId,
          filename: 'file2.doc',
          mimetype: 'application/msword',
          size: 2048,
          url: '/uploads/file2.doc',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      jest.spyOn(prisma.task, 'findUnique').mockResolvedValueOnce({
        id: taskId,
        userId,
        title: 'Test Task',
        description: null,
        priority: 'medium',
        status: 'pending',
        dueDate: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        attachments,
      } as any);

      jest
        .spyOn(fileService, 'deleteFile')
        .mockResolvedValue({ success: true });

      jest.spyOn(prisma, '$transaction').mockImplementationOnce(async (cb) => {
        return cb({
          task: {
            delete: jest.fn().mockResolvedValueOnce({ id: taskId }),
          },
        } as any);
      });

      const result = await service.remove(userId, taskId);

      expect(result.ok).toBe(true);
      expect(result.deleted.taskId).toBe(taskId);
      expect(result.deleted.attachmentCount).toBe(2);
      expect(fileService.deleteFile).toHaveBeenCalledTimes(2);
      expect(fileService.deleteFile).toHaveBeenCalledWith('/uploads/file1.pdf');
      expect(fileService.deleteFile).toHaveBeenCalledWith('/uploads/file2.doc');
    });

    it('should handle file deletion failures gracefully', async () => {
      const userId = 'user-1';
      const taskId = 'task-1';
      const attachments = [
        {
          id: 'att-1',
          taskId,
          filename: 'file1.pdf',
          mimetype: 'application/pdf',
          size: 1024,
          url: '/uploads/file1.pdf',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      jest.spyOn(prisma.task, 'findUnique').mockResolvedValueOnce({
        id: taskId,
        userId,
        title: 'Test Task',
        description: null,
        priority: 'medium',
        status: 'pending',
        dueDate: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        attachments,
      } as any);

      jest
        .spyOn(fileService, 'deleteFile')
        .mockResolvedValue({ success: false, error: 'File not found' });

      jest.spyOn(prisma, '$transaction').mockImplementationOnce(async (cb) => {
        return cb({
          task: {
            delete: jest.fn().mockResolvedValueOnce({ id: taskId }),
          },
        } as any);
      });

      const result = await service.remove(userId, taskId);

      expect(result.ok).toBe(true);
      expect(result.deleted.taskId).toBe(taskId);
      expect(result.deleted.failedFileDeletions).toHaveLength(1);
      expect(result.deleted.failedFileDeletions[0]).toEqual({
        attachmentId: 'att-1',
        filename: 'file1.pdf',
        error: 'File not found',
      });
    });

    it('should throw NotFoundException when task not found', async () => {
      const userId = 'user-1';
      const taskId = 'nonexistent-task';

      jest.spyOn(prisma.task, 'findUnique').mockResolvedValueOnce(null);

      await expect(service.remove(userId, taskId)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ForbiddenException when user does not own task', async () => {
      const userId = 'user-1';
      const taskId = 'task-1';
      const differentUserId = 'user-2';

      jest.spyOn(prisma.task, 'findUnique').mockResolvedValueOnce({
        id: taskId,
        userId: differentUserId,
        title: 'Test Task',
        description: null,
        priority: 'medium',
        status: 'pending',
        dueDate: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        attachments: [],
      } as any);

      await expect(service.remove(userId, taskId)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should throw CascadeDeleteException on database error', async () => {
      const userId = 'user-1';
      const taskId = 'task-1';

      jest.spyOn(prisma.task, 'findUnique').mockResolvedValueOnce({
        id: taskId,
        userId,
        title: 'Test Task',
        description: null,
        priority: 'medium',
        status: 'pending',
        dueDate: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        attachments: [],
      } as any);

      jest.spyOn(prisma, '$transaction').mockRejectedValueOnce(
        new Error('Database connection failed'),
      );

      await expect(service.remove(userId, taskId)).rejects.toThrow(
        CascadeDeleteException,
      );
    });
  });

  describe('bulkRemove() - Bulk Task Delete', () => {
    it('should delete multiple tasks successfully', async () => {
      const userId = 'user-1';
      const taskIds = ['task-1', 'task-2', 'task-3'];
      const attachments = [
        {
          id: 'att-1',
          taskId: 'task-1',
          filename: 'file1.pdf',
          mimetype: 'application/pdf',
          size: 1024,
          url: '/uploads/file1.pdf',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'att-2',
          taskId: 'task-2',
          filename: 'file2.doc',
          mimetype: 'application/msword',
          size: 2048,
          url: '/uploads/file2.doc',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      jest
        .spyOn(prisma.attachment, 'findMany')
        .mockResolvedValueOnce(attachments as any);

      jest
        .spyOn(fileService, 'deleteFile')
        .mockResolvedValue({ success: true });

      jest.spyOn(prisma, '$transaction').mockImplementationOnce(async (cb) => {
        return cb({
          task: {
            deleteMany: jest.fn().mockResolvedValueOnce({ count: 3 }),
          },
        } as any);
      });

      const result = await service.bulkRemove(userId, taskIds);

      expect(result.ok).toBe(true);
      expect(result.deleted.taskCount).toBe(3);
      expect(result.deleted.attachmentCount).toBe(2);
      expect(fileService.deleteFile).toHaveBeenCalledTimes(2);
    });

    it('should throw BadRequestException for empty task IDs', async () => {
      const userId = 'user-1';

      await expect(service.bulkRemove(userId, [])).rejects.toThrow(
        'No task IDs provided',
      );
    });

    it('should handle mixed success and failure in file deletions', async () => {
      const userId = 'user-1';
      const taskIds = ['task-1', 'task-2'];
      const attachments = [
        {
          id: 'att-1',
          taskId: 'task-1',
          filename: 'file1.pdf',
          mimetype: 'application/pdf',
          size: 1024,
          url: '/uploads/file1.pdf',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'att-2',
          taskId: 'task-2',
          filename: 'file2.doc',
          mimetype: 'application/msword',
          size: 2048,
          url: '/uploads/file2.doc',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      jest
        .spyOn(prisma.attachment, 'findMany')
        .mockResolvedValueOnce(attachments as any);

      jest
        .spyOn(fileService, 'deleteFile')
        .mockResolvedValueOnce({ success: true })
        .mockResolvedValueOnce({ success: false, error: 'Permission denied' });

      jest.spyOn(prisma, '$transaction').mockImplementationOnce(async (cb) => {
        return cb({
          task: {
            deleteMany: jest.fn().mockResolvedValueOnce({ count: 2 }),
          },
        } as any);
      });

      const result = await service.bulkRemove(userId, taskIds);

      expect(result.ok).toBe(true);
      expect(result.deleted.taskCount).toBe(2);
      expect(result.deleted.failedFileDeletions).toHaveLength(1);
      expect(result.deleted.failedFileDeletions[0]).toEqual({
        attachmentId: 'att-2',
        filename: 'file2.doc',
        error: 'Permission denied',
      });
    });

    it('should throw CascadeDeleteException on database error', async () => {
      const userId = 'user-1';
      const taskIds = ['task-1', 'task-2'];

      jest.spyOn(prisma.attachment, 'findMany').mockResolvedValueOnce([]);

      jest.spyOn(prisma, '$transaction').mockRejectedValueOnce(
        new Error('Transaction failed'),
      );

      await expect(service.bulkRemove(userId, taskIds)).rejects.toThrow(
        CascadeDeleteException,
      );
    });
  });

  describe('Transaction Atomicity', () => {
    it('should roll back task deletion if in transaction', async () => {
      const userId = 'user-1';
      const taskId = 'task-1';

      jest.spyOn(prisma.task, 'findUnique').mockResolvedValueOnce({
        id: taskId,
        userId,
        title: 'Test Task',
        description: null,
        priority: 'medium',
        status: 'pending',
        dueDate: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        attachments: [],
      } as any);

      // Simulate transaction rollback
      jest.spyOn(prisma, '$transaction').mockRejectedValueOnce(
        new Error('Transaction constraint violation'),
      );

      await expect(service.remove(userId, taskId)).rejects.toThrow(
        CascadeDeleteException,
      );
    });
  });
});

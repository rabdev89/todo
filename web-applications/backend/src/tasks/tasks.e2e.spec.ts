import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../app.module';
import * as request from 'supertest';

/**
 * E2E Tests for Task Deletion API Endpoints
 *
 * Tests the following endpoints:
 * - DELETE /tasks/:id - Single task deletion
 * - DELETE /tasks/bulk - Bulk task deletion
 *
 * Verifies:
 * - Proper HTTP status codes
 * - Response format and data
 * - Cascade effects in API responses
 * - Authorization checks
 *
 * Note: These tests require a running backend server and test database.
 * Set E2E_TEST_ENABLED=true to run these tests.
 * By default, these tests are skipped in CI/CD environments.
 */
describe('TasksController - Delete Endpoints E2E (Phase 3)', () => {
  // Skip all E2E tests unless explicitly enabled
  const skipAllTests = !process.env.E2E_TEST_ENABLED;

  if (skipAllTests) {
    it('should skip E2E tests (requires running server and test database)', () => {
      expect(true).toBe(true);
    });
    return;
  }

  let app: INestApplication;
  let testUserId: string;
  let testAuthToken: string;

  // Note: These E2E tests require:
  // 1. Running database (test or dev)
  // 2. Proper setup/teardown to avoid test pollution
  // 3. Test user account or auth bypass for testing

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = module.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('DELETE /tasks/:id', () => {
    it('should delete single task and return 200 OK', async () => {
      // SKIP: Requires test database and valid auth token
      const skipTest = !process.env.E2E_TEST_ENABLED;
      if (skipTest) {
        expect(true).toBe(true);
        return;
      }

      // SETUP: Would create test task here
      const taskId = 'test-task-123';

      const response = await request(app.getHttpServer())
        .delete(`/tasks/${taskId}`)
        .set('Authorization', `Bearer ${testAuthToken}`)
        .expect(200); // Expecting success

      expect(response.body).toEqual({
        ok: true,
        deleted: expect.objectContaining({
          taskId,
          attachmentCount: expect.any(Number),
        }),
      });
    });

    it('should return 404 if task does not exist', async () => {
      const skipTest = !process.env.E2E_TEST_ENABLED;
      if (skipTest) {
        expect(true).toBe(true);
        return;
      }

      const response = await request(app.getHttpServer())
        .delete('/tasks/nonexistent-task-id')
        .set('Authorization', `Bearer ${testAuthToken}`)
        .expect(404);

      expect(response.body.message).toContain('Task not found');
    });

    it('should return 403 if user does not own task', async () => {
      const skipTest = !process.env.E2E_TEST_ENABLED;
      if (skipTest) {
        expect(true).toBe(true);
        return;
      }

      // SETUP: Create task by different user, try to delete with current user
      const otherUserTaskId = 'other-user-task-456';

      const response = await request(app.getHttpServer())
        .delete(`/tasks/${otherUserTaskId}`)
        .set('Authorization', `Bearer ${testAuthToken}`)
        .expect(403);

      expect(response.body.message).toContain('Forbidden');
    });

    it('should delete task with attachments and include count in response', async () => {
      const skipTest = !process.env.E2E_TEST_ENABLED;
      if (skipTest) {
        expect(true).toBe(true);
        return;
      }

      // SETUP: Create task with 2 attachments
      const taskIdWithAttachments = 'task-with-attachments-789';

      const response = await request(app.getHttpServer())
        .delete(`/tasks/${taskIdWithAttachments}`)
        .set('Authorization', `Bearer ${testAuthToken}`)
        .expect(200);

      expect(response.body.deleted.attachmentCount).toBeGreaterThan(0);
      if (response.body.deleted.failedFileDeletions) {
        expect(response.body.deleted.failedFileDeletions).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              attachmentId: expect.any(String),
              filename: expect.any(String),
              error: expect.any(String),
            }),
          ]),
        );
      }
    });

    it('should verify cascade by checking subsequent GET request', async () => {
      const skipTest = !process.env.E2E_TEST_ENABLED;
      if (skipTest) {
        expect(true).toBe(true);
        return;
      }

      // SETUP: Create task, delete it, verify it's gone
      const taskId = 'cascade-verify-task-111';

      // Delete
      await request(app.getHttpServer())
        .delete(`/tasks/${taskId}`)
        .set('Authorization', `Bearer ${testAuthToken}`)
        .expect(200);

      // Verify deleted by attempting GET
      const response = await request(app.getHttpServer())
        .get(`/tasks/${taskId}`)
        .set('Authorization', `Bearer ${testAuthToken}`)
        .expect(404);

      expect(response.body.message).toContain('Task not found');
    });
  });

  describe('DELETE /tasks/bulk', () => {
    it('should bulk delete multiple tasks and return count', async () => {
      const skipTest = !process.env.E2E_TEST_ENABLED;
      if (skipTest) {
        expect(true).toBe(true);
        return;
      }

      // SETUP: Create 3 tasks
      const taskIds = ['bulk-task-1', 'bulk-task-2', 'bulk-task-3'];

      const response = await request(app.getHttpServer())
        .delete('/tasks/bulk')
        .set('Authorization', `Bearer ${testAuthToken}`)
        .send({ ids: taskIds })
        .expect(200); // Note: Endpoint may use POST with special handling

      expect(response.body).toEqual({
        ok: true,
        deleted: expect.objectContaining({
          taskCount: 3,
          attachmentCount: expect.any(Number),
        }),
      });
    });

    it('should return 400 for empty task IDs', async () => {
      const skipTest = !process.env.E2E_TEST_ENABLED;
      if (skipTest) {
        expect(true).toBe(true);
        return;
      }

      const response = await request(app.getHttpServer())
        .delete('/tasks/bulk')
        .set('Authorization', `Bearer ${testAuthToken}`)
        .send({ ids: [] })
        .expect(400);

      expect(response.body.message).toContain('No task IDs provided');
    });

    it('should only delete tasks owned by user', async () => {
      const skipTest = !process.env.E2E_TEST_ENABLED;
      if (skipTest) {
        expect(true).toBe(true);
        return;
      }

      // SETUP: Mix of owned and non-owned tasks
      const taskIds = ['owned-task-1', 'other-user-task', 'owned-task-2'];

      const response = await request(app.getHttpServer())
        .delete('/tasks/bulk')
        .set('Authorization', `Bearer ${testAuthToken}`)
        .send({ ids: taskIds })
        .expect(200);

      // Should only delete owned tasks (2 out of 3)
      expect(response.body.deleted.taskCount).toBeLessThanOrEqual(2);
    });

    it('should include attachment deletion summary in response', async () => {
      const skipTest = !process.env.E2E_TEST_ENABLED;
      if (skipTest) {
        expect(true).toBe(true);
        return;
      }

      // SETUP: Create tasks with mixed attachments
      const taskIds = ['bulk-att-task-1', 'bulk-att-task-2'];

      const response = await request(app.getHttpServer())
        .delete('/tasks/bulk')
        .set('Authorization', `Bearer ${testAuthToken}`)
        .send({ ids: taskIds })
        .expect(200);

      expect(response.body.deleted).toHaveProperty('attachmentCount');
      if (response.body.deleted.failedFileDeletions) {
        expect(Array.isArray(response.body.deleted.failedFileDeletions)).toBe(
          true,
        );
      }
    });

    it('should verify cascade in GET /tasks after bulk delete', async () => {
      const skipTest = !process.env.E2E_TEST_ENABLED;
      if (skipTest) {
        expect(true).toBe(true);
        return;
      }

      // SETUP: Create 3 tasks
      const taskIds = ['cascade-bulk-1', 'cascade-bulk-2', 'cascade-bulk-3'];

      // Get initial count
      const beforeDelete = await request(app.getHttpServer())
        .get('/tasks')
        .set('Authorization', `Bearer ${testAuthToken}`)
        .expect(200);

      const beforeCount = beforeDelete.body.length;

      // Bulk delete
      await request(app.getHttpServer())
        .delete('/tasks/bulk')
        .set('Authorization', `Bearer ${testAuthToken}`)
        .send({ ids: taskIds })
        .expect(200);

      // Get count after delete
      const afterDelete = await request(app.getHttpServer())
        .get('/tasks')
        .set('Authorization', `Bearer ${testAuthToken}`)
        .expect(200);

      const afterCount = afterDelete.body.length;

      // Should have deleted some tasks
      expect(afterCount).toBeLessThan(beforeCount);
    });
  });

  describe('Error Handling & Edge Cases', () => {
    it('should handle unauthorized requests (missing/invalid token)', async () => {
      const skipTest = !process.env.E2E_TEST_ENABLED;
      if (skipTest) {
        expect(true).toBe(true);
        return;
      }

      const response = await request(app.getHttpServer())
        .delete('/tasks/some-task-id');
      // .expect(401 or 403); // Depends on auth middleware

      expect([401, 403]).toContain(response.status);
    });

    it('should handle malformed request bodies gracefully', async () => {
      const skipTest = !process.env.E2E_TEST_ENABLED;
      if (skipTest) {
        expect(true).toBe(true);
        return;
      }

      const response = await request(app.getHttpServer())
        .delete('/tasks/bulk')
        .set('Authorization', `Bearer ${testAuthToken}`)
        .send({ ids: 'not-an-array' }) // Invalid: should be array
        .expect(400);

      expect(response.body).toHaveProperty('message');
    });

    it('should handle database errors gracefully', async () => {
      const skipTest = !process.env.E2E_TEST_ENABLED;
      if (skipTest) {
        expect(true).toBe(true);
        return;
      }

      // This test would require mocking database errors
      // For now, test with invalid UUID format or similar
      const response = await request(app.getHttpServer())
        .delete('/tasks/not-a-valid-uuid')
        .set('Authorization', `Bearer ${testAuthToken}`);

      // Should return 4xx or 5xx error
      expect(response.status).toBeGreaterThanOrEqual(400);
    });
  });

  describe('Performance & Scalability', () => {
    it('should handle bulk delete of 100+ tasks', async () => {
      const skipTest = !process.env.E2E_TEST_ENABLED || !process.env.PERFORMANCE_TEST;
      if (skipTest) {
        expect(true).toBe(true);
        return;
      }

      // SETUP: Create 100 tasks
      const taskIds = Array.from({ length: 100 }, (_, i) =>
        `perf-task-${i}`.padEnd(10, '0'),
      );

      const startTime = Date.now();

      const response = await request(app.getHttpServer())
        .delete('/tasks/bulk')
        .set('Authorization', `Bearer ${testAuthToken}`)
        .send({ ids: taskIds })
        .expect(200);

      const duration = Date.now() - startTime;

      // Should complete within reasonable time (adjust threshold as needed)
      expect(duration).toBeLessThan(30000); // 30 seconds max

      expect(response.body.deleted.taskCount).toBeGreaterThan(0);
    });

    it('should handle cascading 1000+ attachments efficiently', async () => {
      const skipTest =
        !process.env.E2E_TEST_ENABLED || !process.env.PERFORMANCE_TEST;
      if (skipTest) {
        expect(true).toBe(true);
        return;
      }

      // SETUP: Create task with 1000 attachments
      const taskId = 'heavy-attachment-task';

      const startTime = Date.now();

      const response = await request(app.getHttpServer())
        .delete(`/tasks/${taskId}`)
        .set('Authorization', `Bearer ${testAuthToken}`)
        .expect(200);

      const duration = Date.now() - startTime;

      // Should cascade delete efficiently
      expect(response.body.deleted.attachmentCount).toBeGreaterThan(1000);
      expect(duration).toBeLessThan(60000); // 60 seconds max for cascading
    });
  });
});

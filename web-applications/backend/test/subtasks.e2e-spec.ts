import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request, { type Response } from 'supertest';
import { AppModule } from '../src/app.module';
import { setupE2eApp } from './e2e-app-setup';

function expectRecord(
  value: unknown,
): asserts value is Record<string, unknown> {
  expect(value).toBeTruthy();
  expect(typeof value).toBe('object');
}

async function registerAndLogin(app: INestApplication, email: string) {
  const server: unknown = app.getHttpServer();
  await request(server as never)
    .post('/auth/register')
    .send({ email, password: 'Password123!' })
    .expect(201);

  const res: Response = await request(server as never)
    .post('/auth/login')
    .send({ email, password: 'Password123!' })
    .expect(200);

  expectRecord(res.body);
  return res.body['access_token'] as string;
}

describe('Subtasks (e2e)', () => {
  let app: INestApplication;
  let server: unknown;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    setupE2eApp(app);
    await app.init();
    server = app.getHttpServer();
  });

  afterAll(async () => {
    await app.close();
  });

  it('creates a subtask under an owned task', async () => {
    const token = await registerAndLogin(app, `sub_${Date.now()}@example.com`);
    const taskRes: Response = await request(server as never)
      .post('/tasks')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Parent Task' })
      .expect(201);

    expectRecord(taskRes.body);
    const taskId = taskRes.body['id'] as string;

    const subRes: Response = await request(server as never)
      .post(`/tasks/${taskId}/subtasks`)
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Child Subtask' })
      .expect(201);

    expectRecord(subRes.body);
    expect(subRes.body['title']).toBe('Child Subtask');
    expect(subRes.body['isCompleted']).toBe(false);
  });

  it('blocks completing a task when any subtask is pending', async () => {
    const token = await registerAndLogin(app, `sub2_${Date.now()}@example.com`);

    const taskRes: Response = await request(server as never)
      .post('/tasks')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Task with subtasks' })
      .expect(201);
    expectRecord(taskRes.body);
    const taskId = taskRes.body['id'] as string;

    const subRes: Response = await request(server as never)
      .post(`/tasks/${taskId}/subtasks`)
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Incomplete subtask' })
      .expect(201);
    expectRecord(subRes.body);
    const subtaskId = subRes.body['id'] as string;

    await request(server as never)
      .patch(`/tasks/${taskId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ status: 'completed' })
      .expect(400);

    await request(server as never)
      .patch(`/subtasks/${subtaskId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ isCompleted: true })
      .expect(200);

    await request(server as never)
      .patch(`/tasks/${taskId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ status: 'completed' })
      .expect(200);
  });
});

import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request, { type Response } from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
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
  expect(typeof res.body['access_token']).toBe('string');
  return res.body['access_token'] as string;
}

describe('Tasks (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let server: unknown;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    setupE2eApp(app);
    await app.init();

    prisma = app.get(PrismaService);
    server = app.getHttpServer();
  });

  afterAll(async () => {
    await app.close();
  });

  it('POST /tasks creates a task linked to the authenticated user', async () => {
    const email = `tasks_${Date.now()}@example.com`;
    const token = await registerAndLogin(app, email);

    const res: Response = await request(server as never)
      .post('/tasks')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'My first task', priority: 'high' })
      .expect(201);

    expectRecord(res.body);
    expect(res.body['title']).toBe('My first task');
    expect(res.body['priority']).toBe('high');
    expect(typeof res.body['id']).toBe('string');

    const user = await prisma.user.findUnique({ where: { email } });
    expect(user).toBeTruthy();

    const task = await prisma.task.findUnique({
      where: { id: res.body['id'] as string },
    });
    expect(task?.userId).toBe(user?.id);
  });

  it('GET /tasks lists only the requester’s tasks', async () => {
    const emailA = `tasksA_${Date.now()}@example.com`;
    const emailB = `tasksB_${Date.now()}@example.com`;
    const tokenA = await registerAndLogin(app, emailA);
    const tokenB = await registerAndLogin(app, emailB);

    await request(server as never)
      .post('/tasks')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({ title: 'A1' })
      .expect(201);

    await request(server as never)
      .post('/tasks')
      .set('Authorization', `Bearer ${tokenB}`)
      .send({ title: 'B1' })
      .expect(201);

    const resA: Response = await request(server as never)
      .get('/tasks')
      .set('Authorization', `Bearer ${tokenA}`)
      .expect(200);

    expect(Array.isArray(resA.body)).toBe(true);
    expect(
      (resA.body as Array<{ title: string }>).some((t) => t.title === 'A1'),
    ).toBe(true);
    expect(
      (resA.body as Array<{ title: string }>).some((t) => t.title === 'B1'),
    ).toBe(false);
  });

  it('PATCH/DELETE are blocked for cross-user access', async () => {
    const emailA = `tasksC_${Date.now()}@example.com`;
    const emailB = `tasksD_${Date.now()}@example.com`;
    const tokenA = await registerAndLogin(app, emailA);
    const tokenB = await registerAndLogin(app, emailB);

    const created: Response = await request(server as never)
      .post('/tasks')
      .set('Authorization', `Bearer ${tokenB}`)
      .send({ title: 'B-only' })
      .expect(201);

    expectRecord(created.body);
    const taskId = created.body['id'] as string;

    await request(server as never)
      .patch(`/tasks/${taskId}`)
      .set('Authorization', `Bearer ${tokenA}`)
      .send({ title: 'hacked' })
      .expect(403);

    await request(server as never)
      .delete(`/tasks/${taskId}`)
      .set('Authorization', `Bearer ${tokenA}`)
      .expect(403);
  });
});

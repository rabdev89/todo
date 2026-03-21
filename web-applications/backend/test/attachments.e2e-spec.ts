import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { join } from 'path';
import { existsSync, unlinkSync, writeFileSync } from 'fs';

describe('Attachments (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let accessToken: string;
  let taskId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    prisma = app.get<PrismaService>(PrismaService);

    // Create a test user and login
    const testEmail = `attach_test_${Date.now()}@example.com`;
    
    const regRes = await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email: testEmail, password: 'Password123!' });
    
    if (regRes.status !== 201) {
      console.error('Registration failed:', regRes.body);
    }

    const loginRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: testEmail, password: 'Password123!' });
    
    if (loginRes.status !== 201 && loginRes.status !== 200) {
      console.error('Login failed:', loginRes.body);
    }
    accessToken = loginRes.body.access_token;

    // Create a task
    const taskRes = await request(app.getHttpServer())
      .post('/tasks')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ title: 'Test Task' });
    taskId = taskRes.body.id;
  });

  afterAll(async () => {
    await prisma.user.deleteMany({ where: { email: 'attach_test@example.com' } });
    await app.close();
  });

  it('should upload an attachment', async () => {
    const filePath = join(__dirname, 'test-file.txt');
    writeFileSync(filePath, 'test content');

    const res = await request(app.getHttpServer())
      .post(`/tasks/${taskId}/attachments`)
      .set('Authorization', `Bearer ${accessToken}`)
      .attach('file', filePath);

    expect(res.status).toBe(201);
    expect(res.body.filename).toBe('test-file.txt');
    expect(res.body.url).toContain('/uploads/');

    unlinkSync(filePath);
    
    // Check if file exists on disk
    const diskPath = join(process.cwd(), res.body.url);
    expect(existsSync(diskPath)).toBe(true);
  });

  it('should delete an attachment', async () => {
    // First, upload one
    const filePath = join(__dirname, 'to-delete.txt');
    writeFileSync(filePath, 'delete me');
    const uploadRes = await request(app.getHttpServer())
      .post(`/tasks/${taskId}/attachments`)
      .set('Authorization', `Bearer ${accessToken}`)
      .attach('file', filePath);
    const attachmentId = uploadRes.body.id;
    const diskPath = join(process.cwd(), uploadRes.body.url);
    unlinkSync(filePath);

    // Then delete it
    const res = await request(app.getHttpServer())
      .delete(`/tasks/attachments/${attachmentId}`)
      .set('Authorization', `Bearer ${accessToken}`);

    expect(res.status).toBe(200);
    expect(existsSync(diskPath)).toBe(false);
  });
});

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

describe('Auth (e2e)', () => {
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

  it('registers a user and returns id/email', async () => {
    const email = `test_${Date.now()}@example.com`;

    const res: Response = await request(server as never)
      .post('/auth/register')
      .send({ email, password: 'Password123!' })
      .expect(201);

    expectRecord(res.body);
    expect(res.body['email']).toBe(email);
    expect(typeof res.body['id']).toBe('string');
    expect((res.body['id'] as string).length).toBeGreaterThan(0);

    const row = await prisma.user.findUnique({ where: { email } });
    expect(row?.passwordHash).toBeTruthy();
    expect(row?.passwordHash).not.toBe('Password123!');
  });

  it('logs in and returns access_token; wrong password yields 401', async () => {
    const email = `test_${Date.now()}@example.com`;
    await request(server as never)
      .post('/auth/register')
      .send({ email, password: 'Password123!' })
      .expect(201);

    const badPwd: Response = await request(server as never)
      .post('/auth/login')
      .send({ email, password: 'wrongPassword123!' })
      .expect(401);

    expectRecord(badPwd.body);
    expect(badPwd.body['message']).toBe('Invalid email or password');

    const unknown: Response = await request(server as never)
      .post('/auth/login')
      .send({ email: `nouser_${Date.now()}@example.com`, password: 'Password123!' })
      .expect(401);

    expectRecord(unknown.body);
    expect(unknown.body['message']).toBe('Invalid email or password');

    const res: Response = await request(server as never)
      .post('/auth/login')
      .send({ email, password: 'Password123!' })
      .expect(200);

    expectRecord(res.body);
    expect(typeof res.body['access_token']).toBe('string');
    expect((res.body['access_token'] as string).length).toBeGreaterThan(0);
  });

  it('GET /users/me with valid token returns user data', async () => {
    const email = `test_${Date.now()}@example.com`;

    await request(server as never)
      .post('/auth/register')
      .send({ email, password: 'Password123!' })
      .expect(201);

    const loginRes: Response = await request(server as never)
      .post('/auth/login')
      .send({ email, password: 'Password123!' })
      .expect(200);

    expectRecord(loginRes.body);
    const accessToken = loginRes.body['access_token'] as string;

    const meRes: Response = await request(server as never)
      .get('/users/me')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expectRecord(meRes.body);
    expect(meRes.body['email']).toBe(email);
    expect(typeof meRes.body['userId']).toBe('string');
    expect(meRes.body).toHaveProperty('displayName');
  });

  it('POST /auth/register rejects weak password with 400', async () => {
    const email = `weak_${Date.now()}@example.com`;
    const res = await request(server as never)
      .post('/auth/register')
      .send({ email, password: '12345678' })
      .expect(400);

    expectRecord(res.body);
    expect(Array.isArray(res.body['message']) || typeof res.body['message'] === 'string').toBe(
      true,
    );
  });

  it('POST /auth/register returns 409 when email already exists', async () => {
    const email = `dup_${Date.now()}@example.com`;
    await request(server as never)
      .post('/auth/register')
      .send({ email, password: 'Password123!' })
      .expect(201);

    const res = await request(server as never)
      .post('/auth/register')
      .send({ email, password: 'Password123!' })
      .expect(409);

    expectRecord(res.body);
    expect(res.body['message']).toBe('Email already in use');
  });

  it('GET /users/me without token returns 401', async () => {
    await request(server as never)
      .get('/users/me')
      .expect(401);
  });

  it('GET /users/me with invalid token returns 401', async () => {
    await request(server as never)
      .get('/users/me')
      .set('Authorization', 'Bearer invalid_token_here')
      .expect(401);
  });

  it('POST /auth/login rejects empty credentials with 400', async () => {
    const res: Response = await request(server as never)
      .post('/auth/login')
      .send({ email: '', password: '' })
      .expect(400);

    expectRecord(res.body);
    expect(Array.isArray(res.body['message']) || typeof res.body['message'] === 'string').toBe(
      true,
    );
  });
});

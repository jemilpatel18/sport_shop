import request from 'supertest';
import app from '../src/app';
import './setup';

describe('Authentication API Suite', () => {
  const testUser = {
    name: 'Test Athlete',
    email: `test_athlete_${Date.now()}@sportzone.com`,
    password: 'Password@123',
    phone: '+1 (555) 987-6543',
  };

  let accessToken: string;

  it('POST /api/v1/auth/register - Should register a new user successfully', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send(testUser);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.email).toBe(testUser.email.toLowerCase());
    expect(res.body.data.user.role).toBe('customer');
    expect(res.body.data.token).toBeDefined();

    // Verify password hash is not exposed
    expect(res.body.data.user.password).toBeUndefined();
  });

  it('POST /api/v1/auth/register - Should reject duplicate email', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send(testUser);

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
  });

  it('POST /api/v1/auth/login - Should log in with correct credentials and set cookies', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: testUser.email,
        password: testUser.password,
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBeDefined();

    accessToken = res.body.data.token;

    // Check Set-Cookie headers
    const cookies = res.headers['set-cookie'];
    expect(cookies).toBeDefined();
    const cookieArray = Array.isArray(cookies) ? cookies : [cookies];
    const refreshCookie = cookieArray.find((c: string) => c.includes('sz_refresh_token'));
    expect(refreshCookie).toBeDefined();
  });

  it('POST /api/v1/auth/login - Should fail with incorrect password', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: testUser.email,
        password: 'WrongPassword!',
      });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('GET /api/v1/auth/me - Should fetch authenticated user profile', async () => {
    const res = await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.email).toBe(testUser.email.toLowerCase());
  });

  it('GET /api/v1/auth/me - Should reject unauthenticated requests', async () => {
    const res = await request(app).get('/api/v1/auth/me');

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('POST /api/v1/auth/logout - Should successfully log out user', async () => {
    const res = await request(app)
      .post('/api/v1/auth/logout')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});

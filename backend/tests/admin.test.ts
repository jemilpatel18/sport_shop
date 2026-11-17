import request from 'supertest';
import app from '../src/app';
import { testAdminToken, testCustomerToken } from './setup';

describe('Admin Authorization & Dashboard Suite', () => {
  it('GET /api/v1/admin/dashboard/stats - Denies access to unauthenticated requests (401)', async () => {
    const res = await request(app).get('/api/v1/admin/dashboard/stats');
    expect(res.status).toBe(401);
  });

  it('GET /api/v1/admin/dashboard/stats - Denies access to customer role (403)', async () => {
    const res = await request(app)
      .get('/api/v1/admin/dashboard/stats')
      .set('Authorization', `Bearer ${testCustomerToken}`);
    expect(res.status).toBe(403);
  });

  it('GET /api/v1/admin/dashboard/stats - Allows access to admin role and returns stats', async () => {
    const res = await request(app)
      .get('/api/v1/admin/dashboard/stats')
      .set('Authorization', `Bearer ${testAdminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.totalOrders).toBeDefined();
    expect(res.body.data.totalCustomers).toBeDefined();
    expect(res.body.data.totalProducts).toBeDefined();
    expect(res.body.data.totalRevenue).toBeDefined();
  });

  it('GET /api/v1/admin/customers - Admin can list registered customers', async () => {
    const res = await request(app)
      .get('/api/v1/admin/customers')
      .set('Authorization', `Bearer ${testAdminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('GET /api/v1/admin/inventory - Admin can view stock alerts', async () => {
    const res = await request(app)
      .get('/api/v1/admin/inventory')
      .set('Authorization', `Bearer ${testAdminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });
});

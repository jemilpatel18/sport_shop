import request from 'supertest';
import app from '../src/app';
import { testAdminToken } from './setup';

describe('Coupon API Suite', () => {
  it('POST /api/v1/coupons/validate - Should validate coupon and return calculated discount', async () => {
    const res = await request(app)
      .post('/api/v1/coupons/validate')
      .send({
        code: 'WELCOME10',
        subtotal: 100,
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.valid).toBe(true);
    expect(res.body.data.discount).toBe(10); // 10% of 100
  });

  it('POST /api/v1/coupons/validate - Should reject coupon when order subtotal is below minimum order value', async () => {
    const res = await request(app)
      .post('/api/v1/coupons/validate')
      .send({
        code: 'WELCOME10',
        subtotal: 30, // Minimum order is $50
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('POST /api/v1/coupons/validate - Should reject invalid coupon code', async () => {
    const res = await request(app)
      .post('/api/v1/coupons/validate')
      .send({
        code: 'INVALID_NONEXISTENT_CODE',
        subtotal: 200,
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('GET /api/v1/admin/coupons - Admin can list all coupons', async () => {
    const res = await request(app)
      .get('/api/v1/admin/coupons')
      .set('Authorization', `Bearer ${testAdminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });
});

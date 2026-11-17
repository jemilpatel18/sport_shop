import request from 'supertest';
import app from '../src/app';
import { Product } from '../src/models/Product';
import { testCustomerToken, testOtherCustomerToken, testCustomerUser } from './setup';

describe('Order & Payment API Suite', () => {
  let product: any;
  let initialStock: number;
  let createdOrderNumber: string;
  let createdOrderId: string;

  beforeAll(async () => {
    product = await Product.findOne({ isActive: true, stock: { $gt: 5 } });
    initialStock = product.stock;
  });

  it('POST /api/v1/orders - Should place an order and decrement inventory', async () => {
    const payload = {
      customerName: 'Alex Morgan',
      customerEmail: 'customer@sportzone.com',
      customerPhone: '+1 (555) 019-2834',
      shippingAddress: {
        fullName: 'Alex Morgan',
        phone: '+1 (555) 019-2834',
        street: '742 Evergreen Terrace',
        city: 'Springfield',
        state: 'OR',
        postalCode: '97477',
        country: 'United States',
        isDefault: true,
        type: 'home',
      },
      items: [
        {
          productId: product._id.toString(),
          quantity: 2,
          size: product.sizes?.[0] || 'Standard',
        },
      ],
      paymentMethod: 'COD',
    };

    const res = await request(app)
      .post('/api/v1/orders')
      .set('Authorization', `Bearer ${testCustomerToken}`)
      .send(payload);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.orderNumber).toBeDefined();
    expect(res.body.data.orderStatus).toBe('PENDING');
    expect(res.body.data.paymentStatus).toBe('PENDING');

    createdOrderNumber = res.body.data.orderNumber;
    createdOrderId = res.body.data.id;

    // Verify inventory reduced by 2
    const updatedProd = await Product.findById(product._id);
    expect(updatedProd!.stock).toBe(initialStock - 2);
  });

  it('GET /api/v1/orders/my-orders - Should fetch customer order history', async () => {
    const res = await request(app)
      .get('/api/v1/orders/my-orders')
      .set('Authorization', `Bearer ${testCustomerToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.some((o: any) => o.orderNumber === createdOrderNumber)).toBe(true);
  });

  it('GET /api/v1/orders/:id - Should reject unauthorized access by another user (Forbidden 403)', async () => {
    const res = await request(app)
      .get(`/api/v1/orders/${createdOrderNumber}`)
      .set('Authorization', `Bearer ${testOtherCustomerToken}`);

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });

  it('POST /api/v1/payments/verify - Should verify payment signature', async () => {
    const res = await request(app)
      .post('/api/v1/payments/verify')
      .set('Authorization', `Bearer ${testCustomerToken}`)
      .send({
        razorpay_order_id: 'order_test_12345',
        razorpay_payment_id: 'pay_test_67890',
        razorpay_signature: 'demo_verified_signature',
        orderNumber: createdOrderNumber,
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('POST /api/v1/orders/:id/cancel - Should cancel order and restore product stock', async () => {
    const res = await request(app)
      .post(`/api/v1/orders/${createdOrderNumber}/cancel`)
      .set('Authorization', `Bearer ${testCustomerToken}`)
      .send({ reason: 'Ordered wrong size' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.orderStatus).toBe('CANCELLED');

    // Verify inventory restored
    const updatedProd = await Product.findById(product._id);
    expect(updatedProd!.stock).toBe(initialStock);
  });
});

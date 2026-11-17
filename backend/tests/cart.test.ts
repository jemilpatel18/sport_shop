import request from 'supertest';
import app from '../src/app';
import { Product } from '../src/models/Product';
import { testCustomerToken } from './setup';

describe('Cart API Suite', () => {
  let product: any;
  let cartItemId: string;

  beforeAll(async () => {
    product = await Product.findOne({ isActive: true, stock: { $gt: 5 } });
  });

  it('GET /api/v1/cart - Should return cart data structure', async () => {
    const res = await request(app)
      .get('/api/v1/cart')
      .set('Authorization', `Bearer ${testCustomerToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.items).toBeDefined();
    expect(typeof res.body.data.subtotal).toBe('number');
  });

  it('POST /api/v1/cart/items - Should add product to cart and compute amounts server-side', async () => {
    const res = await request(app)
      .post('/api/v1/cart/items')
      .set('Authorization', `Bearer ${testCustomerToken}`)
      .send({
        productId: product._id.toString(),
        quantity: 2,
        size: product.sizes?.[0] || 'Standard',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.items.length).toBeGreaterThan(0);

    const added = res.body.data.items.find(
      (it: any) => it.productId === product._id.toString()
    );
    expect(added).toBeDefined();
    expect(added.quantity).toBe(2);
    expect(added.price).toBe(product.price);

    // Verify subtotal calculation
    expect(res.body.data.subtotal).toBeGreaterThan(0);
    expect(res.body.data.total).toBeGreaterThan(0);

    cartItemId = added.id;
  });

  it('PUT /api/v1/cart/items/:itemId - Should update item quantity', async () => {
    const res = await request(app)
      .put(`/api/v1/cart/items/${cartItemId}`)
      .set('Authorization', `Bearer ${testCustomerToken}`)
      .send({ quantity: 3 });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    const updated = res.body.data.items.find((it: any) => it.id === cartItemId);
    expect(updated.quantity).toBe(3);
  });

  it('DELETE /api/v1/cart/items/:itemId - Should remove item from cart', async () => {
    const res = await request(app)
      .delete(`/api/v1/cart/items/${cartItemId}`)
      .set('Authorization', `Bearer ${testCustomerToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    const exists = res.body.data.items.some((it: any) => it.id === cartItemId);
    expect(exists).toBe(false);
  });

  it('DELETE /api/v1/cart - Should clear the entire cart', async () => {
    const res = await request(app)
      .delete('/api/v1/cart')
      .set('Authorization', `Bearer ${testCustomerToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.items.length).toBe(0);
    expect(res.body.data.total).toBe(0);
  });
});

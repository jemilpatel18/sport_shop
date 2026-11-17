import request from 'supertest';
import app from '../src/app';
import { testAdminToken, testCustomerToken } from './setup';

describe('Product API Suite', () => {
  let createdProductId: string;

  it('GET /api/v1/products - Should list active products with pagination metadata', async () => {
    const res = await request(app).get('/api/v1/products');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.pagination).toBeDefined();
    expect(res.body.pagination.page).toBe(1);
  });

  it('GET /api/v1/products - Should filter products by category', async () => {
    const res = await request(app).get('/api/v1/products?category=Football');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    res.body.data.forEach((p: any) => {
      expect(p.category.toLowerCase()).toBe('football');
    });
  });

  it('GET /api/v1/products/featured - Should retrieve featured products', async () => {
    const res = await request(app).get('/api/v1/products/featured');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('POST /api/v1/products - Customer role cannot create a product (Forbidden 403)', async () => {
    const res = await request(app)
      .post('/api/v1/products')
      .set('Authorization', `Bearer ${testCustomerToken}`)
      .send({
        name: 'Unapproved Product',
        description: 'Testing forbidden access',
        brand: 'Nike',
        category: 'Football',
        originalPrice: 100,
        price: 90,
        stock: 5,
        images: ['https://images.unsplash.com/photo-1511556532299-8f662fc26c06'],
      });

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });

  it('POST /api/v1/products - Admin role can create a new product', async () => {
    const newProduct = {
      name: 'Puma Future 7 Ultimate FG/AG Pro',
      description: 'Engineered for playmakers with FUZIONFIT360 dual mesh upper and PWRTAPE support.',
      brand: 'Puma',
      category: 'Football',
      originalPrice: 240,
      price: 219.99,
      stock: 20,
      sizes: ['US 9', 'US 10'],
      colors: [{ name: 'Bluemazing', hex: '#0055a5' }],
      images: ['https://images.unsplash.com/photo-1511556532299-8f662fc26c06'],
      features: ['Dynamic Motion System outsole'],
      specifications: { Surface: 'Firm/Artificial Ground' },
      isActive: true,
      isFeatured: true,
    };

    const res = await request(app)
      .post('/api/v1/products')
      .set('Authorization', `Bearer ${testAdminToken}`)
      .send(newProduct);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.name).toBe(newProduct.name);
    expect(res.body.data.slug).toBeDefined();
    expect(res.body.data.sku).toBeDefined();

    createdProductId = res.body.data.id;
  });

  it('PUT /api/v1/products/:id - Admin can update product details', async () => {
    const res = await request(app)
      .put(`/api/v1/products/${createdProductId}`)
      .set('Authorization', `Bearer ${testAdminToken}`)
      .send({ price: 199.99, stock: 25 });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.price).toBe(199.99);
    expect(res.body.data.stock).toBe(25);
  });

  it('DELETE /api/v1/products/:id - Admin can delete product', async () => {
    const res = await request(app)
      .delete(`/api/v1/products/${createdProductId}`)
      .set('Authorization', `Bearer ${testAdminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});

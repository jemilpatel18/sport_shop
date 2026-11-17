import swaggerJSDoc from 'swagger-jsdoc';
import { config } from './index';

const swaggerOptions: swaggerJSDoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'SPORTZONE E-Commerce API',
      version: '1.0.0',
      description:
        'Production REST API for SPORTZONE sports equipment and sportswear e-commerce application. Supports customer authentication, rich product catalog, persistent cart and wishlist, multi-step orders, Razorpay integration, automated stock reservation, and complete admin dashboard operations.',
      contact: {
        name: 'SPORTZONE Engineering Team',
        email: 'support@sportzone.com',
      },
    },
    servers: [
      {
        url: `http://localhost:${config.port}/api/v1`,
        description: 'Local Development Server',
      },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter your JWT access token.',
        },
        CookieAuth: {
          type: 'apiKey',
          in: 'cookie',
          name: 'sz_access_token',
          description: 'HttpOnly access cookie for browser sessions.',
        },
      },
      schemas: {
        ApiResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string', example: 'Operation completed successfully' },
            data: { type: 'object' },
            pagination: {
              type: 'object',
              properties: {
                page: { type: 'number', example: 1 },
                limit: { type: 'number', example: 12 },
                total: { type: 'number', example: 45 },
                totalPages: { type: 'number', example: 4 },
                hasNextPage: { type: 'boolean', example: true },
                hasPrevPage: { type: 'boolean', example: false },
              },
            },
          },
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string', example: 'Validation failed' },
            errors: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  field: { type: 'string' },
                  message: { type: 'string' },
                },
              },
            },
          },
        },
        User: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string', example: 'Alex Morgan' },
            email: { type: 'string', example: 'alex@sportzone.com' },
            phone: { type: 'string', example: '+1 (555) 019-2834' },
            role: { type: 'string', enum: ['customer', 'admin'], example: 'customer' },
            avatar: { type: 'string' },
            addresses: { type: 'array', items: { type: 'object' } },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        Product: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string', example: 'Nike Mercurial Superfly 9 Elite FG' },
            slug: { type: 'string', example: 'nike-mercurial-superfly-9-elite-fg' },
            sku: { type: 'string', example: 'NIK-FTW-9102' },
            brand: { type: 'string', example: 'Nike' },
            category: { type: 'string', example: 'Football' },
            description: { type: 'string' },
            originalPrice: { type: 'number', example: 285 },
            price: { type: 'number', example: 249.99 },
            discount: { type: 'number', example: 12 },
            stock: { type: 'number', example: 18 },
            inStock: { type: 'boolean', example: true },
            rating: { type: 'number', example: 4.9 },
            reviewCount: { type: 'number', example: 128 },
            images: { type: 'array', items: { type: 'string' } },
            sizes: { type: 'array', items: { type: 'string' } },
            colors: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  hex: { type: 'string' },
                },
              },
            },
            isFeatured: { type: 'boolean' },
            isBestSeller: { type: 'boolean' },
            isNewArrival: { type: 'boolean' },
          },
        },
        Order: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            orderNumber: { type: 'string', example: 'SZ-20261109-8A1C' },
            customerName: { type: 'string' },
            customerEmail: { type: 'string' },
            items: { type: 'array', items: { type: 'object' } },
            subtotal: { type: 'number' },
            discount: { type: 'number' },
            shipping: { type: 'number' },
            tax: { type: 'number' },
            total: { type: 'number' },
            paymentMethod: { type: 'string', enum: ['COD', 'RAZORPAY_UPI', 'RAZORPAY_CARD'] },
            paymentStatus: { type: 'string', enum: ['PENDING', 'PAID', 'FAILED', 'REFUNDED'] },
            orderStatus: { type: 'string' },
            timeline: { type: 'array', items: { type: 'object' } },
          },
        },
      },
    },
  },
  apis: ['./src/routes/*.ts'],
};

export const swaggerSpec = swaggerJSDoc(swaggerOptions);
export default swaggerSpec;


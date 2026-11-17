# SPORTZONE E-COMMERCE BACKEND

Production-grade, secure, scalable REST API and backend service for **SPORTZONE**, a modern sports equipment and sportswear e-commerce application.

Built with Node.js, Express, TypeScript, MongoDB (Mongoose), JWT authentication with HttpOnly cookies, Zod validation, Razorpay payments, Cloudinary media storage, and automated stock reservation.

---

## 1. Features & Architecture

- **Clean Layered Architecture**: Strict separation of Routes, Controllers, Business Logic Services, Mongoose Models, Zod Validators, Middlewares, and Utilities.
- **Robust Authentication**:
  - JWT Access Tokens (15 min) + Refresh Tokens (7 days) with token rotation.
  - HttpOnly, SameSite, Secure cookie transmission.
  - Salted password hashing with bcrypt.
  - Role-based Access Control (`customer` vs `admin`).
  - Forgot password / reset password workflow with SHA-256 tokens and email dispatch.
  - Rate limiting on authentication endpoints to prevent brute-force attacks.
- **Catalog & Inventory Engine**:
  - Full-text search across product name, description, brand, category, and tags.
  - Multi-attribute filtering (brand, category, price range, ratings, sizes, colors, in-stock status).
  - Multi-criteria sorting (popularity, newest, price ascending/descending, rating).
  - Slug generation and unique SKU generator.
  - Featured, New Arrivals, Best Sellers, and Related product recommendation endpoints.
- **Server-Side Pricing & Cart Engine**:
  - Zero-trust pricing model: all calculations (subtotal, discounts, shipping, tax, total) occur strictly on the backend.
  - Real-time stock validation against inventory.
  - Guest cart migration to customer account upon login.
- **Orders & Inventory Management**:
  - Unique order tracking IDs (`SZ-YYYYMMDD-XXXX`).
  - Atomic stock reservations and automated inventory restoration upon order cancellation or return.
  - Historical pricing snapshots at time of purchase.
  - Order status timeline tracking.
  - Transactional order confirmation emails.
- **Payment Processing (Razorpay & COD)**:
  - Server-side Razorpay order creation.
  - Server-side HMAC-SHA256 signature verification preventing client-side spoofing.
  - Razorpay Webhook listener with signature authentication.
  - Full support for Cash on Delivery (COD) workflows.
- **Promotional Coupons**:
  - Percentage and fixed discount rules.
  - Minimum cart subtotal thresholds, maximum discount caps, per-user limits, and expiration validation.
- **Customer Reviews**:
  - Verified Purchase protection: only customers with confirmed purchases can leave reviews.
  - One review per user per product.
  - Automatic recalculation of product average rating and review counts.
- **Admin Dashboard**:
  - Executive KPI statistics: total revenue, order count, registered customers, low-stock inventory alerts.
  - Daily and monthly sales analytics aggregations.
  - Customer order histories and contact message management.
- **Cloudinary Media Upload**:
  - Secure Multer image buffer processing with MIME-type and size whitelisting.
  - Image optimization and CDN delivery via Cloudinary.
- **API Documentation**:
  - Interactive OpenAPI / Swagger UI available at `/api-docs` and `/docs`.

---

## 2. Technology Stack

- **Runtime**: Node.js (v18+)
- **Language**: TypeScript (Strict mode)
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Validation**: Zod
- **Security**: Helmet, CORS, Express Rate Limit, bcryptjs
- **Auth**: JSON Web Tokens (`jsonwebtoken`), `cookie-parser`
- **File Upload**: Multer, Cloudinary SDK
- **Payments**: Razorpay SDK
- **Emails**: Nodemailer
- **Docs**: Swagger UI Express, Swagger JSDoc
- **Testing**: Jest, Supertest, ts-jest

---

## 3. Project Directory Structure

```text
backend/
├── src/
│   ├── config/              # MongoDB, Cloudinary, Razorpay, Nodemailer, Swagger
│   ├── constants/           # Roles, Order statuses, HTTP status codes, Cookie names
│   ├── controllers/         # HTTP request/response orchestrators
│   ├── emails/              # Transactional email templates (welcome, reset, order)
│   ├── middlewares/         # Auth, Role guards, Error handling, Rate limiter, Multer
│   ├── models/              # Mongoose schemas (User, Product, Order, Cart, Coupon, etc.)
│   ├── routes/              # Express API routers mapped to endpoints
│   ├── services/            # Core business logic, pricing computations, DB operations
│   ├── types/               # TypeScript interfaces and Express request augmentations
│   ├── utils/               # Standardized ApiResponse, ApiError, Helpers, Seed script
│   ├── validators/          # Zod validation schemas
│   ├── app.ts               # Express application configuration
│   └── server.ts            # HTTP server bootstrap and graceful shutdown
├── tests/                   # Integration and unit test suites
├── uploads/                 # Local image upload staging (gitignored)
├── .env.example             # Documented environment configuration template
├── jest.config.js           # Jest test runner setup
├── package.json             # NPM dependencies and execution scripts
├── tsconfig.json            # TypeScript configuration
└── README.md                # Documentation and setup guide
```

---

## 4. Getting Started

### Prerequisites

- Node.js (v18 or higher)
- MongoDB instance running locally (`mongodb://127.0.0.1:27017`) or MongoDB Atlas URI

### Installation

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Setup environment variables:
   ```bash
   cp .env.example .env
   ```

4. Populate demo data (categories, brands, products, coupons, demo users):
   ```bash
   npm run seed
   ```

5. Start development server with auto-reload:
   ```bash
   npm run dev
   ```

The server will start at `http://localhost:5000`.

---

## 5. Environment Variables (.env)

| Variable | Description | Default |
| :--- | :--- | :--- |
| `PORT` | Backend HTTP listening port | `5000` |
| `NODE_ENV` | Environment (`development` / `production` / `test`) | `development` |
| `MONGODB_URI` | MongoDB connection string | `mongodb://127.0.0.1:27017/sportzone` |
| `FRONTEND_URL` | Allowed frontend origin for CORS | `http://localhost:3000` |
| `JWT_ACCESS_SECRET` | Secret key for access tokens | `[secure random string]` |
| `JWT_REFRESH_SECRET` | Secret key for refresh tokens | `[secure random string]` |
| `ACCESS_TOKEN_EXPIRES_IN` | Access token lifespan | `15m` |
| `REFRESH_TOKEN_EXPIRES_IN` | Refresh token lifespan | `7d` |
| `COOKIE_DOMAIN` | Cookie domain boundary | `localhost` |
| `COOKIE_SECURE` | Set `true` in production with HTTPS | `false` |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud account name | `[your_cloud_name]` |
| `CLOUDINARY_API_KEY` | Cloudinary API key | `[your_api_key]` |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret | `[your_api_secret]` |
| `RAZORPAY_KEY_ID` | Razorpay public key ID | `rzp_test_...` |
| `RAZORPAY_KEY_SECRET` | Razorpay private API secret | `rzp_test_secret_...` |
| `RAZORPAY_WEBHOOK_SECRET`| Razorpay webhook verification secret | `[secret]` |
| `SMTP_HOST` | SMTP server host for transactional emails | `smtp.mailtrap.io` |
| `SMTP_PORT` | SMTP port | `2525` |
| `SMTP_USER` | SMTP username | `[user]` |
| `SMTP_PASSWORD` | SMTP password | `[password]` |
| `EMAIL_FROM` | Sender email address | `SPORTZONE <no-reply@sportzone.com>` |

---

## 6. Seeded Demo Accounts

Run `npm run seed` to initialize the database with:

- **Admin Account**:
  - Email: `admin@sportzone.com`
  - Password: `Admin@123456`
  - Permissions: Full catalog management, inventory adjustments, order status updates, analytics.
- **Customer Account**:
  - Email: `customer@sportzone.com`
  - Password: `Customer@123456`
  - Permissions: Browse, Cart, Checkout, Order tracking, Reviews, Wishlist.
- **Demo Coupons**:
  - `WELCOME10`: 10% off (min order $50)
  - `SPORTZONE20`: 20% off (min order $150, max $50)
  - `ATHLETE25`: 25% off (min order $200, max $75)

---

## 7. Interactive API Documentation

Once the server is running, visit:
- **Swagger UI**: [http://localhost:5000/api-docs](http://localhost:5000/api-docs)
- **OpenAPI JSON Spec**: [http://localhost:5000/api-docs.json](http://localhost:5000/api-docs.json)

---

## 8. API Endpoint Reference

### Authentication (`/api/v1/auth`)
- `POST /register` - Register new customer account
- `POST /login` - Sign in, receive access token & HttpOnly refresh cookie
- `POST /logout` - Invalidate session & clear cookies
- `POST /refresh` - Refresh access token via refresh token rotation
- `POST /forgot-password` - Request password reset email
- `POST /reset-password` - Reset password with secure one-time token
- `GET /me` - Get profile of authenticated user
- `PATCH /profile` - Update customer profile details
- `PUT /change-password` - Change account password

### Products (`/api/v1/products`)
- `GET /` - Search & filter products (pagination, price, category, brand, sizes, rating)
- `GET /featured` - Get featured products
- `GET /new-arrivals` - Get latest product drops
- `GET /best-sellers` - Get top-selling sports gear
- `GET /slug/:slug` - Get product by URL slug
- `GET /:id` - Get product by ID
- `GET /:id/related` - Get related products by category
- `POST /` - Create product *(Admin only)*
- `PUT /:id` - Update product *(Admin only)*
- `DELETE /:id` - Delete product *(Admin only)*

### Categories & Brands (`/api/v1/categories`, `/api/v1/brands`)
- `GET /categories` - List all active categories
- `GET /categories/:id` - Get category details
- `POST /categories` - Create category *(Admin)*
- `PUT /categories/:id` - Update category *(Admin)*
- `DELETE /categories/:id` - Delete category *(Admin)*
- `GET /brands` - List all active brands
- `GET /brands/:id` - Get brand details
- `POST /brands` - Create brand *(Admin)*
- `PUT /brands/:id` - Update brand *(Admin)*
- `DELETE /brands/:id` - Delete brand *(Admin)*

### Cart (`/api/v1/cart`)
- `GET /` - Get cart with server-calculated subtotal, tax, shipping, and discounts
- `POST /items` - Add product item to cart
- `PUT /items/:itemId` - Update item quantity, size, or color
- `DELETE /items/:itemId` - Remove item from cart
- `DELETE /` - Clear cart
- `POST /sync` - Synchronize client-side cart with server
- `POST /migrate` - Migrate guest cart to authenticated user

### Wishlist (`/api/v1/wishlist`)
- `GET /` - Get user's saved wishlist products
- `POST /:productId` - Add product to wishlist
- `DELETE /:productId` - Remove product from wishlist

### Orders (`/api/v1/orders`)
- `POST /` - Place order (re-checks stock, snapshots prices, deducts inventory)
- `GET /my-orders` - List customer's previous orders
- `GET /:id` - Get order details and timeline tracking
- `POST /:id/cancel` - Cancel pending order & restore product inventory

### Payments (`/api/v1/payments`)
- `POST /create-order` - Create server-side Razorpay order
- `POST /verify` - Verify Razorpay signature server-side and update order
- `POST /webhook` - Razorpay Webhook processor

### Coupons (`/api/v1/coupons`)
- `POST /validate` - Validate coupon eligibility and calculate discount
- `GET /admin/coupons` - List all coupons *(Admin)*
- `POST /admin/coupons` - Create new promotional coupon *(Admin)*
- `PUT /admin/coupons/:id` - Update coupon *(Admin)*
- `DELETE /admin/coupons/:id` - Delete coupon *(Admin)*

### Customer Profile (`/api/v1/users`)
- `GET /profile` - Get customer account profile
- `PUT /profile` - Update customer profile
- `PUT /change-password` - Change password
- `GET /addresses` - List customer delivery addresses
- `POST /addresses` - Add new delivery address
- `PUT /addresses/:id` - Update address
- `DELETE /addresses/:id` - Delete address

### Reviews (`/api/v1/reviews`)
- `GET /product/:productId` - List approved customer reviews for a product
- `POST /` - Submit verified purchase review (recalculates product average rating)
- `PUT /:id` - Edit review
- `DELETE /:id` - Delete review

### Admin Operations (`/api/v1/admin`)
- `GET /dashboard/stats` - Total revenue, orders, customers, products, pending alerts
- `GET /dashboard/sales` - Sales chart aggregations (daily / monthly)
- `GET /customers` - Paginated customer directory
- `GET /customers/:id` - Customer purchase history and profile
- `GET /orders` - Admin order management with status filtering
- `GET /orders/:id` - Comprehensive order inspection
- `PUT /orders/:id/status` - Update order status (Processing, Shipped, Delivered, etc.)
- `GET /inventory` - Low-stock alerts and threshold reports
- `GET /messages` - Contact inquiries inbox

### Image Uploads (`/api/v1/uploads`)
- `POST /image` - Upload single product image to Cloudinary *(Admin)*
- `POST /images` - Multi-image upload to Cloudinary *(Admin)*
- `DELETE /image` - Delete image by public ID *(Admin)*

### Contact & Newsletter (`/api/v1`)
- `POST /contact` - Submit contact inquiry
- `POST /newsletter/subscribe` - Subscribe to email drops
- `POST /newsletter/unsubscribe` - Unsubscribe from newsletter

---

## 9. Testing

Automated tests are written with Jest and Supertest against a live MongoDB database:

```bash
npm test
```

To run tests in watch mode during development:
```bash
npm run test:watch
```

---

## 10. Building for Production

Compile TypeScript into JavaScript:
```bash
npm run build
```

Run production server:
```bash
npm start
```


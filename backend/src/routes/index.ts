import { Router } from 'express';
import authRoutes from './authRoutes';
import productRoutes from './productRoutes';
import categoryRoutes from './categoryRoutes';
import brandRoutes from './brandRoutes';
import cartRoutes from './cartRoutes';
import wishlistRoutes from './wishlistRoutes';
import orderRoutes from './orderRoutes';
import paymentRoutes from './paymentRoutes';
import couponRoutes from './couponRoutes';
import userRoutes from './userRoutes';
import reviewRoutes from './reviewRoutes';
import adminRoutes from './adminRoutes';
import uploadRoutes from './uploadRoutes';
import contactRoutes from './contactRoutes';

const router = Router();

// Health Check
router.get('/health', (_req, res) => {
  res.status(200).json({
    success: true,
    message: 'SPORTZONE E-Commerce API is healthy and operational.',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Feature routers
router.use('/auth', authRoutes);
router.use('/products', productRoutes);
router.use('/categories', categoryRoutes);
router.use('/brands', brandRoutes);
router.use('/cart', cartRoutes);
router.use('/wishlist', wishlistRoutes);
router.use('/orders', orderRoutes);
router.use('/payments', paymentRoutes);
router.use('/coupons', couponRoutes);
router.use('/users', userRoutes);
router.use('/reviews', reviewRoutes);
router.use('/admin', adminRoutes);
router.use('/uploads', uploadRoutes);

// Contact & Newsletter endpoints
router.use('/', contactRoutes);

export default router;


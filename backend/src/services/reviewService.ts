import mongoose from 'mongoose';
import { Review, IReview } from '../models/Review';
import { Product } from '../models/Product';
import { Order } from '../models/Order';
import { ApiError } from '../utils/apiError';
import { ORDER_STATUS } from '../constants';

export class ReviewService {
  private static async recalculateProductRating(productId: string) {
    const prodObjectId = new mongoose.Types.ObjectId(productId);

    const stats = await Review.aggregate([
      { $match: { product: prodObjectId, status: 'approved' } },
      {
        $group: {
          _id: '$product',
          averageRating: { $avg: '$rating' },
          count: { $sum: 1 },
        },
      },
    ]);

    if (stats.length > 0) {
      const avg = Math.round(stats[0].averageRating * 10) / 10;
      await Product.findByIdAndUpdate(productId, {
        rating: avg,
        reviewCount: stats[0].count,
      });
    } else {
      await Product.findByIdAndUpdate(productId, {
        rating: 0,
        reviewCount: 0,
      });
    }
  }

  static async getProductReviews(productId: string) {
    const reviews = await Review.find({
      product: new mongoose.Types.ObjectId(productId),
      status: 'approved',
    }).sort({ createdAt: -1 });

    return reviews.map((r) => r.toJSON());
  }

  static async createReview(
    userId: string,
    userName: string,
    data: { productId: string; rating: number; title?: string; comment: string }
  ) {
    const product = await Product.findById(data.productId);
    if (!product) {
      throw ApiError.notFound('Product not found.');
    }

    // Check if user already reviewed this product
    const existing = await Review.findOne({
      user: new mongoose.Types.ObjectId(userId),
      product: new mongoose.Types.ObjectId(data.productId),
    });

    if (existing) {
      throw ApiError.conflict('You have already submitted a review for this product.');
    }

    // Verified purchase check: check if user has an order containing this product
    const purchasedOrder = await Order.findOne({
      user: new mongoose.Types.ObjectId(userId),
      'items.product': new mongoose.Types.ObjectId(data.productId),
      orderStatus: { $ne: ORDER_STATUS.CANCELLED },
    });

    const isVerifiedPurchase = !!purchasedOrder;

    const review = new Review({
      user: new mongoose.Types.ObjectId(userId),
      product: new mongoose.Types.ObjectId(data.productId),
      userName,
      rating: data.rating,
      title: data.title || '',
      comment: data.comment,
      verifiedPurchase: isVerifiedPurchase,
      status: 'approved',
    });

    await review.save();

    // Recalculate product rating
    await this.recalculateProductRating(data.productId);

    return review.toJSON();
  }

  static async updateReview(
    reviewId: string,
    userId: string,
    data: { rating?: number; title?: string; comment?: string }
  ) {
    const review = await Review.findById(reviewId);
    if (!review) {
      throw ApiError.notFound('Review not found.');
    }

    if (review.user.toString() !== userId) {
      throw ApiError.forbidden('You can only update your own reviews.');
    }

    if (data.rating !== undefined) review.rating = data.rating;
    if (data.title !== undefined) review.title = data.title;
    if (data.comment !== undefined) review.comment = data.comment;

    await review.save();
    await this.recalculateProductRating(review.product.toString());

    return review.toJSON();
  }

  static async deleteReview(reviewId: string, userId: string, isAdmin = false) {
    const review = await Review.findById(reviewId);
    if (!review) {
      throw ApiError.notFound('Review not found.');
    }

    if (!isAdmin && review.user.toString() !== userId) {
      throw ApiError.forbidden('You are not authorized to delete this review.');
    }

    const productId = review.product.toString();
    await Review.findByIdAndDelete(reviewId);
    await this.recalculateProductRating(productId);

    return { message: 'Review removed successfully.' };
  }
}


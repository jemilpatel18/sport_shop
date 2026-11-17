import mongoose from 'mongoose';
import { Wishlist, IWishlist } from '../models/Wishlist';
import { Product, IProduct } from '../models/Product';
import { ApiError } from '../utils/apiError';

export class WishlistService {
  private static async getOrCreateWishlist(userId: string): Promise<IWishlist> {
    let wishlist = await Wishlist.findOne({ user: new mongoose.Types.ObjectId(userId) });
    if (!wishlist) {
      wishlist = new Wishlist({
        user: new mongoose.Types.ObjectId(userId),
        products: [],
      });
      await wishlist.save();
    }
    return wishlist;
  }

  static async getWishlist(userId: string) {
    const wishlist = await this.getOrCreateWishlist(userId);
    await wishlist.populate({
      path: 'products',
      model: 'Product',
    });

    // Return the list of populated active products
    const products = (wishlist.products as unknown as IProduct[])
      .filter((p) => p && p.name)
      .map((p) => (p.toJSON ? p.toJSON() : p));

    return products;
  }

  static async addToWishlist(userId: string, productId: string) {
    const product = await Product.findById(productId);
    if (!product) {
      throw ApiError.notFound('Product not found.');
    }

    const wishlist = await this.getOrCreateWishlist(userId);
    const prodIdObj = new mongoose.Types.ObjectId(productId);

    const exists = wishlist.products.some(
      (p) => p.toString() === productId
    );

    if (!exists) {
      wishlist.products.push(prodIdObj as any);
      await wishlist.save();
    }

    return this.getWishlist(userId);
  }

  static async removeFromWishlist(userId: string, productId: string) {
    const wishlist = await this.getOrCreateWishlist(userId);
    wishlist.products = wishlist.products.filter(
      (p) => p.toString() !== productId
    ) as any;

    await wishlist.save();
    return this.getWishlist(userId);
  }
}


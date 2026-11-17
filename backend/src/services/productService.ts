import { Product, IProduct } from '../models/Product';
import { Category } from '../models/Category';
import { Brand } from '../models/Brand';
import { ApiError } from '../utils/apiError';
import { slugify, generateSKU } from '../utils/helpers';

export interface ProductFilterOptions {
  search?: string;
  category?: string;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  rating?: number;
  sizes?: string[];
  colors?: string[];
  inStock?: boolean;
  sort?: 'popular' | 'newest' | 'price-asc' | 'price-desc' | 'rating';
  page?: number;
  limit?: number;
  includeInactive?: boolean;
}

export class ProductService {
  static async getProducts(filters: ProductFilterOptions = {}) {
    const page = Math.max(1, filters.page || 1);
    const limit = Math.max(1, Math.min(100, filters.limit || 12));
    const skip = (page - 1) * limit;

    const query: any = {};

    if (!filters.includeInactive) {
      query.isActive = true;
    }

    // Search by text query
    if (filters.search && filters.search.trim() !== '') {
      const searchRegex = new RegExp(filters.search.trim(), 'i');
      query.$or = [
        { name: searchRegex },
        { brand: searchRegex },
        { category: searchRegex },
        { tags: searchRegex },
        { description: searchRegex },
      ];
    }

    // Category filter
    if (filters.category && filters.category.toLowerCase() !== 'all') {
      query.category = new RegExp(`^${filters.category}$`, 'i');
    }

    // Brand filter
    if (filters.brand && filters.brand.toLowerCase() !== 'all') {
      query.brand = new RegExp(`^${filters.brand}$`, 'i');
    }

    // Price range
    if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
      query.price = {};
      if (filters.minPrice !== undefined) query.price.$gte = filters.minPrice;
      if (filters.maxPrice !== undefined) query.price.$lte = filters.maxPrice;
    }

    // Rating filter
    if (filters.rating !== undefined && filters.rating > 0) {
      query.rating = { $gte: filters.rating };
    }

    // Sizes filter
    if (filters.sizes && filters.sizes.length > 0) {
      query.sizes = { $in: filters.sizes };
    }

    // In-stock filter
    if (filters.inStock === true) {
      query.stock = { $gt: 0 };
    }

    // Sorting
    let sortOptions: any = { createdAt: -1 };
    switch (filters.sort) {
      case 'price-asc':
        sortOptions = { price: 1 };
        break;
      case 'price-desc':
        sortOptions = { price: -1 };
        break;
      case 'popular':
        sortOptions = { reviewCount: -1, rating: -1 };
        break;
      case 'rating':
        sortOptions = { rating: -1 };
        break;
      case 'newest':
      default:
        sortOptions = { createdAt: -1 };
        break;
    }

    const [products, total] = await Promise.all([
      Product.find(query).sort(sortOptions).skip(skip).limit(limit),
      Product.countDocuments(query),
    ]);

    const totalPages = Math.ceil(total / limit) || 1;

    return {
      products: products.map((p) => p.toJSON()),
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    };
  }

  static async getProductById(id: string) {
    let product;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      product = await Product.findById(id);
    }
    if (!product) {
      product = await Product.findOne({ slug: id.toLowerCase() });
    }
    if (!product) {
      throw ApiError.notFound(`Product with identifier '${id}' not found.`);
    }
    return product.toJSON();
  }

  static async getProductBySlug(slug: string) {
    const product = await Product.findOne({ slug: slug.toLowerCase() });
    if (!product) {
      throw ApiError.notFound(`Product with slug '${slug}' not found.`);
    }
    return product.toJSON();
  }

  static async getFeaturedProducts(limit = 8) {
    const products = await Product.find({ isActive: true, isFeatured: true })
      .sort({ rating: -1, createdAt: -1 })
      .limit(limit);
    return products.map((p) => p.toJSON());
  }

  static async getBestSellers(limit = 8) {
    const products = await Product.find({ isActive: true, isBestSeller: true })
      .sort({ reviewCount: -1, rating: -1 })
      .limit(limit);
    return products.map((p) => p.toJSON());
  }

  static async getNewArrivals(limit = 8) {
    const products = await Product.find({ isActive: true, isNewArrival: true })
      .sort({ createdAt: -1 })
      .limit(limit);
    return products.map((p) => p.toJSON());
  }

  static async getRelatedProducts(productId: string, category: string, limit = 4) {
    const query: any = {
      isActive: true,
      category: new RegExp(`^${category}$`, 'i'),
    };
    if (productId.match(/^[0-9a-fA-F]{24}$/)) {
      query._id = { $ne: productId };
    }

    const products = await Product.find(query).limit(limit);
    return products.map((p) => p.toJSON());
  }

  static async createProduct(data: any) {
    let slug = slugify(data.name);
    // Ensure slug uniqueness
    const count = await Product.countDocuments({ slug: new RegExp(`^${slug}`) });
    if (count > 0) {
      slug = `${slug}-${count + 1}`;
    }

    const sku = data.sku || generateSKU(data.brand, data.category);

    const discount =
      data.discount ||
      (data.originalPrice > data.price
        ? Math.round(((data.originalPrice - data.price) / data.originalPrice) * 100)
        : 0);

    const product = new Product({
      ...data,
      slug,
      sku,
      discount,
    });

    await product.save();

    // Increment item count in Category and Brand
    await Promise.all([
      Category.findOneAndUpdate(
        { name: new RegExp(`^${data.category}$`, 'i') },
        { $inc: { itemCount: 1 } }
      ),
      Brand.findOneAndUpdate(
        { name: new RegExp(`^${data.brand}$`, 'i') },
        { $inc: { itemCount: 1 } }
      ),
    ]);

    return product.toJSON();
  }

  static async updateProduct(id: string, data: any) {
    const product = await Product.findById(id);
    if (!product) {
      throw ApiError.notFound('Product not found.');
    }

    if (data.name && data.name !== product.name) {
      data.slug = slugify(data.name);
    }

    if (data.originalPrice !== undefined || data.price !== undefined) {
      const orig = data.originalPrice !== undefined ? data.originalPrice : product.originalPrice;
      const curr = data.price !== undefined ? data.price : product.price;
      if (orig > curr) {
        data.discount = Math.round(((orig - curr) / orig) * 100);
      }
    }

    Object.assign(product, data);
    await product.save();

    return product.toJSON();
  }

  static async deleteProduct(id: string) {
    const product = await Product.findByIdAndDelete(id);
    if (!product) {
      throw ApiError.notFound('Product not found.');
    }

    // Decrement item count in Category and Brand
    await Promise.all([
      Category.findOneAndUpdate(
        { name: new RegExp(`^${product.category}$`, 'i') },
        { $inc: { itemCount: -1 } }
      ),
      Brand.findOneAndUpdate(
        { name: new RegExp(`^${product.brand}$`, 'i') },
        { $inc: { itemCount: -1 } }
      ),
    ]);

    return { message: 'Product deleted successfully.' };
  }
}


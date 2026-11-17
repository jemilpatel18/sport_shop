import mongoose, { Schema, Document } from 'mongoose';

export interface IProductColor {
  name: string;
  hex: string;
}

export interface IProduct extends Document {
  name: string;
  slug: string;
  sku: string;
  description: string;
  brand: string;
  category: string;
  subcategory?: string;
  images: string[];
  originalPrice: number;
  price: number;
  discount: number;
  sizes: string[];
  colors: IProductColor[];
  stock: number;
  inStock: boolean;
  specifications: Record<string, string>;
  features: string[];
  rating: number;
  reviewCount: number;
  isFeatured: boolean;
  isNewArrival: boolean;
  isBestSeller: boolean;
  isActive: boolean;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

const ProductColorSchema = new Schema<IProductColor>(
  {
    name: { type: String, required: true },
    hex: { type: String, required: true },
  },
  { _id: false }
);

const ProductSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true, trim: true, index: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    sku: { type: String, required: true, unique: true, uppercase: true, trim: true, index: true },
    description: { type: String, required: true },
    brand: { type: String, required: true, index: true },
    category: { type: String, required: true, index: true },
    subcategory: { type: String },
    images: { type: [String], default: [] },
    originalPrice: { type: Number, required: true, min: 0 },
    price: { type: Number, required: true, min: 0, index: true },
    discount: { type: Number, default: 0, min: 0, max: 100 },
    sizes: { type: [String], default: [] },
    colors: { type: [ProductColorSchema], default: [] },
    stock: { type: Number, required: true, default: 0, min: 0, index: true },
    specifications: { type: Map, of: String, default: {} },
    features: { type: [String], default: [] },
    rating: { type: Number, default: 0, min: 0, max: 5, index: true },
    reviewCount: { type: Number, default: 0, min: 0 },
    isFeatured: { type: Boolean, default: false, index: true },
    isNewArrival: { type: Boolean, default: false, index: true },
    isBestSeller: { type: Boolean, default: false, index: true },
    isActive: { type: Boolean, default: true, index: true },
    tags: { type: [String], default: [] },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret: any) => {
        ret.id = ret._id.toString();
        // Return specifications as plain object
        if (ret.specifications instanceof Map) {
          ret.specifications = Object.fromEntries(ret.specifications);
        }
        ret.inStock = (ret.stock ?? 0) > 0;
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Virtual for inStock
ProductSchema.virtual('inStock').get(function (this: IProduct) {
  return this.stock > 0;
});

// Text index for search across name, description, brand, category, tags
ProductSchema.index({
  name: 'text',
  description: 'text',
  brand: 'text',
  category: 'text',
  tags: 'text',
});

// Calculate discount if not provided
ProductSchema.pre<IProduct>('save', function (next) {
  if (this.originalPrice > 0 && this.price > 0 && this.originalPrice > this.price) {
    this.discount = Math.round(((this.originalPrice - this.price) / this.originalPrice) * 100);
  }
  next();
});

export const Product = mongoose.model<IProduct>('Product', ProductSchema);
export default Product;


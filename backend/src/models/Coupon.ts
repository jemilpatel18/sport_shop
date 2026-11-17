import mongoose, { Schema, Document } from 'mongoose';

export interface ICoupon extends Document {
  code: string;
  discountType: 'percentage' | 'fixed';
  discountPercentage: number;
  discountValue?: number;
  maxDiscount?: number;
  minOrderValue: number;
  startDate: Date;
  expiryDate: Date;
  usageLimit?: number;
  usedCount: number;
  perUserLimit: number;
  usedBy: mongoose.Types.ObjectId[];
  isActive: boolean;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

const CouponSchema = new Schema<ICoupon>(
  {
    code: { type: String, required: true, unique: true, uppercase: true, trim: true, index: true },
    discountType: { type: String, enum: ['percentage', 'fixed'], default: 'percentage' },
    discountPercentage: { type: Number, required: true, min: 1, max: 100 },
    discountValue: { type: Number },
    maxDiscount: { type: Number },
    minOrderValue: { type: Number, default: 0, min: 0 },
    startDate: { type: Date, default: Date.now },
    expiryDate: { type: Date, required: true },
    usageLimit: { type: Number },
    usedCount: { type: Number, default: 0 },
    perUserLimit: { type: Number, default: 1 },
    usedBy: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    isActive: { type: Boolean, default: true, index: true },
    description: { type: String },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret: any) => {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

export const Coupon = mongoose.model<ICoupon>('Coupon', CouponSchema);
export default Coupon;


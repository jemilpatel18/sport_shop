import mongoose, { Schema, Document } from 'mongoose';

export interface IBrand extends Document {
  name: string;
  slug: string;
  logo: string;
  description: string;
  status: 'active' | 'inactive';
  itemCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const BrandSchema = new Schema<IBrand>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    logo: { type: String, default: '' },
    description: { type: String, default: '' },
    status: { type: String, enum: ['active', 'inactive'], default: 'active', index: true },
    itemCount: { type: Number, default: 0 },
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

export const Brand = mongoose.model<IBrand>('Brand', BrandSchema);
export default Brand;


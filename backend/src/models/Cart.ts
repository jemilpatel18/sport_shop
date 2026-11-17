import mongoose, { Schema, Document } from 'mongoose';
import { IProduct } from './Product';

export interface ICartItem {
  id?: string;
  product: mongoose.Types.ObjectId | IProduct;
  size?: string;
  color?: string;
  quantity: number;
}

export interface ICart extends Document {
  user?: mongoose.Types.ObjectId;
  guestId?: string;
  items: ICartItem[];
  couponCode?: string;
  createdAt: Date;
  updatedAt: Date;
}

const CartItemSchema = new Schema<ICartItem>(
  {
    product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    size: { type: String, default: '' },
    color: { type: String, default: '' },
    quantity: { type: Number, required: true, min: 1, default: 1 },
  },
  {
    _id: true,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret: any) => {
        ret.id = ret._id ? ret._id.toString() : ret.id;
        delete ret._id;
        return ret;
      },
    },
  }
);

const CartSchema = new Schema<ICart>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', index: true },
    guestId: { type: String, index: true },
    items: [CartItemSchema],
    couponCode: { type: String, trim: true },
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

export const Cart = mongoose.model<ICart>('Cart', CartSchema);
export default Cart;


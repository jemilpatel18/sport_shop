import mongoose, { Schema, Document } from 'mongoose';
import { IProduct } from './Product';

export interface IWishlist extends Document {
  user: mongoose.Types.ObjectId;
  products: (mongoose.Types.ObjectId | IProduct)[];
  createdAt: Date;
  updatedAt: Date;
}

const WishlistSchema = new Schema<IWishlist>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
    products: [{ type: Schema.Types.ObjectId, ref: 'Product' }],
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

export const Wishlist = mongoose.model<IWishlist>('Wishlist', WishlistSchema);
export default Wishlist;


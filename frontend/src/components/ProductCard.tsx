'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Heart, ShoppingCart, Eye } from 'lucide-react';
import { Product } from '@/types';
import { formatPrice, calculateDiscount } from '@/lib/utils';
import { useCartStore } from '@/stores/cartStore';
import { useWishlistStore } from '@/stores/wishlistStore';
import { toast } from '@/stores/uiStore';
import RatingStars from './RatingStars';

export default function ProductCard({ product }: { product: Product }) {
  const addItem = useCartStore((s) => s.addItem);
  const toggleWishlist = useWishlistStore((s) => s.toggle);
  const inWishlist = useWishlistStore((s) => s.has(product.id));

  const discount = product.discount || calculateDiscount(product.originalPrice, product.price);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product);
    toast.success(`${product.name} added to cart`);
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product);
    toast.success(inWishlist ? 'Removed from wishlist' : 'Added to wishlist');
  };

  return (
    <Link
      href={`/product/${product.slug || product.id}`}
      className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300 flex flex-col"
    >
      {/* Image */}
      <div className="relative aspect-square bg-brand-gray overflow-hidden">
        <Image
          src={product.images?.[0] || 'https://images.unsplash.com/photo-1517649763962-0c623066013b?q=80&w=800&auto=format&fit=crop'}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {discount > 0 && (
            <span className="bg-brand-lime text-brand-charcoal text-[11px] font-bold px-2 py-0.5 rounded-full">
              -{discount}%
            </span>
          )}
          {product.isNewArrival && (
            <span className="bg-brand-charcoal text-brand-lime text-[11px] font-bold px-2 py-0.5 rounded-full">
              NEW
            </span>
          )}
        </div>
        {/* Hover actions */}
        <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <button
            onClick={handleWishlist}
            className={`w-9 h-9 rounded-full flex items-center justify-center shadow-md transition-colors ${
              inWishlist ? 'bg-brand-lime text-brand-charcoal' : 'bg-white text-gray-600 hover:text-red-500'
            }`}
            aria-label="Toggle wishlist"
          >
            <Heart className={`w-4 h-4 ${inWishlist ? 'fill-current' : ''}`} />
          </button>
          <Link
            href={`/product/${product.slug || product.id}`}
            className="w-9 h-9 rounded-full bg-white text-gray-600 hover:text-brand-charcoal flex items-center justify-center shadow-md"
            aria-label="Quick view"
            onClick={(e) => e.stopPropagation()}
          >
            <Eye className="w-4 h-4" />
          </Link>
        </div>
        {/* Quick add bar */}
        <div className="absolute bottom-0 inset-x-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
          <button
            onClick={handleAddToCart}
            className="w-full bg-brand-charcoal text-white text-sm font-semibold py-2.5 flex items-center justify-center gap-2 hover:bg-brand-lime hover:text-brand-charcoal transition-colors"
          >
            <ShoppingCart className="w-4 h-4" />
            ADD TO CART
          </button>
        </div>
      </div>

      {/* Info */}
      <div className="p-4 flex flex-col flex-1">
        <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">{product.brand}</p>
        <h3 className="font-semibold text-sm text-brand-charcoal mt-0.5 line-clamp-2 group-hover:text-brand-charcoal min-h-[2.5rem]">
          {product.name}
        </h3>
        <RatingStars rating={product.rating} count={product.reviewCount} className="mt-1.5" />
        <div className="flex items-baseline gap-2 mt-2">
          <span className="text-lg font-bold text-brand-charcoal">{formatPrice(product.price)}</span>
          {product.originalPrice > product.price && (
            <span className="text-sm text-gray-400 line-through">{formatPrice(product.originalPrice)}</span>
          )}
        </div>
        {!product.inStock && (
          <span className="mt-2 text-[11px] font-semibold text-red-500 uppercase tracking-wide">Out of stock</span>
        )}
      </div>
    </Link>
  );
}

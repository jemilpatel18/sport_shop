'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useQuery } from '@tanstack/react-query';
import { Heart, ShoppingCart, Trash2 } from 'lucide-react';
import { useWishlistStore } from '@/stores/wishlistStore';
import { productService } from '@/services/productService';
import { Product } from '@/types';
import { formatPrice } from '@/lib/utils';
import RatingStars from '@/components/RatingStars';
import EmptyState from '@/components/EmptyState';
import Spinner from '@/components/Spinner';
import { toast } from '@/stores/uiStore';
import { useCartStore } from '@/stores/cartStore';

export default function WishlistPage() {
  const { productIds, cache, toggle, init } = useWishlistStore();
  const addItem = useCartStore((s) => s.addItem);

  useEffect(() => {
    init();
  }, [init]);

  // Fetch products not in cache
  const { data: fetched = [], isLoading } = useQuery<Product[]>({
    queryKey: ['wishlist-products', productIds],
    queryFn: async () => {
      const results = await Promise.all(
        productIds
          .filter((id) => !cache[id])
          .map((id) => productService.getProductById(id).catch(() => null))
      );
      return results.filter((p): p is Product => !!p);
    },
    enabled: productIds.length > 0,
  });

  const products = productIds
    .map((id) => cache[id] || fetched.find((p) => p.id === id))
    .filter((p): p is Product => !!p);

  if (isLoading) {
    return <div className="flex justify-center py-32"><Spinner className="w-10 h-10" /></div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display text-3xl md:text-4xl font-bold text-brand-charcoal uppercase">
          My Wishlist <span className="text-brand-lime">({products.length})</span>
        </h1>
        <Link href="/shop" className="text-sm font-bold text-brand-charcoal hover:text-brand-lime-hover">
          Continue Shopping →
        </Link>
      </div>

      {products.length === 0 ? (
        <EmptyState
          title="Your wishlist is empty"
          description="Save products you love by tapping the heart icon."
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {products.map((p) => (
            <div key={p.id} className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-card-hover transition-all">
              <Link href={`/product/${p.slug || p.id}`} className="relative block aspect-square bg-brand-gray">
                <Image
                  src={p.images?.[0]}
                  alt={p.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  sizes="(max-width: 640px) 100vw, 25vw"
                />
                <button
                  onClick={(e) => { e.preventDefault(); toggle(p); toast.success('Removed from wishlist'); }}
                  className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white shadow-md flex items-center justify-center text-red-500 hover:bg-red-50"
                  aria-label="Remove"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </Link>
              <div className="p-4">
                <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">{p.brand}</p>
                <Link href={`/product/${p.slug || p.id}`} className="font-semibold text-sm line-clamp-2 mt-0.5 block min-h-[2.5rem]">{p.name}</Link>
                <RatingStars rating={p.rating} count={p.reviewCount} className="mt-1.5" />
                <div className="flex items-baseline gap-2 mt-2">
                  <span className="text-lg font-bold">{formatPrice(p.price)}</span>
                  {p.originalPrice > p.price && <span className="text-sm text-gray-400 line-through">{formatPrice(p.originalPrice)}</span>}
                </div>
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => { addItem(p); toast.success('Added to cart'); }}
                    disabled={!p.inStock}
                    className="flex-1 py-2.5 bg-brand-charcoal text-white text-xs font-bold rounded-xl hover:bg-brand-dark transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
                  >
                    <ShoppingCart className="w-3.5 h-3.5" /> ADD TO CART
                  </button>
                  <Link
                    href={`/product/${p.slug || p.id}`}
                    className="px-3 py-2.5 border border-gray-200 rounded-xl hover:border-brand-lime transition-colors"
                    aria-label="View"
                  >
                    <Heart className="w-4 h-4 text-brand-lime fill-brand-lime" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

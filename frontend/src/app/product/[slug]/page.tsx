'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import Image from 'next/image';
import {
  Heart, ShoppingCart, Truck, ShieldCheck, RotateCcw, Minus, Plus,
  ChevronRight, Star, Check, Zap,
} from 'lucide-react';
import { productService } from '@/services/productService';
import { reviewService } from '@/services/reviewService';
import { Product, Review } from '@/types';
import { formatPrice, formatDate, calculateDiscount } from '@/lib/utils';
import { useCartStore } from '@/stores/cartStore';
import { useWishlistStore } from '@/stores/wishlistStore';
import { useAuthStore } from '@/stores/authStore';
import { toast } from '@/stores/uiStore';
import RatingStars from '@/components/RatingStars';
import ProductCard from '@/components/ProductCard';
import Spinner from '@/components/Spinner';
import EmptyState from '@/components/EmptyState';

export default function ProductDetailsPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const addItem = useCartStore((s) => s.addItem);
  const toggleWishlist = useWishlistStore((s) => s.toggle);
  const inWishlist = useWishlistStore((s) => s.has);
  const user = useAuthStore((s) => s.user);

  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string | undefined>();
  const [selectedColor, setSelectedColor] = useState<string | undefined>();
  const [quantity, setQuantity] = useState(1);
  const [reviewForm, setReviewForm] = useState({ rating: 5, title: '', comment: '' });
  const [submittingReview, setSubmittingReview] = useState(false);

  const { data: product, isLoading } = useQuery<Product | null>({
    queryKey: ['product', slug],
    queryFn: () => productService.getProductBySlug(slug),
  });

  const { data: reviews = [] } = useQuery<Review[]>({
    queryKey: ['reviews', product?.id],
    queryFn: () => reviewService.getProductReviews(product!.id),
    enabled: !!product?.id,
  });

  const { data: related = [] } = useQuery<Product[]>({
    queryKey: ['related', product?.id, product?.category],
    queryFn: () => productService.getRelatedProducts(product!.id, product!.category),
    enabled: !!product?.id,
  });

  useEffect(() => {
    setSelectedImage(0);
    setSelectedSize(undefined);
    setSelectedColor(undefined);
    setQuantity(1);
  }, [slug]);

  if (isLoading) {
    return <div className="flex justify-center py-32"><Spinner className="w-12 h-12" /></div>;
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24">
        <EmptyState title="Product not found" description="The product you're looking for doesn't exist or has been removed." />
        <div className="text-center mt-6">
          <Link href="/shop" className="inline-flex items-center gap-2 px-6 py-3 bg-brand-charcoal text-white font-bold rounded-xl">
            Continue Shopping <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  const discount = product.discount || calculateDiscount(product.originalPrice, product.price);
  const images = product.images?.length ? product.images : ['https://images.unsplash.com/photo-1517649763962-0c623066013b?q=80&w=1000&auto=format&fit=crop'];
  const avgRating = reviews.length
    ? reviews.reduce((a, r) => a + r.rating, 0) / reviews.length
    : product.rating;

  const handleAddToCart = () => {
    if (product.sizes?.length && !selectedSize) {
      toast.error('Please select a size');
      return;
    }
    addItem(product, selectedSize, selectedColor, quantity);
    toast.success(`${product.name} added to cart`);
  };

  const handleBuyNow = () => {
    handleAddToCart();
    router.push('/checkout');
  };

  const handleWishlist = () => {
    toggleWishlist(product);
    toast.success(inWishlist(product.id) ? 'Removed from wishlist' : 'Added to wishlist');
  };

  const submitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error('Please login to write a review');
      router.push('/login');
      return;
    }
    if (reviewForm.comment.trim().length < 3) {
      toast.error('Please write a review comment');
      return;
    }
    setSubmittingReview(true);
    try {
      await reviewService.createReview({
        productId: product.id,
        rating: reviewForm.rating,
        title: reviewForm.title,
        comment: reviewForm.comment,
      });
      toast.success('Review submitted!');
      setReviewForm({ rating: 5, title: '', comment: '' });
      queryClient.invalidateQueries({ queryKey: ['reviews', product.id] });
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs text-gray-500 mb-6 flex-wrap">
        <Link href="/" className="hover:text-brand-charcoal">Home</Link>
        <ChevronRight className="w-3 h-3" />
        <Link href="/shop" className="hover:text-brand-charcoal">Shop</Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-brand-charcoal font-medium truncate max-w-[200px]">{product.name}</span>
      </nav>

      <div className="grid lg:grid-cols-2 gap-10 lg:gap-16">
        {/* Gallery */}
        <div>
          <div className="relative aspect-square bg-brand-gray rounded-2xl overflow-hidden">
            <Image
              src={images[selectedImage]}
              alt={product.name}
              fill
              priority
              className="object-cover"
            />
            {discount > 0 && (
              <span className="absolute top-4 left-4 bg-brand-lime text-brand-charcoal font-bold text-sm px-3 py-1 rounded-full">
                -{discount}% OFF
              </span>
            )}
          </div>
          {images.length > 1 && (
            <div className="flex gap-3 mt-4 overflow-x-auto pb-2">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  className={`relative w-20 h-20 rounded-xl overflow-hidden shrink-0 border-2 transition-colors ${
                    i === selectedImage ? 'border-brand-lime' : 'border-transparent hover:border-gray-300'
                  }`}
                >
                  <Image src={img} alt={`${product.name} ${i + 1}`} fill className="object-cover" sizes="80px" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-gray-400">{product.brand} · SKU: {product.id.toUpperCase()}</p>
          <h1 className="font-display text-3xl md:text-4xl font-bold text-brand-charcoal mt-2 leading-tight">{product.name}</h1>

          <div className="flex items-center gap-3 mt-3">
            <RatingStars rating={avgRating} showValue />
            <span className="text-sm text-gray-400">·</span>
            <span className="text-sm text-gray-500">{reviews.length || product.reviewCount} reviews</span>
            {product.inStock ? (
              <span className="flex items-center gap-1 text-sm font-semibold text-green-600">
                <Check className="w-4 h-4" /> In Stock
              </span>
            ) : (
              <span className="text-sm font-semibold text-red-500">Out of Stock</span>
            )}
          </div>

          <div className="flex items-baseline gap-3 mt-5">
            <span className="text-3xl md:text-4xl font-bold text-brand-charcoal">{formatPrice(product.price)}</span>
            {product.originalPrice > product.price && (
              <>
                <span className="text-xl text-gray-400 line-through">{formatPrice(product.originalPrice)}</span>
                <span className="bg-red-100 text-red-600 text-sm font-bold px-2.5 py-1 rounded-full">Save {formatPrice(product.originalPrice - product.price)}</span>
              </>
            )}
          </div>

          <p className="text-sm text-gray-600 leading-relaxed mt-5">{product.description}</p>

          {/* Sizes */}
          {product.sizes && product.sizes.length > 0 && (
            <div className="mt-6">
              <p className="text-sm font-bold text-brand-charcoal mb-2">Size {selectedSize && <span className="text-gray-400 font-normal">— {selectedSize}</span>}</p>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((s) => (
                  <button
                    key={s}
                    onClick={() => setSelectedSize(selectedSize === s ? undefined : s)}
                    className={`px-4 py-2 text-sm font-semibold rounded-xl border-2 transition-colors ${
                      selectedSize === s ? 'border-brand-charcoal bg-brand-charcoal text-brand-lime' : 'border-gray-200 hover:border-brand-charcoal'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Colors */}
          {product.colors && product.colors.length > 0 && (
            <div className="mt-6">
              <p className="text-sm font-bold text-brand-charcoal mb-2">Color {selectedColor && <span className="text-gray-400 font-normal">— {selectedColor}</span>}</p>
              <div className="flex flex-wrap gap-2">
                {product.colors.map((c) => (
                  <button
                    key={c.name}
                    title={c.name}
                    onClick={() => setSelectedColor(selectedColor === c.name ? undefined : c.name)}
                    className={`w-9 h-9 rounded-full border-2 transition-all flex items-center justify-center ${
                      selectedColor === c.name ? 'border-brand-charcoal scale-110' : 'border-gray-200 hover:border-gray-400'
                    }`}
                    style={{ backgroundColor: c.hex }}
                  >
                    {selectedColor === c.name && <Check className="w-4 h-4 text-white drop-shadow" />}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity + actions */}
          <div className="flex items-center gap-4 mt-8">
            <div className="flex items-center border border-gray-200 rounded-xl">
              <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="p-3 hover:bg-brand-gray rounded-l-xl" disabled={!product.inStock}>
                <Minus className="w-4 h-4" />
              </button>
              <span className="w-12 text-center font-bold">{quantity}</span>
              <button onClick={() => setQuantity(Math.min(product.stock || 99, quantity + 1))} className="p-3 hover:bg-brand-gray rounded-r-xl" disabled={!product.inStock}>
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <button
              onClick={handleWishlist}
              className={`w-12 h-12 rounded-xl border-2 flex items-center justify-center transition-colors ${
                inWishlist(product.id) ? 'border-brand-lime bg-brand-lime/10' : 'border-gray-200 hover:border-brand-lime'
              }`}
              aria-label="Wishlist"
            >
              <Heart className={`w-5 h-5 ${inWishlist(product.id) ? 'fill-brand-lime text-brand-lime' : 'text-gray-500'}`} />
            </button>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 mt-4">
            <button
              onClick={handleAddToCart}
              disabled={!product.inStock}
              className="flex-1 py-4 bg-brand-charcoal text-white font-bold text-sm uppercase tracking-wider rounded-xl hover:bg-brand-dark transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ShoppingCart className="w-5 h-5" /> Add To Cart
            </button>
            <button
              onClick={handleBuyNow}
              disabled={!product.inStock}
              className="flex-1 py-4 bg-brand-lime text-brand-charcoal font-bold text-sm uppercase tracking-wider rounded-xl hover:bg-brand-lime-hover transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Zap className="w-5 h-5" /> Buy Now
            </button>
          </div>

          {/* Trust badges */}
          <div className="grid grid-cols-3 gap-3 mt-8 pt-6 border-t border-gray-100">
            {[
              { icon: Truck, label: 'Free Shipping $100+' },
              { icon: ShieldCheck, label: 'Secure Payment' },
              { icon: RotateCcw, label: '30-Day Returns' },
            ].map((b) => (
              <div key={b.label} className="flex flex-col items-center text-center gap-1.5">
                <b.icon className="w-6 h-6 text-brand-lime" />
                <span className="text-[11px] font-semibold text-gray-500">{b.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Specs & description */}
      <div className="mt-16 grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {product.features && product.features.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h2 className="font-display text-xl font-bold text-brand-charcoal uppercase mb-4">Key Features</h2>
              <ul className="grid sm:grid-cols-2 gap-2.5">
                {product.features.map((f, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                    <Check className="w-4 h-4 text-brand-lime mt-0.5 shrink-0" /> {f}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {product.specifications && Object.keys(product.specifications).length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h2 className="font-display text-xl font-bold text-brand-charcoal uppercase mb-4">Specifications</h2>
              <div className="divide-y divide-gray-100">
                {Object.entries(product.specifications).map(([k, v]) => (
                  <div key={k} className="flex justify-between py-2.5 text-sm">
                    <span className="text-gray-500 font-medium">{k}</span>
                    <span className="text-brand-charcoal font-semibold">{v}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          {/* Delivery info */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h2 className="font-display text-xl font-bold text-brand-charcoal uppercase mb-4">Delivery Details</h2>
            <ul className="space-y-2.5 text-sm text-gray-600">
              <li className="flex items-center gap-2"><Truck className="w-4 h-4 text-brand-lime" /> Standard delivery in 3-5 business days</li>
              <li className="flex items-center gap-2"><Truck className="w-4 h-4 text-brand-lime" /> Express delivery available at checkout</li>
              <li className="flex items-center gap-2"><RotateCcw className="w-4 h-4 text-brand-lime" /> Free returns within 30 days of delivery</li>
            </ul>
          </div>
        </div>

        {/* Reviews */}
        <div>
          <div className="bg-white rounded-2xl border border-gray-100 p-6 sticky top-24">
            <h2 className="font-display text-xl font-bold text-brand-charcoal uppercase mb-4">Reviews</h2>
            <div className="flex items-center gap-3 mb-5">
              <span className="text-4xl font-bold text-brand-charcoal">{avgRating.toFixed(1)}</span>
              <div>
                <RatingStars rating={avgRating} />
                <p className="text-xs text-gray-500 mt-0.5">{reviews.length} review{reviews.length !== 1 ? 's' : ''}</p>
              </div>
            </div>

            {/* Review list */}
            <div className="space-y-4 max-h-72 overflow-y-auto mb-6">
              {reviews.length === 0 && <p className="text-sm text-gray-400">No reviews yet. Be the first to review!</p>}
              {reviews.map((r) => (
                <div key={r.id} className="border-b border-gray-50 pb-3 last:border-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-brand-lime/20 flex items-center justify-center text-xs font-bold text-brand-charcoal">
                        {r.userName?.[0] || 'U'}
                      </div>
                      <span className="text-sm font-semibold">{r.userName}</span>
                    </div>
                    <RatingStars rating={r.rating} size="xs" />
                  </div>
                  {r.title && <p className="text-sm font-bold mt-1.5">{r.title}</p>}
                  <p className="text-sm text-gray-600 mt-0.5">{r.comment}</p>
                  <p className="text-[11px] text-gray-400 mt-1">{formatDate(r.createdAt)}</p>
                </div>
              ))}
            </div>

            {/* Review form */}
            <form onSubmit={submitReview} className="border-t border-gray-100 pt-4 space-y-3">
              <p className="text-sm font-bold text-brand-charcoal">Write a Review</p>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button type="button" key={star} onClick={() => setReviewForm({ ...reviewForm, rating: star })}>
                    <Star className={`w-6 h-6 ${star <= reviewForm.rating ? 'fill-brand-lime text-brand-lime' : 'text-gray-300'}`} />
                  </button>
                ))}
              </div>
              <input
                value={reviewForm.title}
                onChange={(e) => setReviewForm({ ...reviewForm, title: e.target.value })}
                placeholder="Review title (optional)"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-lime"
              />
              <textarea
                value={reviewForm.comment}
                onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                placeholder="Share your experience…"
                rows={3}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-lime resize-none"
              />
              <button
                type="submit"
                disabled={submittingReview}
                className="w-full py-2.5 bg-brand-charcoal text-white text-sm font-bold rounded-xl hover:bg-brand-dark transition-colors disabled:opacity-50"
              >
                {submittingReview ? 'Submitting…' : 'Submit Review'}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Related products */}
      {related.length > 0 && (
        <div className="mt-16">
          <h2 className="font-display text-2xl md:text-3xl font-bold text-brand-charcoal uppercase mb-8">You May Also Like</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {related.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </div>
      )}
    </div>
  );
}

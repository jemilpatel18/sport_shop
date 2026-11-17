'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  ArrowRight, ShieldCheck, Truck, Award, Lock, ChevronRight,
  Star, Quote, Dumbbell, Trophy, Zap,
} from 'lucide-react';
import { productService } from '@/services/productService';
import { categoryService } from '@/services/categoryService';
import { brandService } from '@/services/brandService';
import ProductCard from '@/components/ProductCard';
import SectionHeading from '@/components/SectionHeading';
import Spinner from '@/components/Spinner';
import EmptyState from '@/components/EmptyState';
import { Category, Brand } from '@/types';

const trustItems = [
  { icon: Award, title: 'Premium Quality', desc: 'Top-tier gear from trusted brands' },
  { icon: ShieldCheck, title: 'Authentic Products', desc: '100% genuine, verified merchandise' },
  { icon: Lock, title: 'Secure Payments', desc: 'Encrypted & safe checkout' },
  { icon: Truck, title: 'Fast Delivery', desc: 'Quick dispatch on every order' },
];

const testimonials = [
  {
    name: 'Marcus Reid',
    role: 'Marathon Runner',
    rating: 5,
    text: 'The running shoes I picked up here took my personal best to the next level. Gear quality is unmatched.',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200&auto=format&fit=crop',
  },
  {
    name: 'Priya Sharma',
    role: 'Badminton Pro',
    rating: 5,
    text: 'Ordered a Yonex racket set. Packaging was premium and delivery was faster than expected. Will definitely reorder.',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&auto=format&fit=crop',
  },
  {
    name: 'Diego Alvarez',
    role: 'Football Coach',
    rating: 4,
    text: 'Stocked our entire academy with football boots from SPORTZONE. Great bulk pricing and authentic products.',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=200&auto=format&fit=crop',
  },
];

const galleryImages = [
  'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?q=80&w=1200&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=1200&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?q=80&w=1200&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=1200&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?q=80&w=1200&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?q=80&w=1200&auto=format&fit=crop',
  '/images/volleyball.jpg',
];

export default function HomePage() {
  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: () => categoryService.getCategories(),
  });
  const { data: brands = [] } = useQuery<Brand[]>({
    queryKey: ['brands'],
    queryFn: () => brandService.getBrands(),
  });
  const { data: bestSellers, isLoading: loadingBest } = useQuery({
    queryKey: ['best-sellers'],
    queryFn: () => productService.getBestSellers(),
  });
  const { data: newArrivals, isLoading: loadingNew } = useQuery({
    queryKey: ['new-arrivals'],
    queryFn: () => productService.getNewArrivals(),
  });

  const featuredCategories = categories.slice(0, 9);

  return (
    <div>
      {/* A. Announcement handled in layout */}

      {/* C. Hero */}
      <section className="relative bg-brand-charcoal overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1461896836934-ffe607ba8211?q=80&w=2000&auto=format&fit=crop"
            alt="Athletes training"
            fill
            priority
            className="object-cover opacity-50"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-brand-charcoal via-brand-charcoal/80 to-transparent" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-36 lg:py-44">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="max-w-2xl"
          >
            <span className="inline-flex items-center gap-2 bg-brand-lime/10 border border-brand-lime/30 text-brand-lime text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full mb-6">
              <Trophy className="w-3.5 h-3.5" /> The Ultimate Sports Store
            </span>
            <h1 className="font-display text-5xl md:text-7xl font-bold text-white uppercase leading-[0.95] tracking-tight">
              Gear Up.<br />
              Play <span className="text-brand-lime">Hard.</span><br />
              Win <span className="text-brand-lime">Big.</span>
            </h1>
            <p className="mt-6 text-gray-300 text-base md:text-lg max-w-lg leading-relaxed">
              Discover premium sports equipment, footwear, clothing and accessories for every athlete.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/shop"
                className="px-8 py-4 bg-brand-lime text-brand-charcoal font-bold text-sm uppercase tracking-wider rounded-xl hover:bg-brand-lime-hover transition-all hover:shadow-lime-glow flex items-center gap-2"
              >
                Shop Now <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/shop?sort=newest"
                className="px-8 py-4 border-2 border-white/30 text-white font-bold text-sm uppercase tracking-wider rounded-xl hover:border-brand-lime hover:text-brand-lime transition-all"
              >
                Explore Collection
              </Link>
            </div>
          </motion.div>
        </div>
        {/* Stats strip */}
        <div className="relative border-t border-white/10 bg-brand-charcoal/60 backdrop-blur">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 grid grid-cols-3 gap-4 text-center">
            {[
              { value: '10K+', label: 'Products' },
              { value: '50+', label: 'Top Brands' },
              { value: '4.8★', label: 'Customer Rating' },
            ].map((s) => (
              <div key={s.label}>
                <p className="font-display text-2xl md:text-3xl font-bold text-brand-lime">{s.value}</p>
                <p className="text-xs text-gray-400 uppercase tracking-wider mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* D. Trust Section */}
      <section className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 grid grid-cols-2 lg:grid-cols-4 gap-6">
          {trustItems.map((item, i) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="flex items-center gap-4"
            >
              <div className="w-12 h-12 rounded-xl bg-brand-lime/15 flex items-center justify-center shrink-0">
                <item.icon className="w-6 h-6 text-brand-charcoal" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-brand-charcoal">{item.title}</h3>
                <p className="text-xs text-gray-500 mt-0.5">{item.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* E. Shop By Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
        <SectionHeading eyebrow="Categories" title="Shop By Sport" subtitle="Find the perfect gear for your game" />
        {featuredCategories.length === 0 ? (
          <Spinner className="mx-auto" />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {featuredCategories.map((cat, i) => (
              <motion.div
                key={cat.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
              >
                <Link
                  href={`/category/${cat.slug}`}
                  className="group relative aspect-[4/5] rounded-2xl overflow-hidden block"
                >
                  <Image
                    src={cat.image || 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?q=80&w=800&auto=format&fit=crop'}
                    alt={cat.name}
                    fill
                    sizes="(max-width: 640px) 50vw, 25vw"
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-brand-charcoal/90 via-brand-charcoal/30 to-transparent" />
                  <div className="absolute bottom-0 inset-x-0 p-4">
                    <h3 className="font-display text-lg font-bold text-white uppercase">{cat.name}</h3>
                    <p className="text-xs text-gray-300 mt-0.5">{cat.itemCount ?? ''} items</p>
                    <span className="inline-flex items-center gap-1 text-brand-lime text-xs font-bold mt-2 uppercase tracking-wider">
                      Shop Now <ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </section>

      {/* F. Best Selling Products */}
      <section className="bg-brand-gray py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-10">
            <SectionHeading eyebrow="Top Rated" title="Best Sellers" align="left" />
            <Link href="/shop?sort=popular" className="hidden md:inline-flex items-center gap-1 text-sm font-bold text-brand-charcoal hover:text-brand-lime-hover uppercase tracking-wider">
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          {loadingBest ? (
            <div className="flex justify-center py-12"><Spinner /></div>
          ) : bestSellers && bestSellers.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {bestSellers.slice(0, 8).map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          ) : (
            <EmptyState title="No best sellers yet" />
          )}
          <div className="mt-8 text-center md:hidden">
            <Link href="/shop?sort=popular" className="inline-flex items-center gap-1 text-sm font-bold text-brand-charcoal uppercase">
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* G. Promotional Banner */}
      <section className="relative bg-brand-charcoal overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=2000&auto=format&fit=crop"
          alt="Training"
          fill
          className="object-cover opacity-30"
        />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 text-center">
          <Zap className="w-10 h-10 text-brand-lime mx-auto mb-4" />
          <h2 className="font-display text-4xl md:text-6xl font-bold text-white uppercase tracking-tight">
            Upgrade <span className="text-brand-lime">Your Game</span>
          </h2>
          <p className="text-gray-300 mt-4 max-w-xl mx-auto">
            New season, new gear. Score up to 40% off on performance apparel, footwear and accessories.
          </p>
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 mt-8 px-8 py-4 bg-brand-lime text-brand-charcoal font-bold text-sm uppercase tracking-wider rounded-xl hover:bg-brand-lime-hover transition-all hover:shadow-lime-glow"
          >
            Grab The Deal <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* H. New Arrivals */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
        <SectionHeading eyebrow="Fresh Drops" title="New Arrivals" subtitle="Just landed — be the first to gear up" />
        {loadingNew ? (
          <div className="flex justify-center py-12"><Spinner /></div>
        ) : newArrivals && newArrivals.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {newArrivals.slice(0, 8).map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        ) : (
          <EmptyState title="No new arrivals" />
        )}
      </section>

      {/* I. Featured Brands */}
      <section className="bg-brand-gray py-16 md:py-20 border-y border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading eyebrow="Top Partners" title="Featured Brands" subtitle="Official partner of the world's best sports brands" />
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
            {(brands.length ? brands.slice(0, 8).map((b) => b.name) : ['Nike', 'Adidas', 'Puma', 'Yonex', 'SG', 'SS', 'Nivia', 'Cosco']).map((name, i) => (
              <Link
                key={name}
                href={`/shop?brand=${encodeURIComponent(name)}`}
                className="bg-white rounded-xl border border-gray-100 p-6 flex items-center justify-center h-20 hover:border-brand-lime hover:shadow-card-hover transition-all group"
              >
                <span className="font-display text-xl font-bold text-gray-400 group-hover:text-brand-charcoal transition-colors tracking-wide">
                  {name}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* J. Testimonials */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
        <SectionHeading eyebrow="Reviews" title="What Athletes Say" />
        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-white rounded-2xl border border-gray-100 p-6 relative"
            >
              <Quote className="w-8 h-8 text-brand-lime absolute top-5 right-5 opacity-60" />
              <div className="flex gap-1 mb-3">
                {Array.from({ length: 5 }).map((_, j) => (
                  <Star key={j} className={`w-4 h-4 ${j < t.rating ? 'fill-brand-lime text-brand-lime' : 'text-gray-300'}`} />
                ))}
              </div>
              <p className="text-sm text-gray-600 leading-relaxed">"{t.text}"</p>
              <div className="flex items-center gap-3 mt-5 pt-4 border-t border-gray-100">
                <Image src={t.avatar} alt={t.name} width={40} height={40} className="w-10 h-10 rounded-full object-cover" />
                <div>
                  <p className="text-sm font-bold text-brand-charcoal">{t.name}</p>
                  <p className="text-xs text-gray-500">{t.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* K. Lifestyle Gallery */}
      <section className="bg-brand-charcoal py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading eyebrow="Community" title="Train Like A Pro" dark />
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
            {galleryImages.map((src, i) => (
              <div key={i} className={`relative rounded-2xl overflow-hidden group ${i % 3 === 0 ? 'md:row-span-2 aspect-[3/4] md:aspect-auto' : 'aspect-square'}`}>
                <Image src={src} alt="Sports lifestyle" fill sizes="(max-width: 768px) 50vw, 33vw" className="object-cover group-hover:scale-110 transition-transform duration-500" />
                <div className="absolute inset-0 bg-brand-lime/0 group-hover:bg-brand-lime/20 transition-colors duration-300" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* L. CTA strip */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-brand-lime rounded-3xl p-8 md:p-14 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
          <Dumbbell className="absolute -right-6 -bottom-6 w-48 h-48 text-brand-charcoal/10 rotate-12" />
          <div>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-brand-charcoal uppercase">
              Ready To Level Up?
            </h2>
            <p className="text-brand-charcoal/70 mt-2 font-medium">Free shipping on orders over $100. 30-day easy returns.</p>
          </div>
          <Link
            href="/shop"
            className="px-8 py-4 bg-brand-charcoal text-white font-bold text-sm uppercase tracking-wider rounded-xl hover:bg-brand-dark transition-colors flex items-center gap-2 shrink-0"
          >
            Start Shopping <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}

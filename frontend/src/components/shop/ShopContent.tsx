'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { SlidersHorizontal, X, ChevronLeft, ChevronRight, Package } from 'lucide-react';
import { productService } from '@/services/productService';
import { brandService } from '@/services/brandService';
import { categoryService } from '@/services/categoryService';
import { Product, ProductFilterParams, Brand, Category } from '@/types';
import ProductCard from '@/components/ProductCard';
import Spinner from '@/components/Spinner';
import EmptyState from '@/components/EmptyState';

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'popular', label: 'Most Popular' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Highest Rated' },
];

const PRICE_RANGES = [
  { label: 'Under $50', min: 0, max: 50 },
  { label: '$50 - $100', min: 50, max: 100 },
  { label: '$100 - $200', min: 100, max: 200 },
  { label: '$200 - $500', min: 200, max: 500 },
  { label: 'Over $500', min: 500, max: 99999 },
];

const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'UK 6', 'UK 7', 'UK 8', 'UK 9', 'UK 10', 'UK 11', 'One Size'];
const COLORS = [
  { name: 'Black', hex: '#111111' },
  { name: 'White', hex: '#FFFFFF' },
  { name: 'Red', hex: '#E11D48' },
  { name: 'Blue', hex: '#2563EB' },
  { name: 'Green', hex: '#16A34A' },
  { name: 'Yellow', hex: '#EAB308' },
  { name: 'Orange', hex: '#EA580C' },
  { name: 'Grey', hex: '#6B7280' },
  { name: 'Navy', hex: '#1E3A8A' },
  { name: 'Pink', hex: '#EC4899' },
];

export default function ShopContent({ fixedCategory }: { fixedCategory?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [filtersOpen, setFiltersOpen] = useState(false);
  const [localFilters, setLocalFilters] = useState<ProductFilterParams>({});

  const search = searchParams.get('search') || undefined;
  const category = fixedCategory || searchParams.get('category') || undefined;
  const brand = searchParams.get('brand') || undefined;
  const minPrice = searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : undefined;
  const maxPrice = searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : undefined;
  const rating = searchParams.get('rating') ? Number(searchParams.get('rating')) : undefined;
  const sort = (searchParams.get('sort') as ProductFilterParams['sort']) || 'newest';
  const page = Number(searchParams.get('page')) || 1;

  // Parse size/color params
  const sizesParam = searchParams.get('sizes');
  const colorsParam = searchParams.get('colors');

  const params: ProductFilterParams = useMemo(() => ({
    search,
    category,
    brand,
    minPrice,
    maxPrice,
    rating,
    sort,
    page,
    limit: 12,
    sizes: sizesParam ? sizesParam.split(',') : undefined,
    // colors handled client-side below
  }), [search, category, brand, minPrice, maxPrice, rating, sort, page, sizesParam]);

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['products', params],
    queryFn: () => productService.getProducts(params),
  });
  const { data: brands = [] } = useQuery<Brand[]>({ queryKey: ['brands'], queryFn: () => brandService.getBrands() });
  const { data: categories = [] } = useQuery<Category[]>({ queryKey: ['categories'], queryFn: () => categoryService.getCategories() });

  const products = useMemo(() => {
    let list = data?.data ?? [];
    if (colorsParam) {
      const wanted = colorsParam.split(',').map((c) => c.toLowerCase());
      list = list.filter((p) =>
        p.colors?.some((c) => wanted.includes(c.name.toLowerCase()))
      );
    }
    return list;
  }, [data, colorsParam]);

  const pagination = data?.pagination;

  const updateParams = (updates: Record<string, string | undefined>) => {
    const sp = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([k, v]) => {
      if (v === undefined || v === '') sp.delete(k);
      else sp.set(k, v);
    });
    // reset page when filters change (except page itself)
    if (!('page' in updates)) sp.delete('page');
    const qs = sp.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
  };

  const activeFilterCount = [brand, minPrice !== undefined || maxPrice !== undefined, rating, sizesParam, colorsParam, search]
    .filter(Boolean).length;

  const clearAll = () => router.push(pathname);

  const FilterPanel = (
    <div className="space-y-6">
      {/* Category (only on shop all) */}
      {!fixedCategory && (
        <div>
          <h4 className="font-bold text-sm uppercase tracking-wider text-brand-charcoal mb-3">Category</h4>
          <select
            value={category || ''}
            onChange={(e) => updateParams({ category: e.target.value || undefined })}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-lime"
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.slug || c.name}>{c.name}</option>
            ))}
          </select>
        </div>
      )}

      {/* Brand */}
      <div>
        <h4 className="font-bold text-sm uppercase tracking-wider text-brand-charcoal mb-3">Brand</h4>
        <div className="space-y-1.5 max-h-48 overflow-y-auto">
          {brands.slice(0, 12).map((b) => (
            <label key={b.id} className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer hover:text-brand-charcoal">
              <input
                type="checkbox"
                checked={brand === b.name}
                onChange={(e) => updateParams({ brand: e.target.checked ? b.name : undefined })}
                className="w-4 h-4 accent-brand-lime"
              />
              {b.name}
            </label>
          ))}
          {brands.length === 0 && <p className="text-xs text-gray-400">Loading brands…</p>}
        </div>
      </div>

      {/* Price */}
      <div>
        <h4 className="font-bold text-sm uppercase tracking-wider text-brand-charcoal mb-3">Price</h4>
        <div className="space-y-1.5">
          {PRICE_RANGES.map((r) => {
            const active = minPrice === r.min && maxPrice === r.max;
            return (
              <button
                key={r.label}
                onClick={() => updateParams({ minPrice: String(r.min), maxPrice: String(r.max) })}
                className={`block w-full text-left text-sm px-3 py-1.5 rounded-lg transition-colors ${active ? 'bg-brand-lime font-semibold text-brand-charcoal' : 'text-gray-600 hover:bg-brand-gray'}`}
              >
                {r.label}
              </button>
            );
          })}
          {(minPrice !== undefined || maxPrice !== undefined) && (
            <button onClick={() => updateParams({ minPrice: undefined, maxPrice: undefined })} className="text-xs text-red-500 font-semibold mt-1">
              Clear price
            </button>
          )}
        </div>
      </div>

      {/* Rating */}
      <div>
        <h4 className="font-bold text-sm uppercase tracking-wider text-brand-charcoal mb-3">Rating</h4>
        <div className="space-y-1.5">
          {[4, 3, 2, 1].map((r) => (
            <label key={r} className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
              <input
                type="radio"
                name="rating"
                checked={rating === r}
                onChange={() => updateParams({ rating: String(r) })}
                className="w-4 h-4 accent-brand-lime"
              />
              {r}+ Stars
            </label>
          ))}
        </div>
      </div>

      {/* Size */}
      <div>
        <h4 className="font-bold text-sm uppercase tracking-wider text-brand-charcoal mb-3">Size</h4>
        <div className="flex flex-wrap gap-1.5">
          {SIZES.map((s) => {
            const selected = sizesParam?.split(',').includes(s);
            return (
              <button
                key={s}
                onClick={() => {
                  const current = sizesParam ? sizesParam.split(',') : [];
                  const next = selected ? current.filter((x) => x !== s) : [...current, s];
                  updateParams({ sizes: next.length ? next.join(',') : undefined });
                }}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg border transition-colors ${
                  selected ? 'bg-brand-charcoal text-brand-lime border-brand-charcoal' : 'border-gray-200 text-gray-600 hover:border-brand-lime'
                }`}
              >
                {s}
              </button>
            );
          })}
        </div>
      </div>

      {/* Color */}
      <div>
        <h4 className="font-bold text-sm uppercase tracking-wider text-brand-charcoal mb-3">Color</h4>
        <div className="flex flex-wrap gap-2">
          {COLORS.map((c) => {
            const selected = colorsParam?.split(',').some((x) => x.toLowerCase() === c.name.toLowerCase());
            return (
              <button
                key={c.name}
                title={c.name}
                onClick={() => {
                  const current = colorsParam ? colorsParam.split(',') : [];
                  const next = selected
                    ? current.filter((x) => x.toLowerCase() !== c.name.toLowerCase())
                    : [...current, c.name];
                  updateParams({ colors: next.length ? next.join(',') : undefined });
                }}
                className={`w-7 h-7 rounded-full border-2 transition-all ${selected ? 'border-brand-lime scale-110' : 'border-gray-200 hover:border-gray-400'}`}
                style={{ backgroundColor: c.hex }}
              />
            );
          })}
        </div>
      </div>

      {activeFilterCount > 0 && (
        <button onClick={clearAll} className="w-full py-2.5 text-sm font-bold text-red-600 border border-red-200 rounded-xl hover:bg-red-50 transition-colors">
          Clear All Filters
        </button>
      )}
    </div>
  );

  const categoryName = fixedCategory
    ? categories.find((c) => (c.slug || c.name.toLowerCase()) === fixedCategory)?.name || fixedCategory
    : 'All Products';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      {/* Breadcrumb-ish header */}
      <div className="mb-6">
        <h1 className="font-display text-3xl md:text-4xl font-bold text-brand-charcoal uppercase tracking-tight">
          {search ? `Results for "${search}"` : categoryName}
        </h1>
        {pagination && (
          <p className="text-sm text-gray-500 mt-1">{pagination.total} products found</p>
        )}
      </div>

      <div className="flex gap-8">
        {/* Desktop sidebar */}
        <aside className="hidden lg:block w-64 shrink-0">
          <div className="bg-white rounded-2xl border border-gray-100 p-5 sticky top-24 max-h-[calc(100vh-8rem)] overflow-y-auto">
            <h3 className="font-display font-bold text-lg text-brand-charcoal mb-4 flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4" /> Filters
            </h3>
            {FilterPanel}
          </div>
        </aside>

        {/* Main */}
        <div className="flex-1 min-w-0">
          {/* Toolbar */}
          <div className="flex items-center justify-between gap-3 mb-6">
            <button
              onClick={() => setFiltersOpen(true)}
              className="lg:hidden flex items-center gap-2 px-4 py-2.5 bg-brand-charcoal text-white text-sm font-semibold rounded-xl"
            >
              <SlidersHorizontal className="w-4 h-4" /> Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
            </button>
            <div className="flex items-center gap-3 ml-auto">
              <span className="hidden sm:block text-sm text-gray-500">Sort by:</span>
              <select
                value={sort}
                onChange={(e) => updateParams({ sort: e.target.value })}
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm font-medium focus:outline-none focus:border-brand-lime bg-white"
              >
                {SORT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Grid */}
          {isLoading ? (
            <div className="flex justify-center py-20"><Spinner className="w-10 h-10" /></div>
          ) : products.length === 0 ? (
            <EmptyState title="No products found" description="Try adjusting your filters or search terms." />
          ) : (
            <div className={`grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 transition-opacity ${isFetching ? 'opacity-60' : ''}`}>
              {products.map((p: Product) => <ProductCard key={p.id} product={p} />)}
            </div>
          )}

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-10">
              <button
                disabled={!pagination.hasPrevPage}
                onClick={() => updateParams({ page: String(page - 1) })}
                className="p-2.5 rounded-xl border border-gray-200 disabled:opacity-40 hover:border-brand-lime transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              {Array.from({ length: Math.min(pagination.totalPages, 7) }, (_, i) => {
                let pageNum: number;
                if (pagination.totalPages <= 7) pageNum = i + 1;
                else if (page <= 4) pageNum = i + 1;
                else if (page >= pagination.totalPages - 3) pageNum = pagination.totalPages - 6 + i;
                else pageNum = page - 3 + i;
                return (
                  <button
                    key={pageNum}
                    onClick={() => updateParams({ page: String(pageNum) })}
                    className={`w-10 h-10 rounded-xl text-sm font-bold transition-colors ${
                      pageNum === page ? 'bg-brand-charcoal text-brand-lime' : 'border border-gray-200 hover:border-brand-lime'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              <button
                disabled={!pagination.hasNextPage}
                onClick={() => updateParams({ page: String(page + 1) })}
                className="p-2.5 rounded-xl border border-gray-200 disabled:opacity-40 hover:border-brand-lime transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile filter drawer */}
      {filtersOpen && (
        <div className="fixed inset-0 z-[90] lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setFiltersOpen(false)} />
          <div className="absolute right-0 top-0 bottom-0 w-80 max-w-[85vw] bg-white p-5 overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-display font-bold text-lg">Filters</h3>
              <button onClick={() => setFiltersOpen(false)}><X className="w-5 h-5" /></button>
            </div>
            {FilterPanel}
            <button
              onClick={() => setFiltersOpen(false)}
              className="w-full mt-6 py-3 bg-brand-charcoal text-white font-bold rounded-xl"
            >
              Show Results
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

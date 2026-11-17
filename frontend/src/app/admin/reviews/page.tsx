'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Trash2, Star } from 'lucide-react';
import { reviewService } from '@/services/reviewService';
import { mockStore } from '@/lib/mockStore';

import { formatDate } from '@/lib/utils';
import { Review } from '@/types';
import { PageHeader, Badge } from '@/components/admin/AdminUI';
import Spinner from '@/components/Spinner';
import EmptyState from '@/components/EmptyState';
import { toast } from '@/stores/uiStore';

export default function AdminReviewsPage() {
  const queryClient = useQueryClient();
  const { data: reviews = [], isLoading } = useQuery<Review[]>({
    queryKey: ['admin-reviews'],
    queryFn: () => reviewService.getAllReviews(),
  });

  const remove = async (r: Review) => {
    if (!window.confirm('Delete this review?')) return;
    try {
      await reviewService.deleteReview(r.id);
      toast.success('Review deleted');
    } catch {
      mockStore.saveReviews(mockStore.getReviews().filter((x) => x.id !== r.id));
      toast.info('Removed locally (backend offline)');
    }
    // refresh local mock reviews
    queryClient.invalidateQueries({ queryKey: ['admin-reviews'] });
  };

  return (
    <div>
      <PageHeader title="Reviews" subtitle={`${reviews.length} reviews across the store`} />
      {isLoading ? (
        <div className="flex justify-center py-20"><Spinner className="w-10 h-10" /></div>
      ) : reviews.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100"><EmptyState title="No reviews yet" /></div>
      ) : (
        <div className="space-y-3">
          {reviews.map((r) => (
            <div key={r.id} className="bg-white rounded-2xl border border-gray-100 p-4 flex gap-4">
              <div className="w-10 h-10 rounded-full bg-brand-lime flex items-center justify-center font-bold text-brand-charcoal shrink-0">
                {r.userName?.[0]?.toUpperCase() || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-bold text-sm">{r.userName}</p>
                  <span className="flex items-center gap-0.5">
                    {Array.from({ length: r.rating }).map((_, i) => <Star key={i} className="w-3.5 h-3.5 fill-brand-lime text-brand-lime" />)}
                  </span>
                  {r.verifiedPurchase && <Badge color="green">Verified</Badge>}
                  <span className="text-xs text-gray-400 ml-auto">{formatDate(r.createdAt)}</span>
                </div>
                {r.title && <p className="font-bold text-sm mt-1">{r.title}</p>}
                <p className="text-sm text-gray-600 mt-0.5">{r.comment}</p>
                <p className="text-xs text-gray-400 mt-1">Product: {r.productId}</p>
              </div>
              <button onClick={() => remove(r)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg self-start">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

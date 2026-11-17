import { Star, StarHalf } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function RatingStars({
  rating,
  size = 'sm',
  showValue = false,
  count,
  className,
}: {
  rating: number;
  size?: 'xs' | 'sm' | 'md';
  showValue?: boolean;
  count?: number;
  className?: string;
}) {
  const sizeClass = size === 'xs' ? 'w-3 h-3' : size === 'sm' ? 'w-4 h-4' : 'w-5 h-5';
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    if (rating >= i - 0.25) {
      stars.push(<Star key={i} className={cn(sizeClass, 'fill-brand-lime text-brand-lime')} />);
    } else if (rating >= i - 0.75) {
      stars.push(
        <span key={i} className="relative inline-block">
          <Star className={cn(sizeClass, 'text-gray-300')} />
          <StarHalf className={cn(sizeClass, 'fill-brand-lime text-brand-lime absolute inset-0')} />
        </span>
      );
    } else {
      stars.push(<Star key={i} className={cn(sizeClass, 'text-gray-300')} />);
    }
  }

  return (
    <div className={cn('flex items-center gap-1', className)}>
      <div className="flex items-center gap-0.5">{stars}</div>
      {showValue && <span className="text-xs font-semibold text-gray-700 ml-1">{rating.toFixed(1)}</span>}
      {count !== undefined && <span className="text-xs text-gray-400">({count})</span>}
    </div>
  );
}

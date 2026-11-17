import { PackageSearch } from 'lucide-react';

export default function EmptyState({
  title = 'Nothing found',
  description = 'Try adjusting your filters or check back later for new arrivals.',
}: {
  title?: string;
  description?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-16 h-16 rounded-full bg-brand-gray flex items-center justify-center mb-4">
        <PackageSearch className="w-8 h-8 text-gray-400" />
      </div>
      <h3 className="font-display text-xl font-bold text-brand-charcoal">{title}</h3>
      <p className="text-sm text-gray-500 mt-1 max-w-sm">{description}</p>
    </div>
  );
}

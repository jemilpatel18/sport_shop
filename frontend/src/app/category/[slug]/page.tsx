import { Suspense } from 'react';
import ShopContent from '@/components/shop/ShopContent';
import Spinner from '@/components/Spinner';

export default function CategoryPage({ params }: { params: { slug: string } }) {
  return (
    <Suspense fallback={<div className="flex justify-center py-32"><Spinner className="w-10 h-10" /></div>}>
      <ShopContent fixedCategory={params.slug} />
    </Suspense>
  );
}

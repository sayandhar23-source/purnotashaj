import ProductGridSkeleton from '@/components/skeletons/ProductGridSkeleton';

export default function Loading() {
  return (
    <div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <div className="skeleton rounded-2xl aspect-[3/2] sm:aspect-[16/6] md:aspect-[5/1]" />
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <ProductGridSkeleton className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6" />
      </div>
    </div>
  );
}

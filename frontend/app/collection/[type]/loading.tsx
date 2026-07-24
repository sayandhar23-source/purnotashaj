import ProductGridSkeleton from '@/components/skeletons/ProductGridSkeleton';

export default function Loading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="skeleton h-3 rounded-md w-32 mb-4" />
      <div className="skeleton h-7 rounded-md w-48 mb-8" />
      <ProductGridSkeleton />
    </div>
  );
}

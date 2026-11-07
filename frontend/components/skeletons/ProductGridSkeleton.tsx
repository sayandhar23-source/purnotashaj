import ProductCardSkeleton from './ProductCardSkeleton';

export default function ProductGridSkeleton({
  count = 8,
  className = 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6',
}: {
  count?: number;
  className?: string;
}) {
  return (
    <div className={className}>
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}

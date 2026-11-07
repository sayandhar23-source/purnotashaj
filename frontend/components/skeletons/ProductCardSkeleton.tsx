export default function ProductCardSkeleton() {
  return (
    <div>
      <div className="skeleton aspect-[3/4] rounded-2xl mb-3" />
      <div className="skeleton h-3 rounded-md w-4/5 mb-2" />
      <div className="skeleton h-3 rounded-md w-2/5" />
    </div>
  );
}

export default function ProductDetailSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 grid md:grid-cols-2 gap-10">
      <div>
        <div className="skeleton aspect-square rounded-2xl" />
        <div className="flex gap-2 mt-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="skeleton w-16 h-16 rounded-lg" />
          ))}
        </div>
      </div>
      <div>
        <div className="skeleton h-3 rounded-md w-24 mb-3" />
        <div className="skeleton h-8 rounded-md w-3/4 mb-4" />
        <div className="skeleton h-7 rounded-md w-28 mb-6" />
        <div className="flex gap-2 mb-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="skeleton h-9 w-16 rounded-full" />
          ))}
        </div>
        <div className="skeleton h-12 rounded-full w-full max-w-sm mb-6" />
        <div className="skeleton h-3 rounded-md w-full mb-2" />
        <div className="skeleton h-3 rounded-md w-full mb-2" />
        <div className="skeleton h-3 rounded-md w-2/3" />
      </div>
    </div>
  );
}

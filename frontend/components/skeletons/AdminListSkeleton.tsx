export default function AdminListSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="card p-4 flex items-center gap-4">
          <div className="skeleton w-12 h-12 rounded-lg shrink-0" />
          <div className="flex-1">
            <div className="skeleton h-3 rounded-md w-1/3 mb-2" />
            <div className="skeleton h-3 rounded-md w-1/5" />
          </div>
        </div>
      ))}
    </div>
  );
}

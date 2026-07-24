export default function HomeSkeleton() {
  return (
    <div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <div className="skeleton rounded-2xl aspect-[3/2] sm:aspect-[16/6] md:aspect-[5/1]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        <div className="skeleton h-5 rounded-md w-40 mb-6" />
        <div className="flex gap-3 overflow-hidden">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="skeleton w-28 sm:w-36 h-20 rounded-2xl shrink-0" />
          ))}
        </div>
      </div>

      {Array.from({ length: 3 }).map((_, rowIdx) => (
        <div key={rowIdx} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
          <div className="skeleton h-5 rounded-md w-36 mb-6" />
          <div className="flex gap-6 overflow-hidden">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="w-[46%] sm:w-[30%] lg:w-[220px] shrink-0">
                <div className="skeleton aspect-[3/4] rounded-2xl mb-3" />
                <div className="skeleton h-3 rounded-md w-4/5 mb-2" />
                <div className="skeleton h-3 rounded-md w-2/5" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

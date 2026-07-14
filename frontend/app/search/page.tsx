import { Suspense } from 'react';
import SearchInner from './SearchInner';

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="max-w-7xl mx-auto px-4 py-16 text-center text-gray-400">Loading...</div>}>
      <SearchInner />
    </Suspense>
  );
}

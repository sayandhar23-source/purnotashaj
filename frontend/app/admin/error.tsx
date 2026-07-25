'use client';

import { useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Surfaces the real error in the browser console instead of a silent blank page —
    // open DevTools console after this screen appears to see the actual message.
    console.error('Admin section error:', error);
  }, [error]);

  return (
    <div className="max-w-lg mx-auto px-4 py-20 text-center">
      <AlertTriangle className="mx-auto text-red-500 mb-4" size={40} />
      <h1 className="text-xl font-serif font-semibold mb-2">Something went wrong</h1>
      <p className="text-sm text-gray-500 mb-1">
        This section hit an error instead of loading. Open your browser's DevTools console for
        the exact error message.
      </p>
      {error.message && (
        <p className="text-xs text-gray-400 font-mono mt-3 mb-6 break-words">{error.message}</p>
      )}
      <button onClick={reset} className="btn-primary">
        Try again
      </button>
    </div>
  );
}

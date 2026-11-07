'use client';

import { useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Page error:', error);
  }, [error]);

  return (
    <div className="max-w-lg mx-auto px-4 py-20 text-center">
      <AlertTriangle className="mx-auto text-red-500 mb-4" size={40} />
      <h1 className="text-xl font-serif font-semibold mb-2">Something went wrong</h1>
      <p className="text-sm text-gray-500 mb-6">
        Please try again, or go back to the homepage.
      </p>
      <button onClick={reset} className="btn-primary">
        Try again
      </button>
    </div>
  );
}

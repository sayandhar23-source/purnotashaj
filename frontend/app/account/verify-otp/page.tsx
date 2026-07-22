import { Suspense } from 'react';
import VerifyOtpInner from './VerifyOtpInner';

export default function VerifyOtpPage() {
  return (
    <Suspense fallback={<div className="max-w-md mx-auto px-4 py-16 text-center text-gray-400">Loading...</div>}>
      <VerifyOtpInner />
    </Suspense>
  );
}

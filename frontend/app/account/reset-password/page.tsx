import { Suspense } from 'react';
import ResetPasswordInner from './ResetPasswordInner';

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="max-w-md mx-auto px-4 py-16 text-center text-gray-400">Loading...</div>}>
      <ResetPasswordInner />
    </Suspense>
  );
}

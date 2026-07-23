import Link from 'next/link';
import { XCircle } from 'lucide-react';

export default function CheckoutCancelledPage() {
  return (
    <div className="max-w-xl mx-auto px-4 py-24 text-center">
      <XCircle className="mx-auto text-red-500 mb-4" size={56} />
      <h1 className="text-2xl font-serif font-semibold mb-2">Payment cancelled</h1>
      <p className="text-gray-500 mb-6">Your order was not completed. You can try again anytime.</p>
      <Link href="/cart" className="btn-primary inline-block">
        Back to Cart
      </Link>
    </div>
  );
}

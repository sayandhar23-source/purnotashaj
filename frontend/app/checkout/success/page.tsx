import Link from 'next/link';
import { CheckCircle } from 'lucide-react';

export default function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: { order_id?: string };
}) {
  return (
    <div className="max-w-xl mx-auto px-4 py-24 text-center">
      <CheckCircle className="mx-auto text-green-500 mb-4" size={56} />
      <h1 className="text-2xl font-serif font-semibold mb-2">Order placed successfully!</h1>
      <p className="text-gray-500 mb-6">
        {searchParams.order_id
          ? `Order ID: ${searchParams.order_id}`
          : 'Thank you for shopping with us.'}
      </p>
      <Link href="/account/dashboard" className="btn-primary inline-block">
        View My Orders
      </Link>
    </div>
  );
}

'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Trash2 } from 'lucide-react';
import { useCart } from '@/lib/cart-context';
import { useDocumentTitle } from '@/lib/useDocumentTitle';
import { useCurrency } from '@/lib/currency-context';

export default function CartPage() {
  useDocumentTitle('Your Cart');
  const { items, removeItem, updateQuantity, total } = useCart();
  const { formatPrice } = useCurrency();

  if (items.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-serif font-semibold mb-3">Your cart is empty</h1>
        <Link href="/" className="btn-primary inline-block mt-4">
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-2xl font-serif font-semibold mb-8">Your Cart</h1>
      <div className="space-y-4">
        {items.map((item) => (
          <div
            key={item.productId + (item.variantId || '')}
            className="card p-4 flex flex-col sm:flex-row sm:items-center gap-4"
          >
            <div className="flex gap-4 flex-1 min-w-0">
              <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                {item.image && <Image src={item.image} alt={item.title} fill className="object-cover" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{item.title}</p>
                {item.variantName && <p className="text-sm text-gray-500">{item.variantName}</p>}
                <p className="font-semibold mt-1">{formatPrice(item.price)}</p>
              </div>
              {/* Remove button sits up here on mobile, next to the details */}
              <button
                onClick={() => removeItem(item.productId, item.variantId)}
                className="text-gray-400 hover:text-red-500 sm:hidden shrink-0 self-start"
                aria-label="Remove"
              >
                <Trash2 size={18} />
              </button>
            </div>

            <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
              <div className="flex items-center border rounded-full">
                <button
                  className="px-3 py-1.5"
                  onClick={() =>
                    updateQuantity(item.productId, item.variantId, Math.max(1, item.quantity - 1))
                  }
                  aria-label="Decrease quantity"
                >
                  −
                </button>
                <span className="px-3">{item.quantity}</span>
                <button
                  className="px-3 py-1.5"
                  onClick={() => updateQuantity(item.productId, item.variantId, item.quantity + 1)}
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>
              {/* Same remove button, desktop position */}
              <button
                onClick={() => removeItem(item.productId, item.variantId)}
                className="hidden sm:block text-gray-400 hover:text-red-500"
                aria-label="Remove"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <span className="text-lg font-semibold">Total: {formatPrice(total)}</span>
        <Link href="/checkout" className="btn-primary text-center">
          Proceed to Checkout
        </Link>
      </div>
    </div>
  );
}

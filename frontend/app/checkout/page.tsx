'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { useCart } from '@/lib/cart-context';
import { useAuth } from '@/lib/auth-context';
import { api } from '@/lib/api';

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function CheckoutPage() {
  const { items, total, clearCart } = useCart();
  const { user } = useAuth();
  const router = useRouter();
  const [provider, setProvider] = useState<'stripe' | 'razorpay'>('razorpay');
  const [address, setAddress] = useState({
    fullName: '',
    phone: '',
    line1: '',
    city: '',
    state: '',
    pincode: '',
  });
  const [loading, setLoading] = useState(false);

  const loadRazorpayScript = () =>
    new Promise((resolve) => {
      if (document.getElementById('razorpay-sdk')) return resolve(true);
      const script = document.createElement('script');
      script.id = 'razorpay-sdk';
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });

  const handlePlaceOrder = async () => {
    if (!user) {
      toast.error('Please log in to place an order.');
      router.push('/account/login');
      return;
    }
    if (items.length === 0) return;

    setLoading(true);
    try {
      const orderRes = await api.post('/orders', {
        items: items.map((i) => ({
          product: i.productId,
          variantId: i.variantId,
          title: i.title,
          variantName: i.variantName,
          price: i.price,
          quantity: i.quantity,
          image: i.image,
        })),
        totalAmount: total,
        paymentProvider: provider,
        shippingAddress: address,
      });
      const orderId = orderRes.data._id;

      if (provider === 'stripe') {
        const res = await api.post('/payments/stripe/checkout-session', { orderId });
        window.location.href = res.data.checkoutUrl;
        return;
      }

      // Razorpay
      const ok = await loadRazorpayScript();
      if (!ok) {
        toast.error('Failed to load payment gateway.');
        setLoading(false);
        return;
      }
      const res = await api.post('/payments/razorpay/order', { orderId });
      const { razorpayOrderId, amount, currency, keyId } = res.data;

      const rzp = new window.Razorpay({
        key: keyId,
        amount,
        currency,
        order_id: razorpayOrderId,
        name: 'Purnota Shaj',
        handler: async (response: any) => {
          await api.post('/payments/razorpay/verify', {
            orderId,
            razorpayOrderId: response.razorpay_order_id,
            razorpayPaymentId: response.razorpay_payment_id,
            razorpaySignature: response.razorpay_signature,
          });
          clearCart();
          router.push(`/checkout/success?order_id=${orderId}`);
        },
        prefill: { name: address.fullName, contact: address.phone },
        theme: { color: '#c85a28' },
      });
      rzp.open();
    } catch (err: any) {
      toast.error(err?.message || 'Something went wrong placing your order.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-2xl font-serif font-semibold mb-8">Checkout</h1>

      <div className="card p-6 space-y-4">
        <h2 className="font-semibold">Shipping Address</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <input
            className="input"
            placeholder="Full name"
            value={address.fullName}
            onChange={(e) => setAddress({ ...address, fullName: e.target.value })}
          />
          <input
            className="input"
            placeholder="Phone number"
            value={address.phone}
            onChange={(e) => setAddress({ ...address, phone: e.target.value })}
          />
          <input
            className="input sm:col-span-2"
            placeholder="Address line"
            value={address.line1}
            onChange={(e) => setAddress({ ...address, line1: e.target.value })}
          />
          <input
            className="input"
            placeholder="City"
            value={address.city}
            onChange={(e) => setAddress({ ...address, city: e.target.value })}
          />
          <input
            className="input"
            placeholder="State"
            value={address.state}
            onChange={(e) => setAddress({ ...address, state: e.target.value })}
          />
          <input
            className="input"
            placeholder="PIN code"
            value={address.pincode}
            onChange={(e) => setAddress({ ...address, pincode: e.target.value })}
          />
        </div>
      </div>

      <div className="card p-6 mt-6">
        <h2 className="font-semibold mb-3">Payment Method</h2>
        <div className="flex gap-3">
          <button
            onClick={() => setProvider('razorpay')}
            className={`px-4 py-2 rounded-full border text-sm ${
              provider === 'razorpay' ? 'border-brand-500 bg-brand-50 text-brand-600' : 'border-gray-300'
            }`}
          >
            Razorpay (Cards, UPI, Netbanking)
          </button>
          <button
            onClick={() => setProvider('stripe')}
            className={`px-4 py-2 rounded-full border text-sm ${
              provider === 'stripe' ? 'border-brand-500 bg-brand-50 text-brand-600' : 'border-gray-300'
            }`}
          >
            Stripe (International Cards)
          </button>
        </div>
      </div>

      <div className="mt-8 flex items-center justify-between">
        <span className="text-lg font-semibold">Total: ₹{total}</span>
        <button onClick={handlePlaceOrder} disabled={loading} className="btn-primary">
          {loading ? 'Processing...' : 'Place Order & Pay'}
        </button>
      </div>
    </div>
  );
}

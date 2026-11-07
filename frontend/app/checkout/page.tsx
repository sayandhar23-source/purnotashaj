'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { useCart } from '@/lib/cart-context';
import { useAuth } from '@/lib/auth-context';
import { api } from '@/lib/api';
import { useDocumentTitle } from '@/lib/useDocumentTitle';
import { getReferralCookie } from '@/lib/referral';
import { useCombo } from '@/lib/combo-context';
import { useCurrency } from '@/lib/currency-context';
import ComboNudge from '@/components/ComboNudge';

type AddressKey = 'fullName' | 'phone' | 'line1' | 'city' | 'state' | 'pincode';

// Same rules the server enforces, checked here first so mistakes are caught on the
// field itself instead of coming back as an error after "Place Order".
const ADDRESS_FIELDS: {
  key: AddressKey;
  placeholder: string;
  autoComplete: string;
  inputMode?: 'tel' | 'numeric' | 'text';
  maxLength: number;
  wide?: boolean;
}[] = [
  { key: 'fullName', placeholder: 'Full name', autoComplete: 'name', maxLength: 80 },
  { key: 'phone', placeholder: 'Mobile number', autoComplete: 'tel', inputMode: 'tel', maxLength: 15 },
  { key: 'line1', placeholder: 'House no., street, area', autoComplete: 'address-line1', maxLength: 200, wide: true },
  { key: 'city', placeholder: 'City', autoComplete: 'address-level2', maxLength: 60 },
  { key: 'state', placeholder: 'State', autoComplete: 'address-level1', maxLength: 60 },
  { key: 'pincode', placeholder: 'PIN code', autoComplete: 'postal-code', inputMode: 'numeric', maxLength: 6 },
];

function validateAddress(a: Record<AddressKey, string>): Partial<Record<AddressKey, string>> {
  const errs: Partial<Record<AddressKey, string>> = {};
  if (a.fullName.trim().length < 2) errs.fullName = 'Please enter your full name.';
  if (!/^(\+?91)?[6-9]\d{9}$/.test(a.phone.replace(/[\s-]/g, ''))) errs.phone = 'Please enter a valid 10-digit mobile number.';
  if (a.line1.trim().length < 5) errs.line1 = 'Please enter your full address.';
  if (a.city.trim().length < 2) errs.city = 'Please enter your city.';
  if (a.state.trim().length < 2) errs.state = 'Please enter your state.';
  if (!/^[1-9][0-9]{5}$/.test(a.pincode.trim())) errs.pincode = 'Please enter a valid 6-digit PIN code.';
  return errs;
}

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function CheckoutPage() {
  useDocumentTitle('Checkout');
  const { items, total, clearCart, applyServerChanges } = useCart();
  const { user } = useAuth();
  const { getCombo } = useCombo();
  const { formatPrice } = useCurrency();
  const { discount } = getCombo(total);
  const payable = total - discount;
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
  const [errors, setErrors] = useState<Partial<Record<AddressKey, string>>>({});
  // null = still checking, true = blocked (shown), false = allowed to proceed
  const [blockedRegion, setBlockedRegion] = useState<boolean | null>(null);

  useEffect(() => {
    api
      .get('/geo/me')
      .then((res) => setBlockedRegion(res.data.isIndia === false))
      .catch(() => setBlockedRegion(false)); // fail open — never block a real customer over a lookup hiccup
  }, []);

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
    if (items.length === 0 || loading) return;

    const found = validateAddress(address);
    if (Object.keys(found).length > 0) {
      setErrors(found);
      toast.error('Please check your delivery details.');
      return;
    }

    setLoading(true);
    // True once the customer has been handed to the payment window / Stripe. The button
    // must stay locked then — it used to unlock the instant the popup opened, so a
    // second click would create a second order.
    let handedOff = false;
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
        totalAmount: payable,
        paymentProvider: provider,
        shippingAddress: address,
        referralCode: getReferralCookie(),
      });
      const orderId = orderRes.data._id;

      // The server prices everything itself. If that differs from what was on screen
      // (e.g. a price dropped), say so before asking for money.
      if (Math.abs(orderRes.data.totalAmount - payable) > 0.5) {
        toast(`Your total is now ${formatPrice(orderRes.data.totalAmount)}.`, { icon: 'ℹ️' });
      }

      if (provider === 'stripe') {
        const res = await api.post('/payments/stripe/checkout-session', { orderId });
        handedOff = true;
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
          try {
            await api.post('/payments/razorpay/verify', {
              orderId,
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            });
            clearCart();
            router.push(`/checkout/success?order_id=${orderId}`);
          } catch (err: any) {
            toast.error(
              err?.message || 'We could not verify your payment. If money was deducted, contact support with your order ID.',
            );
          }
        },
        modal: {
          // User closed the popup without paying — let them know nothing
          // was charged, rather than leaving them wondering what happened.
          ondismiss: () => {
            toast('Payment cancelled — your order was not placed.', { icon: 'ℹ️' });
            setLoading(false);
          },
        },
        prefill: { name: address.fullName, contact: address.phone },
        theme: { color: '#c85a28' },
      });

      // A real payment attempt (e.g. card declined) — distinct from the user
      // just closing the popup, which is handled by modal.ondismiss above.
      rzp.on('payment.failed', (response: any) => {
        toast.error(response?.error?.description || 'Payment failed. Please try again.');
        setLoading(false);
      });

      handedOff = true;
      rzp.open();
    } catch (err: any) {
      if (err?.code === 'CART_CHANGED' && Array.isArray(err.problems)) {
        // Prices/stock changed since the items were added — fix the cart and let the
        // customer review it, rather than charging a different amount than they saw.
        applyServerChanges(err.problems);
        toast.error(err.message, { duration: 8000 });
      } else {
        toast.error(err?.message || 'Something went wrong placing your order.');
      }
    } finally {
      if (!handedOff) setLoading(false);
    }
  };

  if (blockedRegion) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <h1 className="text-xl font-serif font-semibold mb-3">We're not there yet — but we're getting there!</h1>
        <p className="text-sm text-gray-500">
          We currently only deliver within India. International shipping is coming soon — thanks
          for your patience.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-2xl font-serif font-semibold mb-8">Checkout</h1>

      <div className="card p-4 sm:p-6 space-y-4">
        <h2 className="font-semibold">Delivery details</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          {ADDRESS_FIELDS.map((f) => (
            <div key={f.key} className={f.wide ? 'sm:col-span-2' : ''}>
              <input
                className={`input ${errors[f.key] ? 'border-red-400' : ''}`}
                placeholder={f.placeholder}
                aria-label={f.placeholder}
                autoComplete={f.autoComplete}
                inputMode={f.inputMode}
                maxLength={f.maxLength}
                aria-invalid={!!errors[f.key]}
                value={address[f.key]}
                onChange={(e) => {
                  const value = f.key === 'pincode' ? e.target.value.replace(/\D/g, '') : e.target.value;
                  setAddress({ ...address, [f.key]: value });
                  if (errors[f.key]) setErrors({ ...errors, [f.key]: undefined });
                }}
              />
              {errors[f.key] && <p className="text-xs text-red-500 mt-1">{errors[f.key]}</p>}
            </div>
          ))}
        </div>
      </div>

      <div className="card p-4 sm:p-6 mt-6">
        <h2 className="font-semibold mb-3">Payment Method</h2>
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => setProvider('razorpay')}
            className={`px-4 py-3 rounded-lg sm:rounded-full border text-sm text-left sm:text-center ${
              provider === 'razorpay' ? 'border-brand-500 bg-brand-50 text-brand-600' : 'border-gray-300'
            }`}
          >
            Razorpay (Cards, UPI, Netbanking)
          </button>
          <button
            onClick={() => setProvider('stripe')}
            className={`px-4 py-3 rounded-lg sm:rounded-full border text-sm text-left sm:text-center ${
              provider === 'stripe' ? 'border-brand-500 bg-brand-50 text-brand-600' : 'border-gray-300'
            }`}
          >
            Stripe (International Cards)
          </button>
        </div>
      </div>

      <div className="mt-8 space-y-4">
        <ComboNudge subtotal={total} />

        <div className="card p-4 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">Subtotal</span>
            <span>{formatPrice(total)}</span>
          </div>
          {discount > 0 && (
            <div className="flex justify-between text-green-700">
              <span>Combo discount</span>
              <span>−{formatPrice(discount)}</span>
            </div>
          )}
          <div className="flex justify-between text-base font-semibold border-t border-gray-100 pt-2">
            <span>Total to pay</span>
            <span>{formatPrice(payable)}</span>
          </div>
        </div>

        <button onClick={handlePlaceOrder} disabled={loading} className="btn-primary w-full">
          {loading ? 'Processing...' : `Place Order & Pay ${formatPrice(payable)}`}
        </button>
      </div>
    </div>
  );
}

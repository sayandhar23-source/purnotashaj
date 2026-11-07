'use client';

import { useEffect } from 'react';
import Cookies from 'js-cookie';

const REFERRAL_COOKIE = 'referral_code';

export function captureReferralFromUrl() {
  if (typeof window === 'undefined') return;
  const params = new URLSearchParams(window.location.search);
  const ref = params.get('ref');
  if (ref && /^[A-Z0-9]{4,10}$/i.test(ref)) {
    // Whoever's code is active at checkout gets the credit — not necessarily
    // whoever was clicked first — so a fresh visit refreshes the 30-day window.
    Cookies.set(REFERRAL_COOKIE, ref.toUpperCase(), { expires: 30 });
  }
}

export function getReferralCookie(): string | undefined {
  return Cookies.get(REFERRAL_COOKIE);
}

// Mount once near the root of the app — silently captures ?ref= on any page,
// not just the homepage, since a referral link could point at any product.
export default function ReferralCapture() {
  useEffect(() => {
    captureReferralFromUrl();
  }, []);
  return null;
}

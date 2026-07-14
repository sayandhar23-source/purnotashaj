'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import toast from 'react-hot-toast';
import Cookies from 'js-cookie';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';

function VerifyOtpInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { refreshUser } = useAuth();
  const [email, setEmail] = useState(searchParams.get('email') || '');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/auth/verify-otp', { email, code });
      Cookies.set('token', res.data.token, { expires: 7 });
      await refreshUser();
      toast.success('Email verified! Welcome to Purnota Shaj.');
      router.push('/account/dashboard');
    } catch (err: any) {
      toast.error(err?.message || 'Invalid OTP.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    try {
      await api.post('/auth/resend-otp', { email });
      toast.success('OTP resent to your email.');
    } catch (err: any) {
      toast.error(err?.message || 'Could not resend OTP.');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <h1 className="text-2xl font-serif font-semibold mb-2 text-center">Verify your email</h1>
      <p className="text-sm text-gray-500 text-center mb-8">
        We sent a 6-digit code to your email. Enter it below to activate your account.
      </p>
      <form onSubmit={handleVerify} className="space-y-4">
        <input
          type="email"
          required
          placeholder="Email address"
          className="input"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          required
          maxLength={6}
          placeholder="6-digit OTP"
          className="input text-center tracking-[0.5em] text-lg"
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
        />
        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? 'Verifying...' : 'Verify & Continue'}
        </button>
      </form>
      <button
        onClick={handleResend}
        disabled={resending}
        className="text-sm text-brand-500 mt-4 block mx-auto"
      >
        {resending ? 'Resending...' : "Didn't get a code? Resend"}
      </button>
    </div>
  );
}

export default VerifyOtpInner;

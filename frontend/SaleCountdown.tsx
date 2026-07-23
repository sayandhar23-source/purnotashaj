'use client';

import { useEffect, useState } from 'react';

function getRemaining(endsAt: string) {
  const diff = new Date(endsAt).getTime() - Date.now();
  if (diff <= 0) return null;
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const seconds = Math.floor((diff / 1000) % 60);
  return { days, hours, minutes, seconds };
}

export default function SaleCountdown({ endsAt }: { endsAt: string }) {
  const [remaining, setRemaining] = useState(() => getRemaining(endsAt));

  useEffect(() => {
    const timer = setInterval(() => setRemaining(getRemaining(endsAt)), 1000);
    return () => clearInterval(timer);
  }, [endsAt]);

  if (!remaining) return null;

  const pad = (n: number) => String(n).padStart(2, '0');

  return (
    <div className="inline-flex items-center gap-1.5 text-sm font-medium text-red-600">
      <span>Sale ends in:</span>
      {remaining.days > 0 && <span>{remaining.days}d</span>}
      <span>{pad(remaining.hours)}h</span>
      <span>{pad(remaining.minutes)}m</span>
      <span>{pad(remaining.seconds)}s</span>
    </div>
  );
}

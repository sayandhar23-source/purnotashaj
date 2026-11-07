'use client';

import { useEffect, useState } from 'react';

// Shows the image the moment a URL is typed, and explains the most common reason one
// "doesn't show": pasting a share-PAGE link (e.g. ibb.co/xyz) instead of the direct image link.
export default function ImagePreview({ url }: { url: string }) {
  const [status, setStatus] = useState<'loading' | 'ok' | 'error'>('loading');
  const trimmed = url.trim();
  useEffect(() => setStatus('loading'), [trimmed]);

  if (!trimmed) return null;
  if (!/^https?:\/\//i.test(trimmed)) {
    return <p className="text-xs text-red-500">The link must start with https://</p>;
  }

  return (
    <div className="flex items-center gap-3">
      <div className="w-16 h-16 rounded-lg border bg-gray-50 overflow-hidden shrink-0 flex items-center justify-center">
        {/* plain <img> on purpose: this tests the raw link exactly as typed */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={trimmed}
          alt="Preview"
          className={`w-full h-full object-cover ${status === 'ok' ? '' : 'hidden'}`}
          onLoad={() => setStatus('ok')}
          onError={() => setStatus('error')}
        />
        {status === 'loading' && <span className="text-[10px] text-gray-400">Loading…</span>}
      </div>
      {status === 'ok' && <p className="text-xs text-green-600">Looks good — this image will show.</p>}
      {status === 'error' && (
        <p className="text-xs text-red-500">
          Couldn&apos;t load an image from this link. Use the <strong>direct image link</strong> (it usually
          ends in .jpg, .png or .webp) — a share-page link like ibb.co/xyz won&apos;t work.
        </p>
      )}
    </div>
  );
}

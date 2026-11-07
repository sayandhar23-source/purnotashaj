'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { isSafeImageSrc } from '@/lib/safeImage';

// The homepage used to print only the category NAME — the image you entered in
// Admin → Categories was saved correctly but never displayed anywhere. If an image
// is missing or its link is broken, this falls back to a tidy lettered tile.
export default function CategoryCard({ cat }: { cat: { _id: string; name: string; slug: string; image?: string } }) {
  const [failed, setFailed] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const showImage = isSafeImageSrc(cat.image) && !failed;

  // If the image failed to load before the page finished hydrating, React never saw the
  // error event — so check once after mount and fall back to the lettered tile.
  useEffect(() => {
    const el = imgRef.current;
    if (el && el.complete && el.naturalWidth === 0) setFailed(true);
  }, []);

  return (
    <Link href={`/category/${cat.slug}`} className="group block text-center">
      <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-brand-50 border border-gray-100 shadow-sm group-hover:shadow-md transition-shadow">
        {showImage ? (
          <Image
            ref={imgRef}
            src={(cat.image as string).trim()}
            alt={cat.name}
            fill
            sizes="(max-width: 767px) 112px, (max-width: 1023px) 20vw, 160px"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            onError={() => setFailed(true)}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center font-serif text-3xl sm:text-4xl text-brand-400">
            {cat.name.charAt(0).toUpperCase()}
          </div>
        )}
      </div>
      <span className="mt-2 block text-xs sm:text-sm font-medium text-gray-800 line-clamp-1">{cat.name}</span>
    </Link>
  );
}

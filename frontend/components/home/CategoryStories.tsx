'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { isSafeImageSrc } from '@/lib/safeImage';

type Cat = { _id: string; name: string; slug: string; image?: string };

function Story({ cat }: { cat: Cat }) {
  const [failed, setFailed] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const show = isSafeImageSrc(cat.image) && !failed;
  useEffect(() => {
    const el = imgRef.current;
    if (el && el.complete && el.naturalWidth === 0) setFailed(true);
  }, []);

  return (
    <Link href={`/category/${cat.slug}`} className="flex flex-col items-center gap-1.5 w-[62px] shrink-0 snap-start">
      <span className="block w-[58px] h-[58px] rounded-full border-2 border-[#D4A024] p-[2px] bg-white">
        <span className="relative block w-full h-full rounded-full overflow-hidden bg-brand-50">
          {show ? (
            <Image ref={imgRef} src={(cat.image as string).trim()} alt="" fill sizes="56px" className="object-cover" onError={() => setFailed(true)} />
          ) : (
            <span className="absolute inset-0 flex items-center justify-center font-serif text-xl text-brand-400">
              {cat.name.charAt(0).toUpperCase()}
            </span>
          )}
        </span>
      </span>
      <span className="text-[10px] font-medium text-gray-700 line-clamp-1 w-full text-center">{cat.name}</span>
    </Link>
  );
}

// Phones: a swipeable row of round category "stories" (from the App Feel).
// Tablets and up get the category grid further down instead.
export default function CategoryStories({ categories }: { categories: Cat[] }) {
  if (!categories || categories.length === 0) return null;
  return (
    <nav aria-label="Shop by category" className="md:hidden mt-4">
      <div className="flex gap-3.5 overflow-x-auto px-4 sm:px-6 pb-1 snap-x scrollbar-hide">
        {categories.map((c) => (
          <Story key={c._id} cat={c} />
        ))}
      </div>
    </nav>
  );
}

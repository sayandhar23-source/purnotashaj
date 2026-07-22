'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

type Banner = {
  _id: string;
  title: string;
  subtitle?: string;
  desktopImage: string;
  mobileImage: string;
  linkUrl?: string;
  ctaText?: string;
};

export default function SaleBanner() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [active, setActive] = useState(0);

  useEffect(() => {
    api
      .get('/banners')
      .then((res) => setBanners(res.data))
      .catch(() => setBanners([]));
  }, []);

  useEffect(() => {
    if (banners.length < 2) return;
    const t = setInterval(() => setActive((a) => (a + 1) % banners.length), 5000);
    return () => clearInterval(t);
  }, [banners.length]);

  if (banners.length === 0) return null;
  const banner = banners[active];

  const content = (
    <div className="relative w-full aspect-[16/9] md:aspect-[21/7] rounded-2xl overflow-hidden">
      <picture>
        <source media="(min-width: 768px)" srcSet={banner.desktopImage} />
        <Image
          src={banner.mobileImage}
          alt={banner.title}
          fill
          className="object-cover"
          priority
        />
      </picture>
      <div className="absolute inset-0 bg-black/20 flex flex-col justify-center px-6 md:px-16 text-white">
        <h2 className="text-2xl md:text-4xl font-serif font-bold max-w-md">{banner.title}</h2>
        {banner.subtitle && <p className="mt-2 max-w-sm text-sm md:text-base">{banner.subtitle}</p>}
        {banner.ctaText && (
          <span className="mt-4 inline-block w-fit bg-white text-gray-900 px-5 py-2 rounded-full text-sm font-semibold">
            {banner.ctaText}
          </span>
        )}
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
      {banner.linkUrl ? <Link href={banner.linkUrl}>{content}</Link> : content}
      {banners.length > 1 && (
        <div className="flex justify-center gap-2 mt-3">
          {banners.map((_, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={`w-2 h-2 rounded-full ${i === active ? 'bg-brand-500' : 'bg-gray-300'}`}
              aria-label={`Show banner ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

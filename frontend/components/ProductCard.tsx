'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { Heart } from 'lucide-react';
import { useWishlist } from '@/lib/wishlist-context';
import { getImageAltTitle } from '@/lib/imageSeo';
import { useCurrency } from '@/lib/currency-context';

export type ProductSummary = {
  _id: string;
  title: string;
  slug: string;
  images: string[];
  basePrice: number;
  compareAtPrice?: number;
  saleInfo?: {
    isActive: boolean;
    effectivePrice: number;
    originalPrice: number;
    discountPercent: number;
    endsAt: string | null;
  };
  isSoldOut?: boolean;
  imageMeta?: { url: string; name?: string; title?: string; alt?: string }[];
};

export default function ProductCard({
  product,
  lightText,
}: {
  product: ProductSummary;
  lightText?: boolean; // white title/price — for cards sitting on a bold/dark section background
}) {
  const { isWishlisted, toggle } = useWishlist();
  const { formatPrice } = useCurrency();
  const [activeImage, setActiveImage] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const images = product.images?.length ? product.images : [];

  const startCycling = () => {
    if (images.length < 2) return;
    intervalRef.current = setInterval(() => {
      setActiveImage((i) => (i + 1) % images.length);
    }, 800);
  };

  const stopCycling = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = null;
    setActiveImage(0);
  };

  useEffect(() => () => stopCycling(), []); // cleanup on unmount

  const onSale = !!product.saleInfo?.isActive;
  const displayPrice = onSale ? product.saleInfo!.effectivePrice : product.basePrice;
  const strikePrice = onSale ? product.saleInfo!.originalPrice : product.compareAtPrice;
  const discount = onSale
    ? product.saleInfo!.discountPercent
    : product.compareAtPrice && product.compareAtPrice > product.basePrice
      ? Math.round(((product.compareAtPrice - product.basePrice) / product.compareAtPrice) * 100)
      : null;

  const wishlisted = isWishlisted(product._id);

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.preventDefault();
    toggle(product._id);
  };

  return (
    <Link
      href={`/products/${product.slug}`}
      className="group block"
      onMouseEnter={startCycling}
      onMouseLeave={stopCycling}
    >
      <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-gray-100">
        {images.length > 0 ? (
          images.map((img, i) => {
            const { alt, title } = getImageAltTitle(img, product.imageMeta, product.title);
            return (
              <Image
                key={img + i}
                src={img}
                alt={i === activeImage ? alt : ''}
                title={i === activeImage ? title : undefined}
                aria-hidden={i === activeImage ? undefined : true}
                fill
                className={`object-cover transition-opacity duration-300 ${
                  i === activeImage ? 'opacity-100' : 'opacity-0'
                }`}
              />
            );
          })
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
            No image
          </div>
        )}
        {product.isSoldOut && (
          <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
            <span className="bg-gray-900 text-white text-xs font-semibold px-3 py-1.5 rounded-full">
              Sold Out
            </span>
          </div>
        )}
        {!product.isSoldOut && discount && (
          <span className={`absolute top-3 left-3 text-white text-xs font-semibold px-2 py-1 rounded-full ${onSale ? 'bg-red-500' : 'bg-brand-500'}`}>
            {onSale ? `SALE -${discount}%` : `-${discount}%`}
          </span>
        )}
        {images.length > 1 && (
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
            {images.map((_, i) => (
              <span
                key={i}
                className={`w-1.5 h-1.5 rounded-full transition-colors ${
                  i === activeImage ? 'bg-white' : 'bg-white/40'
                }`}
              />
            ))}
          </div>
        )}
        <button
          onClick={handleWishlistClick}
          className="absolute top-3 right-3 bg-white/90 rounded-full p-2 hover:bg-white"
          aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <Heart size={16} className={wishlisted ? 'fill-red-500 text-red-500' : 'text-gray-700'} />
        </button>
      </div>
      <div className="mt-3">
        <h3 className={`text-sm font-medium line-clamp-1 ${lightText ? 'text-white' : 'text-gray-800'}`}>
          {product.title}
        </h3>
        <div className="flex items-center gap-2 mt-1">
          <span className={`font-semibold ${lightText ? 'text-white' : ''}`}>{formatPrice(displayPrice)}</span>
          {strikePrice && strikePrice > displayPrice && (
            <span className={`text-sm line-through ${lightText ? 'text-white/60' : 'text-gray-400'}`}>
              {formatPrice(strikePrice)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

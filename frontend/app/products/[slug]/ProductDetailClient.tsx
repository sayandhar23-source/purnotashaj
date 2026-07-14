'use client';

import { useState } from 'react';
import Image from 'next/image';
import toast from 'react-hot-toast';
import { Heart, ChevronLeft, ChevronRight } from 'lucide-react';
import WhatsAppButton from '@/components/WhatsAppButton';
import ProductCard, { ProductSummary } from '@/components/ProductCard';
import { useCart } from '@/lib/cart-context';
import { useAuth } from '@/lib/auth-context';
import { api } from '@/lib/api';

type Variant = {
  _id: string;
  name: string;
  attributes: Record<string, string>;
  price: number;
  compareAtPrice?: number;
  stock: number;
  image?: string;
};

type Product = {
  _id: string;
  title: string;
  slug: string;
  description?: string;
  images: string[];
  basePrice: number;
  compareAtPrice?: number;
  variants: Variant[];
  category?: { name: string };
};

export default function ProductDetailClient({
  product,
  related,
}: {
  product: Product;
  related?: ProductSummary[];
}) {
  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(
    product.variants?.[0] || null,
  );
  const [activeImage, setActiveImage] = useState(0);
  const [qty, setQty] = useState(1);
  const { addItem } = useCart();
  const { user } = useAuth();

  const price = selectedVariant ? selectedVariant.price : product.basePrice;
  const compareAt = selectedVariant ? selectedVariant.compareAtPrice : product.compareAtPrice;
  const images = selectedVariant?.image ? [selectedVariant.image, ...product.images] : product.images;

  const handleAddToCart = () => {
    addItem({
      productId: product._id,
      slug: product.slug,
      title: product.title,
      variantId: selectedVariant?._id,
      variantName: selectedVariant?.name,
      price,
      quantity: qty,
      image: images[0],
    });
    toast.success('Added to cart');
  };

  const handleWishlist = async () => {
    if (!user) {
      toast.error('Please log in to save items to your wishlist.');
      return;
    }
    try {
      await api.post('/wishlist/toggle', { productId: product._id });
      toast.success('Wishlist updated');
    } catch {
      toast.error('Could not update wishlist.');
    }
  };

  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  const goToImage = (index: number) => {
    setActiveImage((index + images.length) % images.length);
  };

  const handleTouchStart = (e: React.TouchEvent) => setTouchStartX(e.touches[0].clientX);
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX === null) return;
    const deltaX = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(deltaX) > 40) {
      if (deltaX < 0) goToImage(activeImage + 1);
      else goToImage(activeImage - 1);
    }
    setTouchStartX(null);
  };

  return (
    <>
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 grid md:grid-cols-2 gap-10">
      <div>
        <div
          className="relative aspect-square rounded-2xl overflow-hidden bg-gray-100 select-none"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {images[activeImage] ? (
            <Image
              src={images[activeImage]}
              alt={product.title}
              fill
              className="object-cover"
              priority
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              No image
            </div>
          )}
          {images.length > 1 && (
            <>
              <button
                onClick={() => goToImage(activeImage - 1)}
                aria-label="Previous image"
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-1.5 hidden sm:flex"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                onClick={() => goToImage(activeImage + 1)}
                aria-label="Next image"
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-1.5 hidden sm:flex"
              >
                <ChevronRight size={18} />
              </button>
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                {images.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => goToImage(i)}
                    aria-label={`Go to image ${i + 1}`}
                    className={`w-1.5 h-1.5 rounded-full transition-colors ${
                      i === activeImage ? 'bg-brand-500' : 'bg-white/80'
                    }`}
                  />
                ))}
              </div>
            </>
          )}
        </div>
        {images.length > 1 && (
          <div className="flex gap-2 mt-3">
            {images.map((img, i) => (
              <button
                key={i}
                onClick={() => setActiveImage(i)}
                className={`relative w-16 h-16 rounded-lg overflow-hidden border-2 shrink-0 ${
                  i === activeImage ? 'border-brand-500' : 'border-transparent'
                }`}
              >
                <Image src={img} alt="" fill className="object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      <div>
        {product.category && (
          <span className="text-xs uppercase tracking-wide text-brand-500 font-semibold">
            {product.category.name}
          </span>
        )}
        <h1 className="text-2xl md:text-3xl font-serif font-semibold mt-1">{product.title}</h1>

        <div className="flex items-center gap-3 mt-4">
          <span className="text-2xl font-bold">₹{price}</span>
          {compareAt && compareAt > price && (
            <span className="text-gray-400 line-through">₹{compareAt}</span>
          )}
        </div>

        {product.variants?.length > 0 && (
          <div className="mt-6">
            <p className="text-sm font-medium mb-2">Choose an option</p>
            <div className="flex flex-wrap gap-2">
              {product.variants.map((v) => (
                <button
                  key={v._id}
                  onClick={() => setSelectedVariant(v)}
                  disabled={v.stock === 0}
                  className={`px-4 py-2 rounded-full border text-sm ${
                    selectedVariant?._id === v._id
                      ? 'border-brand-500 bg-brand-50 text-brand-600'
                      : 'border-gray-300'
                  } ${v.stock === 0 ? 'opacity-40 cursor-not-allowed' : ''}`}
                >
                  {v.name}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="flex items-center gap-3 mt-6">
          <div className="flex items-center border rounded-full">
            <button className="px-3 py-2" onClick={() => setQty((q) => Math.max(1, q - 1))}>
              −
            </button>
            <span className="px-3">{qty}</span>
            <button className="px-3 py-2" onClick={() => setQty((q) => q + 1)}>
              +
            </button>
          </div>
          <button onClick={handleWishlist} className="border rounded-full p-2.5" aria-label="Wishlist">
            <Heart size={20} />
          </button>
        </div>

        <div className="grid gap-3 mt-6 max-w-sm">
          <button onClick={handleAddToCart} className="btn-primary">
            Add to Cart
          </button>
          <WhatsAppButton product={product} variantName={selectedVariant?.name} />
        </div>

        {product.description && (
          <div className="mt-8 text-sm text-gray-600 leading-relaxed whitespace-pre-line">
            {product.description}
          </div>
        )}
      </div>
    </div>

    {related && related.length > 0 && (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <h2 className="text-xl font-serif font-semibold mb-6">You may also like</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {related.map((p) => (
            <ProductCard key={p._id} product={p} />
          ))}
        </div>
      </div>
    )}
    </>
  );
}

'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { Check, Play, Plus, X } from 'lucide-react';
import { useCart } from '@/lib/cart-context';
import { useCombo } from '@/lib/combo-context';
import { useCurrency } from '@/lib/currency-context';
import { isSafeImageSrc } from '@/lib/safeImage';

export type LookProduct = {
  _id: string;
  slug: string;
  title: string;
  image: string | null;
  price: number;
  comparePrice: number | null;
  hasVariants: boolean;
};
export type Look = {
  _id: string;
  slug: string;
  title: string;
  image: string;
  hasVideo: boolean;
  hero: LookProduct;
  items: LookProduct[];
  total: number;
};

// The "shop this look" list: every piece in the look with its own Add button, plus
// one button to add the whole look. Used in the side panel (desktop) and bottom sheet (phones).
function LookItems({ look }: { look: Look }) {
  const { addItem, total: cartTotal } = useCart();
  const { formatPrice } = useCurrency();
  const { getCombo } = useCombo();
  const [added, setAdded] = useState<Set<string>>(new Set());
  useEffect(() => setAdded(new Set()), [look._id]);

  const lines = [look.hero, ...look.items];
  const addOne = (p: LookProduct) => {
    addItem({ productId: p._id, slug: p.slug, title: p.title, price: p.price, quantity: 1, image: p.image || undefined });
    setAdded((prev) => new Set(prev).add(p._id));
  };
  // Items with options (size, colour…) have to be chosen on their own page
  const addable = lines.filter((p) => !p.hasVariants && !added.has(p._id));
  const addableTotal = addable.reduce((s, p) => s + p.price, 0);
  const discountAfter = getCombo(cartTotal + addableTotal).discount;

  const addAll = () => {
    addable.forEach(addOne);
    toast.success(`Added ${addable.length} item${addable.length > 1 ? 's' : ''} to cart`);
  };

  return (
    <div className="space-y-2.5">
      {lines.map((p) => (
        <div key={p._id} className="flex items-center gap-3 rounded-2xl bg-white/5 p-2.5">
          <Link href={`/products/${p.slug}`} className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-white/10">
            {isSafeImageSrc(p.image) && <Image src={p.image.trim()} alt={p.title} fill sizes="56px" className="object-cover" />}
          </Link>
          <div className="min-w-0 flex-1">
            <Link href={`/products/${p.slug}`} className="block text-sm leading-snug line-clamp-2">{p.title}</Link>
            <p className="mt-0.5 text-sm font-semibold">
              {formatPrice(p.price)}
              {p.comparePrice && <span className="ml-1.5 text-xs font-normal text-white/50 line-through">{formatPrice(p.comparePrice)}</span>}
            </p>
          </div>
          {p.hasVariants ? (
            <Link href={`/products/${p.slug}`} className="shrink-0 rounded-full border border-white/30 px-3 py-2 text-xs font-semibold">Options</Link>
          ) : (
            <button
              onClick={() => addOne(p)}
              className={`shrink-0 flex items-center gap-1 rounded-full px-3 py-2 text-xs font-bold ${
                added.has(p._id) ? 'bg-green-500/20 text-green-300' : 'bg-[#D4A024] text-[#5C1010]'
              }`}
              aria-label={`Add ${p.title} to cart`}
            >
              {added.has(p._id) ? <Check size={14} /> : <Plus size={14} />}
              {added.has(p._id) ? 'Added' : 'Add'}
            </button>
          )}
        </div>
      ))}

      <button
        onClick={addAll}
        disabled={addable.length === 0}
        className="w-full rounded-full bg-[#D4A024] py-3 text-sm font-bold text-[#5C1010] disabled:opacity-40"
      >
        {addable.length === 0 ? 'Whole look added' : `Add whole look · ${formatPrice(addableTotal)}`}
      </button>
      {discountAfter > 0 && addable.length > 0 && (
        <p className="text-center text-xs text-[#D4A024]">Combo discount applies: flat {formatPrice(discountAfter)} off your order</p>
      )}
    </div>
  );
}

// "For you": looks you swipe through. On phones, "Shop this look" opens a bottom sheet;
// on large screens the chosen look's pieces show in a panel beside the cards.
export default function ForYouFeed({ looks }: { looks: Look[] }) {
  const { formatPrice } = useCurrency();
  const [activeId, setActiveId] = useState<string>(looks[0]?._id || '');
  const [sheetOpen, setSheetOpen] = useState(false);

  useEffect(() => {
    if (!sheetOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setSheetOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [sheetOpen]);

  if (!looks || looks.length === 0) return null;
  const active = looks.find((l) => l._id === activeId) || looks[0];

  return (
    <section className="bg-[#14100e] text-white mt-8 md:mt-12 py-8 md:py-12" aria-label="For you">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between gap-3 mb-4 md:mb-5">
          <div>
            <p className="text-[10px] font-bold tracking-[0.2em] text-[#D4A024]">SHOP THE LOOK</p>
            <h2 className="font-serif font-semibold text-xl md:text-3xl">For you</h2>
          </div>
          <Link href="/collection/new-arrivals" className="text-sm font-semibold text-[#D4A024] shrink-0">New arrivals →</Link>
        </div>

        <div className="lg:grid lg:grid-cols-[1fr_340px] lg:gap-6">
          <div className="flex gap-3 overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0 snap-x snap-mandatory scrollbar-hide lg:grid lg:grid-cols-3 xl:grid-cols-4 lg:overflow-visible lg:snap-none">
            {looks.slice(0, 8).map((look) => (
              <div
                key={look._id}
                className={`relative shrink-0 snap-start w-[72%] sm:w-[44%] lg:w-auto aspect-[3/4.3] rounded-3xl overflow-hidden bg-[#2a201b] ${
                  look._id === active._id ? 'lg:ring-2 lg:ring-[#D4A024]' : ''
                }`}
              >
                {isSafeImageSrc(look.image) && (
                  <Image src={look.image.trim()} alt={look.title} fill sizes="(max-width: 640px) 72vw, (max-width: 1024px) 44vw, 22vw" className="object-cover" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/5 to-black/45" />
                <div className="absolute top-3 left-3 right-3">
                  <p className="text-[10px] font-bold tracking-[0.16em] text-[#D4A024]">{look.hasVideo ? 'WATCH & SHOP' : 'THE LOOK'}</p>
                  <h3 className="font-serif font-semibold text-base sm:text-lg leading-tight mt-0.5 line-clamp-2">{look.title}</h3>
                </div>
                {look.hasVideo && (
                  <Link
                    href={`/products/${look.slug}`}
                    aria-label={`Watch ${look.title}`}
                    className="absolute left-1/2 top-[42%] -translate-x-1/2 -translate-y-1/2 flex h-12 w-12 items-center justify-center rounded-full border border-white/40 bg-white/20 backdrop-blur-sm"
                  >
                    <Play size={18} fill="white" />
                  </Link>
                )}
                <button
                  onClick={() => {
                    setActiveId(look._id);
                    setSheetOpen(true); // only visible below lg — on desktop the side panel updates instead
                  }}
                  className="absolute inset-x-2.5 bottom-2.5 rounded-2xl bg-black/70 px-3 py-2.5 text-left text-xs backdrop-blur"
                >
                  <span className="block font-semibold">Shop this look · {1 + look.items.length} items</span>
                  <span className="block text-white/70">{formatPrice(look.total)}</span>
                </button>
              </div>
            ))}
          </div>

          <aside className="hidden lg:block rounded-3xl bg-[#1f1815] p-5 self-start sticky top-24">
            <p className="text-[10px] font-bold tracking-[0.18em] text-[#D4A024]">SELECTED LOOK</p>
            <h3 className="font-serif font-semibold text-lg leading-snug mt-0.5 mb-3">{active.title}</h3>
            <LookItems look={active} />
          </aside>
        </div>
      </div>

      {sheetOpen && (
        <div className="fixed inset-0 z-[60] lg:hidden" role="dialog" aria-modal="true" aria-label="Shop this look">
          <div className="absolute inset-0 bg-black/60" onClick={() => setSheetOpen(false)} />
          <div className="absolute inset-x-0 bottom-0 max-h-[85vh] overflow-y-auto rounded-t-3xl bg-[#1f1815] p-4 pb-8 text-white">
            <div className="mb-3 flex items-start justify-between gap-3">
              <h3 className="font-serif font-semibold text-lg leading-snug">{active.title}</h3>
              <button onClick={() => setSheetOpen(false)} aria-label="Close" className="shrink-0 rounded-full bg-white/10 p-2">
                <X size={16} />
              </button>
            </div>
            <LookItems look={active} />
          </div>
        </div>
      )}
    </section>
  );
}

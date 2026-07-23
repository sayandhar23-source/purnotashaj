import Link from 'next/link';

const MAROON = '#5C1010';
const GOLD = '#D4A024';

// The decorative scene only — temple silhouette + the Balarama/Jagannath/Subhadra
// trio on a shared pedestal. No text is baked in here; title/subtitle/CTA are
// admin-editable and rendered as real HTML on top (or below, on mobile) so they
// can be any length without breaking the artwork.
function TempleArtwork() {
  return (
    <svg
      viewBox="0 0 680 280"
      preserveAspectRatio="xMidYMid meet"
      className="absolute inset-0 w-full h-full"
      aria-hidden="true"
    >
      <rect width="680" height="280" fill={MAROON} />
      <rect x="0" y="0" width="680" height="6" fill={GOLD} />
      <line x1="0" y1="14" x2="680" y2="14" stroke={GOLD} strokeWidth="2" opacity="0.5" />

      <polygon points="560,240 560,120 585,60 610,120 610,240" fill={GOLD} />
      <polygon points="585,60 585,30 595,30 595,55" fill={GOLD} />
      <circle cx="590" cy="26" r="7" fill={GOLD} />
      <polygon
        points="500,240 500,150 585,60 670,150 670,240"
        fill="none"
        stroke={GOLD}
        strokeWidth="2"
        opacity="0.6"
      />

      <rect x="44" y="126" width="142" height="8" rx="2" fill={GOLD} />

      <polygon points="58,50 68,32 78,50" fill={GOLD} />
      <circle cx="68" cy="28" r="3.5" fill={GOLD} />
      <rect x="50" y="50" width="36" height="76" rx="16" fill="#F5EEE0" stroke={GOLD} strokeWidth="1" />
      <circle cx="48" cy="74" r="7" fill="#F5EEE0" stroke={GOLD} strokeWidth="1" />
      <circle cx="88" cy="74" r="7" fill="#F5EEE0" stroke={GOLD} strokeWidth="1" />
      <ellipse cx="60" cy="76" rx="5" ry="6.5" fill="#fff" stroke="#1A1A1A" strokeWidth="0.75" />
      <ellipse cx="76" cy="76" rx="5" ry="6.5" fill="#fff" stroke="#1A1A1A" strokeWidth="0.75" />
      <circle cx="60" cy="74" r="3" fill="#1A1A1A" />
      <circle cx="76" cy="74" r="3" fill="#1A1A1A" />
      <circle cx="60" cy="77.5" r="3.3" fill="#fff" />
      <circle cx="76" cy="77.5" r="3.3" fill="#fff" />
      <path d="M58 96 Q68 101 78 96" stroke={MAROON} strokeWidth="1.5" fill="none" />

      <polygon points="100,58 112,42 124,58" fill={GOLD} />
      <circle cx="112" cy="39" r="3" fill={GOLD} />
      <rect x="94" y="58" width="34" height="68" rx="15" fill="#1A1A1A" />
      <circle cx="92" cy="80" r="6.5" fill="#1A1A1A" />
      <circle cx="130" cy="80" r="6.5" fill="#1A1A1A" />
      <ellipse cx="104" cy="80" rx="5" ry="6.2" fill="#fff" />
      <ellipse cx="120" cy="80" rx="5" ry="6.2" fill="#fff" />
      <circle cx="104" cy="78" r="2.8" fill="#1A1A1A" />
      <circle cx="120" cy="78" r="2.8" fill="#1A1A1A" />
      <circle cx="104" cy="81.3" r="3" fill="#fff" />
      <circle cx="120" cy="81.3" r="3" fill="#fff" />
      <path d="M102 98 Q112 103 122 98" stroke={GOLD} strokeWidth="1.5" fill="none" />

      <polygon points="143,68 152,54 161,68" fill="#B3241F" />
      <circle cx="152" cy="51" r="2.8" fill="#B3241F" />
      <rect x="138" y="68" width="28" height="58" rx="14" fill="#E8B93D" />
      <ellipse cx="146" cy="86" rx="4.2" ry="5.5" fill="#fff" />
      <ellipse cx="158" cy="86" rx="4.2" ry="5.5" fill="#fff" />
      <circle cx="146" cy="84.3" r="2.4" fill="#1A1A1A" />
      <circle cx="158" cy="84.3" r="2.4" fill="#1A1A1A" />
      <circle cx="146" cy="87.2" r="2.6" fill="#fff" />
      <circle cx="158" cy="87.2" r="2.6" fill="#fff" />
      <path d="M145 100 Q152 104 159 100" stroke="#8A4A1F" strokeWidth="1.3" fill="none" />
    </svg>
  );
}

export default function TempleSaleBanner({
  heroTitle,
  heroSubtitle,
  ctaText,
  ctaHref = '/sale',
  showCta = true,
}: {
  heroTitle: string;
  heroSubtitle?: string;
  ctaText?: string;
  ctaHref?: string;
  showCta?: boolean;
}) {
  return (
    <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: MAROON }}>
      {/* Desktop: artwork as a full background, text overlaid on the plain-maroon left side */}
      <div className="hidden md:block relative aspect-[21/7]">
        <TempleArtwork />
        <div className="absolute inset-0 flex flex-col justify-center px-16 max-w-lg">
          <h2 className="text-3xl lg:text-4xl font-serif font-semibold text-[#F5EEE0]">
            {heroTitle}
          </h2>
          {heroSubtitle && <p className="mt-3 text-base text-[#E8C88A]">{heroSubtitle}</p>}
          {showCta && ctaText && (
            <Link
              href={ctaHref}
              className="mt-5 inline-block w-fit px-6 py-3 rounded-full text-sm font-semibold"
              style={{ backgroundColor: GOLD, color: MAROON }}
            >
              {ctaText}
            </Link>
          )}
        </div>
      </div>

      {/* Mobile: artwork on top, text stacked below — avoids any text/art collision at small sizes */}
      <div className="md:hidden">
        <div className="relative aspect-[16/9]">
          <TempleArtwork />
        </div>
        <div className="px-6 py-6 text-center">
          <h2 className="text-xl font-serif font-semibold text-[#F5EEE0]">{heroTitle}</h2>
          {heroSubtitle && <p className="mt-2 text-sm text-[#E8C88A]">{heroSubtitle}</p>}
          {showCta && ctaText && (
            <Link
              href={ctaHref}
              className="mt-4 inline-block px-6 py-3 rounded-full text-sm font-semibold"
              style={{ backgroundColor: GOLD, color: MAROON }}
            >
              {ctaText}
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

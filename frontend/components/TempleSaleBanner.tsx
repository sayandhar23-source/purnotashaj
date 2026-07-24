import Link from 'next/link';
import { SALE_BANNER_TEMPLATES, SaleBannerTemplateId } from './sale-banner-templates/config';

export default function TempleSaleBanner({
  template = 'festive-sale',
  heroTitle,
  heroSubtitle,
  ctaText,
  ctaHref = '/sale',
  showCta = true,
}: {
  template?: SaleBannerTemplateId | string;
  heroTitle: string;
  heroSubtitle?: string;
  ctaText?: string;
  ctaHref?: string;
  showCta?: boolean;
}) {
  const config = SALE_BANNER_TEMPLATES[template as SaleBannerTemplateId] || SALE_BANNER_TEMPLATES['festive-sale'];
  const { Art } = config;

  // Text plays a one-time fade+slide-in on mount, staggered per line — the
  // artwork on the right loops continuously, but looping the text itself would
  // be distracting for something people need to actually read.
  const textStyle = (delaySeconds: number): React.CSSProperties => ({
    opacity: 0,
    animation: 'bannerTextIn 0.7s ease-out forwards',
    animationDelay: `${delaySeconds}s`,
  });

  return (
    <div className="rounded-2xl overflow-hidden">
      {/* Desktop: text panel on the left, artwork panel on the right, side by side */}
      <div className="hidden md:flex" style={{ backgroundColor: config.leftBg }}>
        <div className="w-[55%] flex flex-col justify-center px-14 py-10">
          <span
            className="text-xs font-semibold tracking-widest"
            style={{ color: config.eyebrowColor, ...textStyle(0) }}
          >
            {config.eyebrow}
          </span>
          <h2
            className="text-3xl lg:text-4xl font-serif font-semibold mt-2"
            style={{ color: config.titleColor, ...textStyle(0.15) }}
          >
            {heroTitle}
          </h2>
          {heroSubtitle && (
            <p className="mt-3 text-base" style={{ color: config.subtitleColor, ...textStyle(0.3) }}>
              {heroSubtitle}
            </p>
          )}
          {showCta && ctaText && (
            <div style={textStyle(0.45)}>
              <Link
                href={ctaHref}
                className="mt-5 inline-block w-fit px-6 py-3 rounded-full text-sm font-semibold"
                style={{ backgroundColor: config.ctaBg, color: config.ctaText }}
              >
                {ctaText}
              </Link>
            </div>
          )}
        </div>
        <div className="relative w-[45%] aspect-[306/280]">
          <Art />
        </div>
      </div>

      {/* Mobile: artwork on top, text stacked below — avoids any collision at small sizes */}
      <div className="md:hidden" style={{ backgroundColor: config.leftBg }}>
        <div className="relative aspect-[16/9]">
          <Art />
        </div>
        <div className="px-6 py-6 text-center">
          <span
            className="text-[11px] font-semibold tracking-widest"
            style={{ color: config.eyebrowColor, ...textStyle(0) }}
          >
            {config.eyebrow}
          </span>
          <h2
            className="text-xl font-serif font-semibold mt-1"
            style={{ color: config.titleColor, ...textStyle(0.15) }}
          >
            {heroTitle}
          </h2>
          {heroSubtitle && (
            <p className="mt-2 text-sm" style={{ color: config.subtitleColor, ...textStyle(0.3) }}>
              {heroSubtitle}
            </p>
          )}
          {showCta && ctaText && (
            <div style={textStyle(0.45)}>
              <Link
                href={ctaHref}
                className="mt-4 inline-block px-6 py-3 rounded-full text-sm font-semibold"
                style={{ backgroundColor: config.ctaBg, color: config.ctaText }}
              >
                {ctaText}
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

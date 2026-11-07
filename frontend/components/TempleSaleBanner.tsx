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
    // One layout at every breakpoint: text on the left, artwork on the right.
    // Height is intentionally compact (roughly 60% of the original full-size
    // banner) via a shorter aspect ratio per breakpoint rather than letting
    // content stack and grow tall.
    <div
      className="rounded-2xl overflow-hidden flex aspect-[3/2] sm:aspect-[16/6] md:aspect-[5/1]"
      style={{ backgroundColor: config.leftBg }}
    >
      <div className="w-[55%] flex flex-col justify-center px-4 sm:px-8 md:px-12 py-2">
        <span
          className="text-[9px] sm:text-[11px] font-semibold tracking-widest"
          style={{ color: config.eyebrowColor, ...textStyle(0) }}
        >
          {config.eyebrow}
        </span>
        <h2
          className="text-base sm:text-xl md:text-2xl lg:text-3xl font-serif font-semibold mt-0.5 sm:mt-1 leading-tight"
          style={{ color: config.titleColor, ...textStyle(0.15) }}
        >
          {heroTitle}
        </h2>
        {heroSubtitle && (
          <p
            className="mt-1 text-[10px] sm:text-xs md:text-sm line-clamp-2"
            style={{ color: config.subtitleColor, ...textStyle(0.3) }}
          >
            {heroSubtitle}
          </p>
        )}
        {showCta && ctaText && (
          <div style={textStyle(0.45)}>
            <Link
              href={ctaHref}
              className="mt-1.5 sm:mt-3 inline-block w-fit px-3 sm:px-5 py-1.5 sm:py-2.5 rounded-full text-[10px] sm:text-xs md:text-sm font-semibold"
              style={{ backgroundColor: config.ctaBg, color: config.ctaText }}
            >
              {ctaText}
            </Link>
          </div>
        )}
      </div>
      <div className="relative w-[45%]">
        <Art />
      </div>
    </div>
  );
}

const GOLD = '#F0C572';
const GOLD_LINE = '#D4A24E';
const CORAL = '#C97B5B';

/**
 * The animated Purnota Shaj logo. Loops continuously (10s cycle):
 * portrait + jewelry draw in → PS outlines then fills gold → crossfades
 * into the full "Purnota Shaj" wordmark → holds → fades and restarts.
 *
 * - variant="wordmark": compact text-only mark for the navbar, on its own
 *   dark pill so it stays legible against the white header.
 * - variant="full": the full portrait illustration + wordmark, for the
 *   footer or any full-width/dark section.
 */
export default function AnimatedLogo({
  variant = 'full',
  className = '',
}: {
  variant?: 'wordmark' | 'full';
  className?: string;
}) {
  if (variant === 'wordmark') {
    return (
      <div
        className={`inline-flex items-center bg-[#2C120A] rounded-full px-3 sm:px-4 py-1.5 ${className}`}
      >
        <div className="relative flex items-center justify-center" style={{ height: 26, minWidth: 96 }}>
          <span
            className="absolute font-serif font-bold tracking-widest"
            style={{
              fontSize: 'clamp(16px, 4vw, 20px)',
              WebkitTextStroke: `1px ${GOLD}`,
              animation: 'logoPsSequence 10s ease infinite',
            }}
          >
            PS
          </span>
          <span
            className="absolute font-serif font-bold whitespace-nowrap"
            style={{
              fontSize: 'clamp(11px, 2.6vw, 13px)',
              color: GOLD,
              animation: 'logoFullSequence 10s ease infinite',
            }}
          >
            Purnota Shaj
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col items-center ${className}`}>
      <svg
        width="120"
        height="144"
        viewBox="0 0 200 240"
        style={{ overflow: 'visible', maxWidth: '100%', height: 'auto' }}
      >
        <path
          d="M50,225 C46,205 50,188 44,172 C50,160 42,148 48,135 C40,125 46,110 38,98 C46,88 40,72 50,60 C44,48 54,35 66,28 C60,18 72,10 86,10 C90,4 110,4 114,10 C128,10 140,18 134,28 C146,35 156,48 150,60 C160,72 154,88 162,98 C154,110 160,125 152,135 C158,148 150,160 156,172 C150,188 154,205 150,225"
          fill="none"
          stroke={GOLD_LINE}
          strokeWidth="1.4"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray="900"
          style={{ animation: 'logoSilhouetteDraw 10s ease infinite' }}
        />
        <path
          d="M60,92 C55,108 58,128 52,148"
          fill="none"
          stroke={GOLD_LINE}
          strokeWidth="1"
          strokeLinecap="round"
          strokeDasharray="300"
          style={{ animation: 'logoFeaturesDraw 10s ease infinite' }}
        />
        <path
          d="M75,85 C72,100 73,115 82,127 C88,134 94,138 100,139 C106,138 112,134 118,127 C127,115 128,100 125,85"
          fill="none"
          stroke={GOLD_LINE}
          strokeWidth="1.2"
          strokeLinecap="round"
          strokeDasharray="300"
          style={{ animation: 'logoFeaturesDraw 10s ease infinite' }}
        />
        <path
          d="M80,90 C85,87 91,87 96,89"
          fill="none"
          stroke={GOLD_LINE}
          strokeWidth="1"
          strokeLinecap="round"
          strokeDasharray="300"
          style={{ animation: 'logoFeaturesDraw 10s ease infinite' }}
        />
        <path
          d="M104,89 C109,87 115,87 120,90"
          fill="none"
          stroke={GOLD_LINE}
          strokeWidth="1"
          strokeLinecap="round"
          strokeDasharray="300"
          style={{ animation: 'logoFeaturesDraw 10s ease infinite' }}
        />
        <path
          d="M81,98 C85,96 91,96 95,98 M95,98 L98,96"
          fill="none"
          stroke={GOLD_LINE}
          strokeWidth="1"
          strokeLinecap="round"
          strokeDasharray="300"
          style={{ animation: 'logoFeaturesDraw 10s ease infinite' }}
        />
        <path
          d="M105,98 C109,96 115,96 119,98 M119,98 L122,96"
          fill="none"
          stroke={GOLD_LINE}
          strokeWidth="1"
          strokeLinecap="round"
          strokeDasharray="300"
          style={{ animation: 'logoFeaturesDraw 10s ease infinite' }}
        />
        <path
          d="M100,100 C99,106 98,112 97,116 C97,118 99,119 101,118"
          fill="none"
          stroke={GOLD_LINE}
          strokeWidth="1"
          strokeLinecap="round"
          strokeDasharray="300"
          style={{ animation: 'logoFeaturesDraw 10s ease infinite' }}
        />
        <path
          d="M91,124 C95,122 105,122 109,124 C105,127 95,127 91,124 Z"
          fill="none"
          stroke={GOLD_LINE}
          strokeWidth="1"
          strokeLinecap="round"
          strokeDasharray="300"
          style={{ animation: 'logoFeaturesDraw 10s ease infinite' }}
        />
        <path
          d="M84,138 C82,155 81,172 82,190"
          fill="none"
          stroke={GOLD_LINE}
          strokeWidth="1.2"
          strokeLinecap="round"
          strokeDasharray="300"
          style={{ animation: 'logoFeaturesDraw 10s ease infinite' }}
        />
        <path
          d="M116,138 C118,155 119,172 118,190"
          fill="none"
          stroke={GOLD_LINE}
          strokeWidth="1.2"
          strokeLinecap="round"
          strokeDasharray="300"
          style={{ animation: 'logoFeaturesDraw 10s ease infinite' }}
        />
        <g style={{ animation: 'logoJewelryAppear 10s ease infinite' }}>
          <path d="M91,124 C95,122 105,122 109,124 C105,127 95,127 91,124 Z" fill={CORAL} />
          <path d="M100,30 L100,58" fill="none" stroke={GOLD} strokeWidth="1" />
          <g style={{ transformOrigin: '100px 62px', animation: 'logoNosepinSparkle 2.6s ease-in-out infinite' }}>
            <circle cx="100" cy="61" r="2.6" fill={GOLD} />
            <path d="M100,64 L97,70 L103,70 Z" fill={GOLD} />
          </g>
          <g style={{ transformOrigin: '94px 114px', animation: 'logoNosepinSparkle 2.3s ease-in-out infinite' }}>
            <circle cx="94" cy="114" r="2.3" fill="none" stroke={GOLD} strokeWidth="1" />
          </g>
          <g style={{ transformOrigin: '68px 103px', animation: 'logoEarringSway 2.2s ease-in-out infinite' }}>
            <circle cx="68" cy="103" r="2.3" fill={GOLD} />
            <path d="M65,106 C64,112 72,112 71,106" fill="none" stroke={GOLD} strokeWidth="1" />
            <circle cx="68" cy="116" r="1.3" fill={GOLD} />
            <circle cx="68" cy="120" r="1.3" fill={GOLD} />
          </g>
          <g style={{ transformOrigin: '132px 103px', animation: 'logoEarringSway 2.2s ease-in-out infinite 0.3s' }}>
            <circle cx="132" cy="103" r="2.3" fill={GOLD} />
            <path d="M129,106 C128,112 136,112 135,106" fill="none" stroke={GOLD} strokeWidth="1" />
            <circle cx="132" cy="116" r="1.3" fill={GOLD} />
            <circle cx="132" cy="120" r="1.3" fill={GOLD} />
          </g>
        </g>
      </svg>
      <div className="relative flex items-center justify-center mt-2" style={{ height: 48, minWidth: 200 }}>
        <span
          className="absolute font-serif font-bold tracking-widest"
          style={{
            fontSize: 'clamp(30px, 8vw, 40px)',
            WebkitTextStroke: `1.5px ${GOLD}`,
            animation: 'logoPsSequence 10s ease infinite',
          }}
        >
          PS
        </span>
        <span
          className="absolute font-serif font-bold whitespace-nowrap"
          style={{
            fontSize: 'clamp(20px, 5.5vw, 26px)',
            color: GOLD,
            animation: 'logoFullSequence 10s ease infinite',
          }}
        >
          Purnota Shaj
        </span>
      </div>
    </div>
  );
}

// Section dividers — decorative horizontal ornaments used to separate
// homepage sections. Pure CSS-animated SVG, no client-side JS needed, so
// these render fine as server components wherever they're placed.

export function LotusDivider() {
  const beadDelays = [0.05, 0.15, 0.25, 0.35, 0.45, 0.55, 0.65, 0.75, 0.85, 0.95, 1.05, 1.15, 1.25, 1.35, 1.45];
  const beadRadii = [1.8, 1.8, 1.8, 1.8, 1.6, 1.6, 1.6, 1.6, 1.4, 1.4, 1.4, 1.2, 1.2, 1.2, 1.2];
  const leftXs = [290, 270, 250, 230, 210, 190, 170, 150, 130, 110, 90, 70, 50, 30, 10];
  const rightXs = [390, 410, 430, 450, 470, 490, 510, 530, 550, 570, 590, 610, 630, 650, 670];

  return (
    <svg viewBox="0 0 680 46" className="w-full h-auto" aria-hidden="true">
      <g fill="#D6336C">
        {leftXs.map((x, i) => (
          <circle key={x} cx={x} cy="23" r={beadRadii[i]} style={{ animation: `dividerBeadTwinkle 3.2s ease-in-out infinite`, animationDelay: `${beadDelays[i]}s`, transformOrigin: 'center', transformBox: 'fill-box' }} />
        ))}
        {rightXs.map((x, i) => (
          <circle key={x} cx={x} cy="23" r={beadRadii[i]} style={{ animation: `dividerBeadTwinkle 3.2s ease-in-out infinite`, animationDelay: `${beadDelays[i]}s`, transformOrigin: 'center', transformBox: 'fill-box' }} />
        ))}
      </g>
      <g style={{ animation: 'bannerGlow 4s ease-in-out infinite', transformOrigin: 'center', transformBox: 'fill-box' }}>
        <g fill="#D6336C" transform="translate(340,23)">
          <path d="M0 17 Q-12 3 0 -13 Q12 3 0 17Z" opacity="0.95" />
          <path d="M0 17 Q-22 9 -26 -7 Q-6 -3 0 17Z" opacity="0.85" />
          <path d="M0 17 Q22 9 26 -7 Q6 -3 0 17Z" opacity="0.85" />
          <path d="M0 17 Q-32 15 -40 1 Q-18 3 0 17Z" opacity="0.7" />
          <path d="M0 17 Q32 15 40 1 Q18 3 0 17Z" opacity="0.7" />
        </g>
        <circle cx="340" cy="21" r="3" fill="#F4C430" />
      </g>
    </svg>
  );
}

export function MarigoldDivider() {
  return (
    <svg viewBox="0 0 680 40" className="w-full h-auto" aria-hidden="true">
      <line x1="0" y1="20" x2="298" y2="20" stroke="#E8830E" strokeWidth="1" />
      <line x1="382" y1="20" x2="680" y2="20" stroke="#E8830E" strokeWidth="1" />
      <circle cx="340" cy="20" r="17" fill="#F4A623" opacity="0.5" />
      <g style={{ animation: 'bannerChakraSpin 6s linear infinite', transformOrigin: '340px 20px' }}>
        <g fill="#E8830E">
          <ellipse cx="340" cy="7" rx="5" ry="7" />
          <ellipse cx="352" cy="11" rx="5" ry="7" transform="rotate(45 352 11)" />
          <ellipse cx="356" cy="20" rx="5" ry="7" transform="rotate(90 356 20)" />
          <ellipse cx="352" cy="29" rx="5" ry="7" transform="rotate(135 352 29)" />
          <ellipse cx="340" cy="33" rx="5" ry="7" transform="rotate(180 340 33)" />
          <ellipse cx="328" cy="29" rx="5" ry="7" transform="rotate(225 328 29)" />
          <ellipse cx="324" cy="20" rx="5" ry="7" transform="rotate(270 324 20)" />
          <ellipse cx="328" cy="11" rx="5" ry="7" transform="rotate(315 328 11)" />
        </g>
      </g>
      <circle cx="340" cy="20" r="6" fill="#B5541F" />
    </svg>
  );
}

export function PeacockDivider() {
  return (
    <svg viewBox="0 0 680 50" className="w-full h-auto" aria-hidden="true">
      <line x1="0" y1="25" x2="308" y2="25" stroke="#0D3D33" strokeWidth="1" />
      <line x1="372" y1="25" x2="680" y2="25" stroke="#0D3D33" strokeWidth="1" />
      <path d="M340 46 L340 14" stroke="#1A6B57" strokeWidth="1.5" />
      <path d="M340 14 Q322 8 316 20 Q332 24 340 18 Q348 24 364 20 Q358 8 340 14Z" fill="#1A6B57" />
      <g style={{ animation: 'bannerGlow 4s ease-in-out infinite', transformOrigin: 'center', transformBox: 'fill-box' }}>
        <circle cx="340" cy="15" r="8" fill="none" stroke="#D4AF37" strokeWidth="1.5" />
        <circle cx="340" cy="15" r="4" fill="#2E9E80" />
      </g>
      <path d="M330 30 Q322 26 320 34 M350 30 Q358 26 360 34" stroke="#1A6B57" strokeWidth="1" fill="none" opacity="0.7" />
    </svg>
  );
}

export function MandalaDivider() {
  const outerPts = [
    [340.0, 2.0], [354.1, 7.9], [360.0, 22.0], [354.1, 36.1],
    [340.0, 42.0], [325.9, 36.1], [320.0, 22.0], [325.9, 7.9],
  ];
  const innerPts = [
    [340.0, 8.0], [349.9, 12.1], [354.0, 22.0], [349.9, 31.9],
    [340.0, 36.0], [330.1, 31.9], [326.0, 22.0], [330.1, 12.1],
  ];
  return (
    <svg viewBox="0 0 680 44" className="w-full h-auto" aria-hidden="true">
      <line x1="0" y1="22" x2="298" y2="22" stroke="#6B3FA0" strokeWidth="1" />
      <line x1="382" y1="22" x2="680" y2="22" stroke="#6B3FA0" strokeWidth="1" />
      <circle cx="340" cy="22" r="20" fill="none" stroke="#6B3FA0" strokeWidth="1" />
      <circle cx="340" cy="22" r="14" fill="none" stroke="#D4A024" strokeWidth="0.8" />
      <g style={{ animation: 'bannerChakraSpin 30s linear infinite', transformOrigin: '340px 22px' }}>
        <g fill="#D4A024">
          {outerPts.map(([x, y]) => <circle key={`o${x}${y}`} cx={x} cy={y} r="2.4" />)}
        </g>
        <g fill="#6B3FA0">
          {innerPts.map(([x, y]) => <circle key={`i${x}${y}`} cx={x} cy={y} r="1.7" />)}
        </g>
      </g>
      <circle cx="340" cy="22" r="4.5" fill="#6B3FA0" />
      <circle cx="340" cy="22" r="2" fill="#F4C430" />
    </svg>
  );
}

export function HennaDivider() {
  return (
    <svg viewBox="0 0 680 40" className="w-full h-auto" aria-hidden="true">
      <line x1="0" y1="20" x2="296" y2="20" stroke="#8A5A34" strokeWidth="1" />
      <line x1="384" y1="20" x2="680" y2="20" stroke="#8A5A34" strokeWidth="1" />
      <g style={{ animation: 'dividerSwirlPulse 3.5s ease-in-out infinite', transformOrigin: 'center', transformBox: 'fill-box' }}>
        <path d="M340 34 Q322 34 322 20 Q322 8 336 8 Q346 8 346 16 Q346 22 338 22 Q334 22 334 18" fill="none" stroke="#8A5A34" strokeWidth="1.3" />
      </g>
      <circle cx="358" cy="20" r="2.2" fill="#D4A024" style={{ animation: 'dividerSparkle 2.2s ease-in-out infinite', transformOrigin: 'center', transformBox: 'fill-box' }} />
      <circle cx="322" cy="34" r="1.8" fill="#D4A024" style={{ animation: 'dividerSparkle 2.2s ease-in-out infinite', animationDelay: '0.7s', transformOrigin: 'center', transformBox: 'fill-box' }} />
      <circle cx="304" cy="18" r="1.5" fill="#D4A024" style={{ animation: 'dividerSparkle 2.2s ease-in-out infinite', animationDelay: '1.4s', transformOrigin: 'center', transformBox: 'fill-box' }} />
      <path d="M304 20 Q312 16 318 20" fill="none" stroke="#8A5A34" strokeWidth="1.3" />
      <path d="M362 20 Q368 24 376 20" fill="none" stroke="#8A5A34" strokeWidth="1.3" />
      <circle cx="340" cy="20" r="2.5" fill="#D4A024" />
    </svg>
  );
}

export function DiyaDivider() {
  return (
    <svg viewBox="0 0 680 44" className="w-full h-auto" aria-hidden="true">
      <line x1="0" y1="28" x2="300" y2="28" stroke="#8A3B12" strokeWidth="1" />
      <line x1="380" y1="28" x2="680" y2="28" stroke="#8A3B12" strokeWidth="1" />
      <path d="M310 30 Q340 44 370 30 Q340 24 310 30Z" fill="#B5541F" />
      <g style={{ animation: 'bannerFlicker 1.3s ease-in-out infinite', transformOrigin: '340px 22px' }}>
        <path d="M340 22 Q334 12 340 4 Q346 12 340 22Z" fill="#F4C430" />
        <path d="M340 18 Q337 12 340 7 Q343 12 340 18Z" fill="#FFE9A8" />
      </g>
      <circle cx="310" cy="29" r="1.8" fill="#D4A024" /><circle cx="370" cy="29" r="1.8" fill="#D4A024" />
    </svg>
  );
}

export function BelPatraDivider() {
  return (
    <svg viewBox="0 0 680 38" className="w-full h-auto" aria-hidden="true">
      <line x1="0" y1="24" x2="302" y2="24" stroke="#2E7D6B" strokeWidth="1" />
      <line x1="378" y1="24" x2="680" y2="24" stroke="#2E7D6B" strokeWidth="1" />
      <g fill="#2E7D6B">
        <path d="M340 30 Q328 20 340 6 Q352 20 340 30Z" opacity="0.9" />
        <path d="M340 30 Q316 26 314 14 Q332 14 340 30Z" opacity="0.75" />
        <path d="M340 30 Q364 26 366 14 Q348 14 340 30Z" opacity="0.75" />
      </g>
      <line x1="340" y1="30" x2="340" y2="34" stroke="#8A5A34" strokeWidth="1.5" />
    </svg>
  );
}

export function TempleBellDivider() {
  return (
    <svg viewBox="0 0 680 46" className="w-full h-auto" aria-hidden="true">
      <line x1="0" y1="20" x2="306" y2="20" stroke="#D4A024" strokeWidth="1" />
      <line x1="374" y1="20" x2="680" y2="20" stroke="#D4A024" strokeWidth="1" />
      <circle cx="340" cy="4" r="2.5" fill="#D4A024" />
      <line x1="340" y1="4" x2="340" y2="12" stroke="#8A5A1F" strokeWidth="1.5" />
      <g style={{ animation: 'dividerPendulum 2.6s ease-in-out infinite', transformOrigin: '340px 12px' }}>
        <path d="M326 12 Q326 28 340 30 Q354 28 354 12 Z" fill="#D4A024" />
        <circle cx="340" cy="30" r="2" fill="#8A5A1F" />
        <line x1="340" y1="32" x2="340" y2="42" stroke="#8A5A1F" strokeWidth="1.3" />
        <circle cx="340" cy="44" r="2.2" fill="#B5541F" />
      </g>
    </svg>
  );
}

export function SwastikaDivider() {
  return (
    <svg viewBox="0 0 680 46" className="w-full h-auto" aria-hidden="true">
      <line x1="0" y1="23" x2="300" y2="23" stroke="#B3241F" strokeWidth="1" />
      <line x1="380" y1="23" x2="680" y2="23" stroke="#B3241F" strokeWidth="1" />
      <g style={{ animation: 'bannerGlow 4s ease-in-out infinite', transformOrigin: 'center', transformBox: 'fill-box' }}>
        <g transform="translate(340,23)" fill="#B3241F">
          <rect x="-3" y="-16" width="6" height="32" />
          <rect x="-16" y="-3" width="32" height="6" />
          <rect x="-3" y="-16" width="12" height="6" />
          <rect x="10" y="-3" width="6" height="12" />
          <rect x="-9" y="10" width="12" height="6" />
          <rect x="-16" y="-9" width="6" height="12" />
          <circle cx="20" cy="-20" r="2.2" />
          <circle cx="-20" cy="-20" r="2.2" />
          <circle cx="20" cy="20" r="2.2" />
          <circle cx="-20" cy="20" r="2.2" />
        </g>
      </g>
    </svg>
  );
}

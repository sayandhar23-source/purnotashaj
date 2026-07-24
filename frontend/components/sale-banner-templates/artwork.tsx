// Each artwork component fills its container (viewBox 0 0 306 280, matching the
// right-panel proportions) and paints its own background — no text is baked in
// here; the shell component overlays real, admin-editable HTML text separately.

export function FestiveSaleArt() {
  return (
    <svg viewBox="0 0 306 280" preserveAspectRatio="xMidYMid meet" className="absolute inset-0 w-full h-full" aria-hidden="true">
      <rect width="306" height="280" fill="#EAF4FB" />

      <g style={{ animation: 'bannerCloudDriftA 5s ease-in-out infinite' }}>
        <ellipse cx="41" cy="45" rx="22" ry="12" fill="#fff" />
        <ellipse cx="61" cy="40" rx="16" ry="10" fill="#fff" />
      </g>
      <g style={{ animation: 'bannerCloudDriftB 5s ease-in-out infinite' }}>
        <ellipse cx="241" cy="60" rx="24" ry="13" fill="#fff" />
        <ellipse cx="221" cy="55" rx="15" ry="9" fill="#fff" />
      </g>

      <rect x="96" y="235" width="115" height="12" rx="3" fill="#B3241F" />
      <rect x="106" y="222" width="95" height="14" fill="#8A1F1F" />
      <path d="M131 190 Q131 175 146 175 L161 175 Q176 175 176 190 L176 222 L131 222 Z" fill="#7A3FA0" />
      <rect x="108" y="150" width="91" height="72" fill="#8A2418" />
      <line x1="121" y1="150" x2="121" y2="222" stroke="#D4A024" strokeWidth="2" />
      <line x1="186" y1="150" x2="186" y2="222" stroke="#D4A024" strokeWidth="2" />
      <polygon points="123,146 131,132 139,146" fill="#2E7D6B" />
      <polygon points="143,146 153,130 163,146" fill="#B3241F" />
      <polygon points="167,146 175,132 183,146" fill="#D4A024" />
      <path d="M104 150 L203 150 L186 128 L121 128 Z" fill="#6B3FA0" />

      <path d="M106 140 C 106 90, 131 55, 153 40 C 175 55, 200 90, 200 140 Z" fill="#2E1A12" />
      <path d="M116 60 L186 128" stroke="#F5EEE0" strokeWidth="14" opacity="0.92" />
      <circle cx="123" cy="72" r="3" fill="#B3241F" />
      <circle cx="138" cy="87" r="3" fill="#B3241F" />
      <circle cx="153" cy="102" r="3" fill="#B3241F" />
      <circle cx="168" cy="117" r="3" fill="#B3241F" />

      <line x1="153" y1="40" x2="153" y2="18" stroke="#D4A024" strokeWidth="2" />
      <g style={{ animation: 'bannerGlow 5s ease-in-out infinite' }}>
        <circle cx="153" cy="16" r="6" fill="#D4A024" />
      </g>
      <g style={{ transformOrigin: '153px 20px', animation: 'bannerFlagSway 5s ease-in-out infinite' }}>
        <polygon points="153,20 178,28 153,36" fill="#B3241F" />
      </g>
    </svg>
  );
}

export function NormalDayArt() {
  return (
    <svg viewBox="0 0 306 280" preserveAspectRatio="xMidYMid meet" className="absolute inset-0 w-full h-full" aria-hidden="true">
      <rect width="306" height="280" fill="#F3DFC9" />
      <g fill="none" stroke="#B3652E" strokeWidth="1.4">
        <path d="M153 60 C 186 60, 206 90, 186 120 C 236 120, 246 160, 206 180 C 226 210, 196 240, 156 220 C 146 245, 106 245, 96 218 C 61 230, 36 200, 56 170 C 21 165, 16 125, 51 112 C 41 85, 71 60, 101 75 C 111 55, 141 50, 153 60 Z" />
      </g>
      <circle cx="126" cy="150" r="5" fill="#C87A3D" />
      <path d="M96 105 Q111 95 126 100 Q136 110 126 125 Q111 130 101 118 Q94 110 96 105 Z" fill="#D8A15C" />
      <path d="M171 95 Q186 88 198 98 Q204 112 191 122 Q176 122 169 110 Q166 100 171 95 Z" fill="#D8A15C" opacity="0.85" />
      <path d="M181 165 Q196 158 208 170 Q211 185 196 192 Q181 190 176 178 Q174 170 181 165 Z" fill="#D8A15C" opacity="0.7" />
      <path d="M81 175 Q96 168 106 180 Q108 195 94 200 Q81 197 76 185 Q74 178 81 175 Z" fill="#D8A15C" opacity="0.75" />
    </svg>
  );
}

export function IndependenceDayArt() {
  return (
    <svg viewBox="0 0 306 280" preserveAspectRatio="xMidYMid meet" className="absolute inset-0 w-full h-full" aria-hidden="true">
      <rect y="0" width="306" height="93.3" fill="#FF9933" />
      <rect y="93.3" width="306" height="93.3" fill="#FFFFFF" />
      <rect y="186.6" width="306" height="93.4" fill="#138808" />

      <g style={{ transformOrigin: '153px 140px', animation: 'bannerChakraSpin 12s linear infinite' }}>
        <circle cx="153" cy="140" r="58" fill="none" stroke="#0B3D91" strokeWidth="3" />
        <circle cx="153" cy="140" r="6" fill="#0B3D91" />
        <g stroke="#0B3D91" strokeWidth="2">
          <line x1="153" y1="82" x2="153" y2="198" />
          <line x1="95" y1="140" x2="211" y2="140" />
          <line x1="112" y1="99" x2="194" y2="181" />
          <line x1="112" y1="181" x2="194" y2="99" />
          <line x1="130" y1="85" x2="176" y2="195" />
          <line x1="176" y1="85" x2="130" y2="195" />
          <line x1="99" y1="115" x2="207" y2="165" />
          <line x1="99" y1="165" x2="207" y2="115" />
          <line x1="121" y1="90" x2="185" y2="190" />
          <line x1="185" y1="90" x2="121" y2="190" />
          <line x1="95" y1="128" x2="211" y2="152" />
          <line x1="95" y1="152" x2="211" y2="128" />
        </g>
      </g>
    </svg>
  );
}

export function DurgaPujaArt() {
  return (
    <svg viewBox="0 0 306 280" preserveAspectRatio="xMidYMid meet" className="absolute inset-0 w-full h-full" aria-hidden="true">
      <rect width="306" height="280" fill="#FFFFFF" />

      <g style={{ animation: 'bannerEyeShimmer 5s ease-in-out infinite' }}>
        <path d="M74 150 Q96 136 120 148 Q98 156 74 150 Z" fill="#1A1A1A" />
        <path d="M120 148 Q138 138 148 122" stroke="#B3241F" strokeWidth="4" strokeLinecap="round" fill="none" />
        <circle cx="91" cy="148" r="4" fill="#fff" />
      </g>
      <g style={{ animation: 'bannerEyeShimmer 5s ease-in-out infinite', opacity: 0.85 }}>
        <path d="M186 150 Q164 136 140 148 Q162 156 186 150 Z" fill="#1A1A1A" />
        <path d="M140 148 Q122 138 112 122" stroke="#B3241F" strokeWidth="4" strokeLinecap="round" fill="none" />
        <circle cx="169" cy="148" r="4" fill="#fff" />
      </g>

      <g style={{ transformOrigin: '130px 95px', animation: 'bannerBindiPulse 5s ease-in-out infinite' }}>
        <circle cx="130" cy="95" r="3.5" fill="#B3241F" />
      </g>
      <g style={{ transformOrigin: '130px 82px', animation: 'bannerBindiPulse 5s ease-in-out infinite', animationDelay: '0.3s' }}>
        <circle cx="130" cy="82" r="3" fill="#B3241F" />
      </g>
      <g style={{ transformOrigin: '130px 70px', animation: 'bannerBindiPulse 5s ease-in-out infinite', animationDelay: '0.6s' }}>
        <circle cx="130" cy="70" r="2.5" fill="#B3241F" />
      </g>
      <path d="M122 60 Q130 50 138 60 Q132 68 130 68 Q128 68 122 60 Z" fill="#B3241F" opacity="0.85" />

      <path d="M118 178 Q130 186 142 178 Q130 192 118 178 Z" fill="#B3241F" />

      <g style={{ transformOrigin: '226px 210px', animation: 'bannerTrishulSway 5s ease-in-out infinite' }}>
        <line x1="226" y1="210" x2="226" y2="110" stroke="#B3862E" strokeWidth="3" />
        <path d="M226 110 L226 80" stroke="#B3862E" strokeWidth="3" />
        <path d="M226 110 Q206 95 204 75" stroke="#B3862E" strokeWidth="3" fill="none" />
        <path d="M226 110 Q246 95 248 75" stroke="#B3862E" strokeWidth="3" fill="none" />
        <circle cx="226" cy="200" r="5" fill="#B3862E" />
      </g>
    </svg>
  );
}

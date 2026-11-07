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

export function DiwaliArt() {
  return (
    <svg viewBox="0 0 306 280" preserveAspectRatio="xMidYMid meet" className="absolute inset-0 w-full h-full" aria-hidden="true">
      <rect width="306" height="280" fill="#14284A" />
      <circle cx="153" cy="140" r="95" fill="none" stroke="#D4A024" strokeWidth="1" opacity="0.35" />
      <circle cx="153" cy="140" r="65" fill="none" stroke="#D4A024" strokeWidth="1" opacity="0.35" />
      <g fill="#D4A024" opacity="0.5">
        <circle cx="153" cy="55" r="4" /><circle cx="226" cy="90" r="4" /><circle cx="226" cy="190" r="4" />
        <circle cx="153" cy="225" r="4" /><circle cx="80" cy="190" r="4" /><circle cx="80" cy="90" r="4" />
      </g>
      <g transform="translate(93,150)"><path d="M0 20 Q30 40 60 20 Q45 10 30 10 Q15 10 0 20Z" fill="#B3241F" />
        <g style={{ transformOrigin: '30px 0px', animation: 'bannerGlow 5s ease-in-out infinite' }}>
          <path d="M30 8 Q26 -4 30 -14 Q34 -4 30 8Z" fill="#F4A623" />
        </g>
      </g>
      <g transform="translate(123,110)"><path d="M0 16 Q24 32 48 16 Q36 8 24 8 Q12 8 0 16Z" fill="#8A1F1F" />
        <path d="M24 6 Q21 -3 24 -11 Q27 -3 24 6Z" fill="#F4A623" />
      </g>
      <g transform="translate(153,150)"><path d="M0 20 Q30 40 60 20 Q45 10 30 10 Q15 10 0 20Z" fill="#B3241F" />
        <path d="M30 8 Q26 -4 30 -14 Q34 -4 30 8Z" fill="#F4A623" />
      </g>
    </svg>
  );
}

export function NewYearArt() {
  return (
    <svg viewBox="0 0 306 280" preserveAspectRatio="xMidYMid meet" className="absolute inset-0 w-full h-full" aria-hidden="true">
      <rect width="306" height="280" fill="#1A1A1A" />
      <g stroke="#D4A024" strokeWidth="2" opacity="0.8">
        <line x1="153" y1="80" x2="153" y2="200" /><line x1="93" y1="140" x2="213" y2="140" />
        <line x1="111" y1="98" x2="195" y2="182" /><line x1="111" y1="182" x2="195" y2="98" />
      </g>
      <g style={{ transformOrigin: '153px 140px', animation: 'bannerGlow 5s ease-in-out infinite' }}>
        <circle cx="153" cy="140" r="6" fill="#D4A024" />
      </g>
      <g fill="#D4A024">
        <circle cx="106" cy="90" r="3" /><circle cx="201" cy="95" r="3" /><circle cx="216" cy="180" r="3" />
        <circle cx="91" cy="185" r="3" /><circle cx="226" cy="140" r="2.5" /><circle cx="80" cy="140" r="2.5" />
      </g>
      <rect x="126" y="70" width="4" height="14" rx="2" fill="#F4E4C1" transform="rotate(30 128 77)" />
      <rect x="181" y="200" width="4" height="14" rx="2" fill="#F4E4C1" transform="rotate(-20 183 207)" />
    </svg>
  );
}

export function BridalArt() {
  return (
    <svg viewBox="0 0 306 280" preserveAspectRatio="xMidYMid meet" className="absolute inset-0 w-full h-full" aria-hidden="true">
      <rect width="306" height="280" fill="#EFC9CB" />
      <g style={{ transformOrigin: '153px 95px', animation: 'bannerGlow 5s ease-in-out infinite' }}>
        <circle cx="153" cy="95" r="10" fill="#C08A5A" />
      </g>
      <path d="M143 100 Q153 130 163 100" stroke="#C08A5A" strokeWidth="2" fill="none" />
      <path d="M131 130 Q153 165 175 130 Q164 118 153 118 Q142 118 131 130Z" fill="#C08A5A" />
      <g fill="#C08A5A"><circle cx="136" cy="175" r="3" /><circle cx="153" cy="182" r="3" /><circle cx="170" cy="175" r="3" /></g>
      <path d="M86 60 Q96 45 106 60 Q96 75 86 60Z" fill="#D98C99" opacity="0.7" />
      <path d="M206 210 Q216 195 226 210 Q216 225 206 210Z" fill="#D98C99" opacity="0.7" />
    </svg>
  );
}

export function MonsoonArt() {
  return (
    <svg viewBox="0 0 306 280" preserveAspectRatio="xMidYMid meet" className="absolute inset-0 w-full h-full" aria-hidden="true">
      <rect width="306" height="280" fill="#156363" />
      <path d="M106 100 Q153 60 200 100 L200 108 L106 108 Z" fill="#F4A623" />
      <line x1="153" y1="60" x2="153" y2="50" stroke="#F4A623" strokeWidth="3" />
      <path d="M153 108 L153 170 Q153 180 143 180" stroke="#2E2E2E" strokeWidth="3" fill="none" />
      <g fill="#8FD6D6" opacity="0.8">
        <g style={{ animation: 'bannerCloudDriftA 5s ease-in-out infinite' }}><path d="M76 60 q6 10 0 16 q-6 -6 0 -16Z" /></g>
        <g style={{ animation: 'bannerCloudDriftB 5s ease-in-out infinite' }}><path d="M226 70 q6 10 0 16 q-6 -6 0 -16Z" /></g>
        <g style={{ animation: 'bannerCloudDriftA 5s ease-in-out infinite' }}><path d="M66 150 q6 10 0 16 q-6 -6 0 -16Z" /></g>
        <g style={{ animation: 'bannerCloudDriftB 5s ease-in-out infinite' }}><path d="M236 160 q6 10 0 16 q-6 -6 0 -16Z" /></g>
        <path d="M96 210 q6 10 0 16 q-6 -6 0 -16Z" /><path d="M206 220 q6 10 0 16 q-6 -6 0 -16Z" />
      </g>
    </svg>
  );
}

export function SummerArt() {
  return (
    <svg viewBox="0 0 306 280" preserveAspectRatio="xMidYMid meet" className="absolute inset-0 w-full h-full" aria-hidden="true">
      <rect width="306" height="280" fill="#F4C430" />
      <g style={{ transformOrigin: '153px 130px', animation: 'bannerGlow 5s ease-in-out infinite' }}>
        <circle cx="153" cy="130" r="38" fill="#fff" opacity="0.9" />
      </g>
      <g stroke="#fff" strokeWidth="4" opacity="0.9">
        <line x1="153" y1="70" x2="153" y2="55" /><line x1="153" y1="190" x2="153" y2="205" />
        <line x1="93" y1="130" x2="78" y2="130" /><line x1="213" y1="130" x2="228" y2="130" />
        <line x1="111" y1="88" x2="101" y2="78" /><line x1="195" y1="172" x2="205" y2="182" />
        <line x1="111" y1="172" x2="101" y2="182" /><line x1="195" y1="88" x2="205" y2="78" />
      </g>
      <g transform="translate(76,220)"><circle r="6" fill="#E85D3D" /><circle cx="10" cy="-4" r="6" fill="#fff" opacity="0.85" /><circle cx="-10" cy="-4" r="6" fill="#fff" opacity="0.85" /><circle cx="0" cy="-14" r="6" fill="#fff" opacity="0.85" /></g>
      <g transform="translate(226,60)"><circle r="5" fill="#E85D3D" /><circle cx="8" cy="-3" r="5" fill="#fff" opacity="0.85" /><circle cx="-8" cy="-3" r="5" fill="#fff" opacity="0.85" /><circle cx="0" cy="-11" r="5" fill="#fff" opacity="0.85" /></g>
    </svg>
  );
}

export function WinterArt() {
  return (
    <svg viewBox="0 0 306 280" preserveAspectRatio="xMidYMid meet" className="absolute inset-0 w-full h-full" aria-hidden="true">
      <rect width="306" height="280" fill="#2E5C8A" />
      <g stroke="#DCEEFB" strokeWidth="2" strokeLinecap="round">
        <g style={{ transformOrigin: '116px 110px', animation: 'bannerCloudDriftA 5s ease-in-out infinite' }} transform="translate(116,110)"><line x1="-22" y1="0" x2="22" y2="0" /><line x1="0" y1="-22" x2="0" y2="22" /><line x1="-15" y1="-15" x2="15" y2="15" /><line x1="-15" y1="15" x2="15" y2="-15" /></g>
        <g style={{ transformOrigin: '201px 160px', animation: 'bannerCloudDriftB 5s ease-in-out infinite' }} transform="translate(201,160) scale(0.6)"><line x1="-22" y1="0" x2="22" y2="0" /><line x1="0" y1="-22" x2="0" y2="22" /><line x1="-15" y1="-15" x2="15" y2="15" /><line x1="-15" y1="15" x2="15" y2="-15" /></g>
        <g transform="translate(76,200) scale(0.5)"><line x1="-22" y1="0" x2="22" y2="0" /><line x1="0" y1="-22" x2="0" y2="22" /><line x1="-15" y1="-15" x2="15" y2="15" /><line x1="-15" y1="15" x2="15" y2="-15" /></g>
        <g transform="translate(226,70) scale(0.4)"><line x1="-22" y1="0" x2="22" y2="0" /><line x1="0" y1="-22" x2="0" y2="22" /><line x1="-15" y1="-15" x2="15" y2="15" /><line x1="-15" y1="15" x2="15" y2="-15" /></g>
      </g>
    </svg>
  );
}

export function ValentineArt() {
  return (
    <svg viewBox="0 0 306 280" preserveAspectRatio="xMidYMid meet" className="absolute inset-0 w-full h-full" aria-hidden="true">
      <rect width="306" height="280" fill="#C94F6D" />
      <g style={{ transformOrigin: '153px 140px', animation: 'bannerGlow 5s ease-in-out infinite' }}>
        <path d="M153 175 C126 150, 116 120, 136 105 C146 97, 153 105, 153 115 C153 105, 160 97, 170 105 C190 120, 180 150, 153 175 Z" fill="#fff" opacity="0.95" />
      </g>
      <path d="M86 90 C76 80, 71 68, 81 60 C86 56, 90 60, 90 65 C90 60, 94 56, 99 60 C109 68, 104 80, 86 90 Z" fill="#fff" opacity="0.6" />
      <path d="M221 200 C214 193, 211 185, 218 179 C221 176, 224 179, 224 182 C224 179, 227 176, 230 179 C237 185, 234 193, 221 200 Z" fill="#fff" opacity="0.6" />
    </svg>
  );
}

export function HoliArt() {
  return (
    <svg viewBox="0 0 306 280" preserveAspectRatio="xMidYMid meet" className="absolute inset-0 w-full h-full" aria-hidden="true">
      <rect width="306" height="280" fill="#FDEDD9" />
      <circle cx="126" cy="110" r="30" fill="#E85D3D" opacity="0.85" />
      <circle cx="186" cy="90" r="24" fill="#2E7D6B" opacity="0.85" />
      <circle cx="216" cy="160" r="28" fill="#4A6FD4" opacity="0.85" />
      <circle cx="136" cy="190" r="22" fill="#F4C430" opacity="0.85" />
      <circle cx="86" cy="160" r="18" fill="#C94F6D" opacity="0.85" />
      <g fill="#fff" opacity="0.7">
        <circle cx="96" cy="80" r="3" /><circle cx="246" cy="120" r="3" /><circle cx="66" cy="200" r="3" /><circle cx="226" cy="220" r="3" />
      </g>
    </svg>
  );
}

export function EidArt() {
  return (
    <svg viewBox="0 0 306 280" preserveAspectRatio="xMidYMid meet" className="absolute inset-0 w-full h-full" aria-hidden="true">
      <rect width="306" height="280" fill="#175443" />
      <g style={{ transformOrigin: '186px 118px', animation: 'bannerGlow 5s ease-in-out infinite' }}>
        <path d="M186 90 A28 28 0 1 0 186 146 A22 22 0 1 1 186 90 Z" fill="#D4A024" />
      </g>
      <g fill="#D4A024"><circle cx="116" cy="80" r="2.5" /><circle cx="236" cy="100" r="2" /><circle cx="226" cy="60" r="1.8" /></g>
      <line x1="106" y1="130" x2="106" y2="150" stroke="#D4A024" strokeWidth="2" />
      <path d="M88 150 L124 150 L118 200 Q106 210 94 200 Z" fill="none" stroke="#D4A024" strokeWidth="2" />
      <line x1="88" y1="165" x2="124" y2="165" stroke="#D4A024" strokeWidth="1.5" />
      <circle cx="106" cy="185" r="4" fill="#D4A024" />
    </svg>
  );
}

export function ChristmasArt() {
  return (
    <svg viewBox="0 0 306 280" preserveAspectRatio="xMidYMid meet" className="absolute inset-0 w-full h-full" aria-hidden="true">
      <rect width="306" height="280" fill="#8B1A1A" />
      <line x1="153" y1="70" x2="153" y2="85" stroke="#D4A024" strokeWidth="2" />
      <rect x="145" y="63" width="16" height="8" rx="2" fill="#D4A024" />
      <g style={{ transformOrigin: '153px 130px', animation: 'bannerGlow 5s ease-in-out infinite' }}>
        <circle cx="153" cy="130" r="38" fill="#0D3320" />
        <path d="M153 92 Q186 130 153 168 Q120 130 153 92Z" fill="#D4A024" opacity="0.3" />
      </g>
      <g stroke="#fff" strokeWidth="1.5" opacity="0.85">
        <g transform="translate(86,200) scale(0.5)"><line x1="-22" y1="0" x2="22" y2="0" /><line x1="0" y1="-22" x2="0" y2="22" /><line x1="-15" y1="-15" x2="15" y2="15" /><line x1="-15" y1="15" x2="15" y2="-15" /></g>
        <g transform="translate(226,90) scale(0.4)"><line x1="-22" y1="0" x2="22" y2="0" /><line x1="0" y1="-22" x2="0" y2="22" /><line x1="-15" y1="-15" x2="15" y2="15" /><line x1="-15" y1="15" x2="15" y2="-15" /></g>
      </g>
    </svg>
  );
}

export function MegaSaleArt() {
  return (
    <svg viewBox="0 0 306 280" preserveAspectRatio="xMidYMid meet" className="absolute inset-0 w-full h-full" aria-hidden="true">
      <rect width="306" height="280" fill="#F4C430" />
      <g style={{ transformOrigin: '153px 130px', animation: 'bannerGlow 5s ease-in-out infinite' }} transform="translate(126,90) rotate(-12)">
        <path d="M0 20 L60 20 L90 50 L60 80 L0 80 Z" fill="#111111" />
        <circle cx="20" cy="50" r="8" fill="#F4C430" />
      </g>
      <text x="153" y="200" fontSize="34" fontWeight="700" fill="#111111" textAnchor="middle" fontFamily="Georgia, serif">%</text>
    </svg>
  );
}

export function NewArrivalsArt() {
  return (
    <svg viewBox="0 0 306 280" preserveAspectRatio="xMidYMid meet" className="absolute inset-0 w-full h-full" aria-hidden="true">
      <rect width="306" height="280" fill="#DCE3D3" />
      <g fill="none" stroke="#5C7A5C" strokeWidth="1.6">
        <path d="M153 220 L153 90" />
        <path d="M153 190 Q186 175 196 145" />
        <path d="M153 160 Q120 145 110 115" />
        <path d="M153 130 Q181 118 188 95" />
        <path d="M153 110 Q125 100 118 78" />
      </g>
      <g fill="#5C7A5C" opacity="0.5">
        <ellipse cx="196" cy="140" rx="10" ry="5" transform="rotate(-20 196 140)" />
        <ellipse cx="110" cy="112" rx="10" ry="5" transform="rotate(20 110 112)" />
        <ellipse cx="188" cy="92" rx="8" ry="4" transform="rotate(-25 188 92)" />
        <ellipse cx="118" cy="75" rx="8" ry="4" transform="rotate(25 118 75)" />
      </g>
    </svg>
  );
}

export function FreeShippingArt() {
  return (
    <svg viewBox="0 0 306 280" preserveAspectRatio="xMidYMid meet" className="absolute inset-0 w-full h-full" aria-hidden="true">
      <rect width="306" height="280" fill="#2E4FA3" />
      <g transform="translate(113,100)">
        <polygon points="40,0 80,20 40,40 0,20" fill="#fff" />
        <polygon points="0,20 40,40 40,90 0,70" fill="#DCE6FF" />
        <polygon points="80,20 40,40 40,90 80,70" fill="#B8C9F5" />
        <line x1="20" y1="10" x2="60" y2="30" stroke="#2E4FA3" strokeWidth="2" />
      </g>
      <g style={{ transformOrigin: '246px 90px', animation: 'bannerGlow 5s ease-in-out infinite' }}>
        <circle cx="246" cy="90" r="16" fill="#F4C430" />
        <path d="M239 90 L244 96 L254 84" stroke="#2E4FA3" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </g>
    </svg>
  );
}

export function BestSellersArt() {
  return (
    <svg viewBox="0 0 306 280" preserveAspectRatio="xMidYMid meet" className="absolute inset-0 w-full h-full" aria-hidden="true">
      <rect width="306" height="280" fill="#C96A3D" />
      <g style={{ transformOrigin: '153px 140px', animation: 'bannerGlow 5s ease-in-out infinite' }} transform="translate(153,140)" fill="#F4C430">
        <polygon points="0,-55 13,-16 54,-16 21,7 33,46 0,22 -33,46 -21,7 -54,-16 -13,-16" />
      </g>
      <circle cx="153" cy="140" r="20" fill="#C96A3D" />
      <text x="153" y="147" fontSize="18" fontWeight="700" fill="#F4C430" textAnchor="middle">#1</text>
    </svg>
  );
}

export function VipArt() {
  return (
    <svg viewBox="0 0 306 280" preserveAspectRatio="xMidYMid meet" className="absolute inset-0 w-full h-full" aria-hidden="true">
      <rect width="306" height="280" fill="#1A1A1A" />
      <circle cx="153" cy="140" r="60" fill="none" stroke="#D4A024" strokeWidth="1" opacity="0.4" />
      <g style={{ transformOrigin: '153px 135px', animation: 'bannerGlow 5s ease-in-out infinite' }} transform="translate(113,120)" fill="none" stroke="#D4A024" strokeWidth="2.5" strokeLinejoin="round">
        <polygon points="0,30 0,10 20,22 40,5 60,22 80,10 80,30" />
      </g>
      <circle cx="113" cy="10" r="3" fill="#D4A024" /><circle cx="153" cy="5" r="3" fill="#D4A024" /><circle cx="193" cy="10" r="3" fill="#D4A024" />
    </svg>
  );
}

export function VaranasiGhatsArt() {
  return (
    <svg viewBox="0 0 300 230" preserveAspectRatio="xMidYMid meet" className="absolute inset-0 w-full h-full" aria-hidden="true">
      <defs>
        <linearGradient id="sky1" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#2B1710" /><stop offset="100%" stopColor="#5C3018" />
        </linearGradient>
        <linearGradient id="river1" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1F3A4A" /><stop offset="100%" stopColor="#0F2530" />
        </linearGradient>
      </defs>
      <rect width="300" height="230" fill="url(#sky1)" />
      <circle style={{ animation: 'bannerGlow 5s ease-in-out infinite' }} cx="230" cy="45" r="26" fill="#F4C430" opacity="0.25" />
      <g fill="#2B1408">
        <polygon points="20,150 20,95 30,70 40,95 40,150" />
        <polygon points="45,150 45,110 55,85 65,110 65,150" />
        <rect x="70" y="120" width="14" height="30" />
        <polygon points="90,150 90,80 102,50 114,80 114,150" />
        <polygon points="120,150 120,105 130,80 140,105 140,150" />
        <rect x="145" y="115" width="12" height="35" />
        <polygon points="160,150 160,90 172,60 184,90 184,150" />
      </g>
      <g fill="#F4C430" opacity="0.8">
        <circle cx="30" cy="68" r="2.5" /><circle cx="102" cy="48" r="2.5" /><circle cx="172" cy="58" r="2.5" />
      </g>
      <g fill="#6B3A20">
        <rect x="0" y="150" width="300" height="12" /><rect x="0" y="162" width="300" height="12" /><rect x="0" y="174" width="300" height="12" />
      </g>
      <rect y="186" width="300" height="44" fill="url(#river1)" />
      <g style={{ transformOrigin: '150px 205px', animation: 'bannerRipple 3s ease-out infinite' }}>
        <ellipse cx="150" cy="205" rx="18" ry="4" fill="none" stroke="#F4C430" strokeWidth="1" />
      </g>
      <g style={{ animation: 'bannerCloudDriftA 5s ease-in-out infinite' }}>
        <circle cx="90" cy="205" r="3.5" fill="#F4C430" /><circle cx="90" cy="203" r="1.5" fill="#FFD97A" />
        <circle cx="180" cy="212" r="3.5" fill="#F4C430" /><circle cx="180" cy="210" r="1.5" fill="#FFD97A" />
        <circle cx="220" cy="200" r="3" fill="#F4C430" />
      </g>
      <g style={{ transformOrigin: '245px 150px', animation: 'bannerTrishulSway 4s ease-in-out infinite' }}>
        <rect x="240" y="120" width="10" height="35" fill="#E8B93D" />
        <circle cx="245" cy="112" r="7" fill="#3D1A0F" />
        <path d="M235 130 L225 115" stroke="#E8B93D" strokeWidth="4" strokeLinecap="round" />
        <g style={{ transformOrigin: '222px 112px', animation: 'bannerFlicker 1.4s ease-in-out infinite' }}>
          <path d="M222 118 Q216 108 222 98 Q228 108 222 118Z" fill="#F4C430" />
        </g>
      </g>
      <rect x="6" y="6" width="288" height="218" fill="none" stroke="#F4C430" strokeWidth="1" opacity="0.5" />
    </svg>
  );
}

export function MadhubaniArt() {
  return (
    <svg viewBox="0 0 300 230" preserveAspectRatio="xMidYMid meet" className="absolute inset-0 w-full h-full" aria-hidden="true">
      <defs>
        <linearGradient id="mad1" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#E0A05C" /><stop offset="100%" stopColor="#C97C34" />
        </linearGradient>
      </defs>
      <rect width="300" height="230" fill="url(#mad1)" />
      <g style={{ animation: 'bannerGlow 5s ease-in-out infinite' }} stroke="#4A0E1E" strokeWidth="2" fill="none">
        <circle cx="150" cy="75" r="28" />
        <path d="M150 47 L150 103 M122 75 L178 75" />
        <path d="M130 55 L170 95 M170 55 L130 95" />
        <circle cx="150" cy="75" r="10" fill="#4A0E1E" />
      </g>
      <g stroke="#4A0E1E" strokeWidth="1.4" fill="none">
        <path d="M150 47 L142 30 M150 47 L150 25 M150 47 L158 30" />
      </g>
      <g stroke="#4A0E1E" strokeWidth="1.6" fill="none">
        <path d="M55 145 Q90 122 125 145 Q90 168 55 145Z" />
        <path d="M55 145 L38 135 M55 145 L38 155" />
        <circle cx="100" cy="140" r="3" fill="#4A0E1E" />
        <path d="M175 155 Q210 132 245 155 Q210 178 175 155Z" />
        <path d="M245 155 L262 145 M245 155 L262 165" />
        <circle cx="200" cy="150" r="3" fill="#4A0E1E" />
      </g>
      <g stroke="#4A0E1E" strokeWidth="1.2" fill="none" opacity="0.75">
        <path d="M150 178 Q140 195 150 210 Q160 195 150 178Z" />
        <path d="M130 195 Q140 195 150 210 Q140 205 130 195Z" />
        <path d="M170 195 Q160 195 150 210 Q160 205 170 195Z" />
      </g>
      <g stroke="#4A0E1E" strokeWidth="1" opacity="0.55">
        <path d="M15 25 Q30 15 45 25 Q30 35 15 25Z" />
        <path d="M255 25 Q270 15 285 25 Q270 35 255 25Z" />
        <path d="M15 205 Q30 195 45 205" />
        <path d="M255 205 Q270 195 285 205" />
      </g>
      <g stroke="#4A0E1E" strokeWidth="1" opacity="0.5">
        <path d="M20 190 Q150 205 280 190" />
        <path d="M20 20 Q150 5 280 20" />
      </g>
      <rect x="6" y="6" width="288" height="218" fill="none" stroke="#4A0E1E" strokeWidth="1" opacity="0.5" />
    </svg>
  );
}

export function KeralaKathakaliArt() {
  return (
    <svg viewBox="0 0 300 230" preserveAspectRatio="xMidYMid meet" className="absolute inset-0 w-full h-full" aria-hidden="true">
      <defs>
        <linearGradient id="ker1" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1D7A63" /><stop offset="100%" stopColor="#0D4638" />
        </linearGradient>
      </defs>
      <rect width="300" height="230" fill="url(#ker1)" />
      <circle style={{ animation: 'bannerGlow 5s ease-in-out infinite' }} cx="240" cy="45" r="22" fill="#F4C430" opacity="0.3" />
      <rect y="150" width="300" height="80" fill="#0D4638" />
      <g style={{ transformOrigin: '150px 175px', animation: 'bannerRipple 3s ease-out infinite' }}>
        <ellipse cx="150" cy="175" rx="30" ry="5" fill="none" stroke="#F4C430" strokeWidth="0.8" />
      </g>
      <g style={{ animation: 'bannerCloudDriftA 5s ease-in-out infinite' }}>
        <path d="M50 150 Q150 130 250 150 L235 172 Q150 158 65 172 Z" fill="#5C3A1E" />
        <path d="M65 150 Q150 138 235 150" fill="none" stroke="#3D2814" strokeWidth="1.5" />
        <rect x="105" y="112" width="90" height="38" rx="5" fill="#EDE6D6" />
        <rect x="112" y="120" width="18" height="16" fill="#8A5A34" />
        <rect x="140" y="120" width="18" height="16" fill="#8A5A34" />
        <rect x="168" y="120" width="18" height="16" fill="#8A5A34" />
        <path d="M98 112 Q150 85 202 112 Z" fill="#B5541F" />
        <path d="M98 112 Q150 92 202 112" fill="none" stroke="#7A3410" strokeWidth="1.5" />
      </g>
      <g style={{ transformOrigin: '45px 95px', animation: 'bannerTrishulSway 4s ease-in-out infinite' }}>
        <ellipse cx="45" cy="95" rx="5" ry="55" fill="#1F7A5C" />
        <path d="M45 45 Q20 20 8 38 M45 45 Q70 20 82 38 M45 45 Q45 12 45 32 M45 45 Q25 55 12 60 M45 45 Q65 55 78 60" stroke="#1F7A5C" strokeWidth="4" fill="none" strokeLinecap="round" />
      </g>
      <g style={{ transformOrigin: '265px 80px', animation: 'bannerFlagSway 4s ease-in-out infinite' }}>
        <ellipse cx="265" cy="80" rx="5" ry="60" fill="#1F7A5C" />
        <path d="M265 25 Q240 5 228 22 M265 25 Q290 5 302 22 M265 25 Q265 -5 265 15" stroke="#1F7A5C" strokeWidth="4" fill="none" strokeLinecap="round" />
      </g>
      <g transform="translate(255,150)">
        <circle r="16" fill="#0A2A22" stroke="#D6336C" strokeWidth="2" />
        <path d="M-9 -3 Q0 -10 9 -3" stroke="#F4C430" strokeWidth="1.5" fill="none" />
        <circle cx="-4" cy="0" r="2" fill="#F4C430" /><circle cx="4" cy="0" r="2" fill="#F4C430" />
        <path d="M-6 6 Q0 10 6 6" stroke="#D6336C" strokeWidth="1.5" fill="none" />
      </g>
      <rect x="6" y="6" width="288" height="218" fill="none" stroke="#F4C430" strokeWidth="1" opacity="0.5" />
    </svg>
  );
}

export function RangoliArt() {
  return (
    <svg viewBox="0 0 300 230" preserveAspectRatio="xMidYMid meet" className="absolute inset-0 w-full h-full" aria-hidden="true">
      <rect width="300" height="230" fill="#FDEDD9" />
      <g style={{ transformOrigin: '150px 115px', animation: 'bannerChakraSpin 24s linear infinite' }}>
        <circle cx="150" cy="115" r="72" fill="none" stroke="#D6336C" strokeWidth="1.3" />
        <circle cx="150" cy="115" r="58" fill="none" stroke="#F4C430" strokeWidth="1.3" />
        <circle cx="150" cy="115" r="44" fill="none" stroke="#2E7D6B" strokeWidth="1.3" />
        <circle cx="150" cy="115" r="30" fill="none" stroke="#6B3FA0" strokeWidth="1.3" />
        <g fill="#D6336C" opacity="0.85">
          <path d="M150 43 Q158 58 150 72 Q142 58 150 43Z" />
          <path d="M150 187 Q158 172 150 158 Q142 172 150 187Z" />
          <path d="M78 115 Q93 107 107 115 Q93 123 78 115Z" />
          <path d="M222 115 Q207 107 193 115 Q207 123 222 115Z" />
        </g>
        <g fill="#F4C430" opacity="0.85">
          <path d="M99 64 Q112 68 116 81 Q101 79 99 64Z" />
          <path d="M201 166 Q188 162 184 149 Q199 151 201 166Z" />
          <path d="M201 64 Q188 68 184 81 Q199 79 201 64Z" />
          <path d="M99 166 Q112 162 116 149 Q101 151 99 166Z" />
        </g>
        <g fill="#2E7D6B">
          <circle cx="150" cy="85" r="4" /><circle cx="150" cy="145" r="4" /><circle cx="120" cy="115" r="4" /><circle cx="180" cy="115" r="4" />
        </g>
      </g>
      <circle cx="150" cy="115" r="12" fill="#4A0E1E" />
      <circle cx="150" cy="115" r="6" fill="#F4C430" />
      <g style={{ animation: 'bannerEyeShimmer 3s ease-in-out infinite' }} fill="#D6336C" opacity="0.6">
        <circle cx="40" cy="35" r="2" /><circle cx="260" cy="40" r="2" /><circle cx="35" cy="195" r="2" /><circle cx="265" cy="190" r="2" />
      </g>
      <rect x="6" y="6" width="288" height="218" fill="none" stroke="#D6336C" strokeWidth="1" opacity="0.5" />
    </svg>
  );
}

export function GaneshaArt() {
  return (
    <svg viewBox="0 0 300 230" preserveAspectRatio="xMidYMid meet" className="absolute inset-0 w-full h-full" aria-hidden="true">
      <defs>
        <radialGradient id="gan1" cx="50%" cy="40%" r="65%">
          <stop offset="0%" stopColor="#C05A20" /><stop offset="100%" stopColor="#8A3B12" />
        </radialGradient>
      </defs>
      <rect width="300" height="230" fill="url(#gan1)" />
      <circle style={{ animation: 'bannerGlow 5s ease-in-out infinite' }} cx="150" cy="118" r="78" fill="none" stroke="#F4C430" strokeWidth="1" opacity="0.4" />
      <circle cx="150" cy="118" r="62" fill="none" stroke="#F4C430" strokeWidth="0.6" opacity="0.3" />
      <polygon points="125,58 150,32 175,58" fill="#F4C430" />
      <polygon points="132,58 150,42 168,58" fill="#8A3B12" />
      <circle cx="150" cy="28" r="5" fill="#F4C430" />
      <circle cx="130" cy="52" r="3" fill="#D6336C" /><circle cx="170" cy="52" r="3" fill="#D6336C" />
      <ellipse cx="95" cy="108" rx="20" ry="30" fill="#5C2A0D" />
      <ellipse cx="95" cy="108" rx="13" ry="21" fill="#7A3A15" />
      <ellipse cx="205" cy="108" rx="20" ry="30" fill="#5C2A0D" />
      <ellipse cx="205" cy="108" rx="13" ry="21" fill="#7A3A15" />
      <ellipse cx="150" cy="100" rx="30" ry="32" fill="#5C2A0D" />
      <path d="M150 120 Q130 145 145 170 Q160 185 150 200" stroke="#5C2A0D" strokeWidth="17" fill="none" strokeLinecap="round" />
      <path d="M150 120 Q130 145 145 170 Q160 185 150 200" stroke="#7A3A15" strokeWidth="9" fill="none" strokeLinecap="round" />
      <circle cx="141" cy="93" r="4.5" fill="#FFF3E0" /><circle cx="159" cy="93" r="4.5" fill="#FFF3E0" />
      <circle cx="141" cy="93" r="2" fill="#2B1408" /><circle cx="159" cy="93" r="2" fill="#2B1408" />
      <path d="M138 78 Q150 72 162 78" stroke="#F4C430" strokeWidth="1.5" fill="none" />
      <path d="M168 108 L180 118" stroke="#FFF3E0" strokeWidth="4" strokeLinecap="round" />
      <rect x="118" y="196" width="64" height="30" rx="8" fill="#5C2A0D" />
      <path d="M118 196 Q150 205 182 196" fill="none" stroke="#F4C430" strokeWidth="1.5" />
      <circle cx="150" cy="205" r="4" fill="#F4C430" />
      <g fill="#F4C430" opacity="0.75">
        <circle cx="60" cy="60" r="2" /><circle cx="240" cy="60" r="2" /><circle cx="55" cy="180" r="2" /><circle cx="245" cy="180" r="2" />
      </g>
      <rect x="6" y="6" width="288" height="218" fill="none" stroke="#F4C430" strokeWidth="1" opacity="0.5" />
    </svg>
  );
}

import React from 'react';

export const FoundHandoverIllustration = ({ width = 170, height = 140, className = '', style = {} }) => {
  return (
    <svg 
      width={width} 
      height={height} 
      viewBox="0 0 210 180" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ display: 'block', maxWidth: '100%', height: 'auto', ...style }}
    >
      <defs>
        <radialGradient id="foundGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#E0E7FF" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#EEF2FF" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Background soft glow */}
      <circle cx="110" cy="90" r="50" fill="url(#foundGlow)" />

      {/* Ground Floor Line */}
      <path d="M20 162 H195" stroke="#E2DDD5" strokeWidth="2" strokeLinecap="round" />

      {/* Center Table / Pedestal */}
      <rect x="88" y="118" width="34" height="44" rx="3" fill="#D97706" />
      <rect x="85" y="115" width="40" height="5" rx="2" fill="#B45309" />
      {/* Box on the table */}
      <path d="M92 98 L118 98 L122 115 L88 115 Z" fill="#FBBF24" />
      <path d="M88 102 H122" stroke="#D97706" strokeWidth="1.5" />
      <rect x="100" y="105" width="10" height="8" rx="1" fill="#FFFFFF" />

      {/* PERSON 1: WOMAN (LEFT) */}
      {/* Legs & Navy Skirt */}
      <path d="M50 115 L46 156 L40 156 L44 115 Z" fill="#FBCFE8" />
      <path d="M58 115 L62 156 L68 156 L64 115 Z" fill="#FBCFE8" />
      <path d="M38 156 H48 V160 H36 C36 158 37 156 38 156 Z" fill="#1E293B" />
      <path d="M60 156 H70 C71 156 72 158 72 160 H60 Z" fill="#1E293B" />
      <path d="M42 88 L68 88 L72 118 L38 118 Z" fill="#1E293B" />

      {/* Mustard / Orange Sweater */}
      <path d="M44 56 C50 53 60 53 66 56 L68 90 H42 Z" fill="#F59E0B" />
      <path d="M52 54 Q55 58 58 54 Z" fill="#FEF3C7" />

      {/* Head & Hair */}
      <path d="M53 46 H57 V56 H53 Z" fill="#FBCFE8" />
      <circle cx="55" cy="40" r="10" fill="#FBCFE8" />
      {/* Black bob hair */}
      <path d="M44 42 C44 32 52 28 62 30 C68 32 68 38 67 44 C63 42 59 42 55 43 C50 43 46 45 44 46 Z" fill="#0F172A" />
      <path d="M44 42 C44 48 47 52 48 54 L44 50 Z" fill="#0F172A" />
      {/* Eye & Smile */}
      <circle cx="60" cy="39" r="1" fill="#0F172A" />
      <path d="M59 44 Q62 46 64 43" stroke="#9A3412" strokeWidth="0.8" fill="none" />

      {/* Left arm holding key forward */}
      <path d="M64 62 L85 70 L83 75 L64 69 Z" fill="#D97706" />
      <circle cx="87" cy="72" r="3.5" fill="#FBCFE8" />
      {/* Golden key held in hand */}
      <circle cx="93" cy="71" r="3" stroke="#F59E0B" strokeWidth="1.5" fill="none" />
      <path d="M96 71 H103 M101 71 V74 M99 71 V73" stroke="#F59E0B" strokeWidth="1.5" strokeLinecap="round" />

      {/* Right arm at side */}
      <path d="M44 62 L38 80 L43 82 L48 66 Z" fill="#D97706" />
      <circle cx="39" cy="83" r="3.5" fill="#FBCFE8" />


      {/* PERSON 2: MAN IN BLUE SUIT (RIGHT) */}
      {/* Blue Pants */}
      <path d="M148 114 L146 156 L139 156 L142 114 Z" fill="#1D4ED8" />
      <path d="M156 114 L158 156 L165 156 L161 114 Z" fill="#1D4ED8" />
      <path d="M137 156 H148 V160 H135 C135 158 136 156 137 156 Z" fill="#0F172A" />
      <path d="M156 156 H167 C168 156 169 158 169 160 H156 Z" fill="#0F172A" />

      {/* Royal Blue Blazer & White Shirt */}
      <path d="M140 54 C146 50 162 50 168 54 L169 114 C163 116 145 116 139 114 Z" fill="#2563EB" />
      {/* White V-neck shirt */}
      <path d="M150 52 L154 74 L158 52 Z" fill="#FFFFFF" />
      <path d="M154 58 L154 74" stroke="#CBD5E1" strokeWidth="1" />

      {/* Head & Hair */}
      <path d="M151 44 H157 V54 H151 Z" fill="#FBCFE8" />
      <circle cx="154" cy="38" r="11" fill="#FBCFE8" />
      {/* Man's neat dark hair */}
      <path d="M144 38 C144 28 154 26 163 28 C166 30 166 36 165 38 C160 36 155 36 152 38 Z" fill="#0F172A" />
      {/* Eye & Smile */}
      <circle cx="149" cy="37" r="1" fill="#0F172A" />
      <path d="M147 42 Q150 44 153 41" stroke="#9A3412" strokeWidth="0.8" fill="none" />

      {/* Arms reaching to the box */}
      <path d="M140 60 L118 84 L123 88 L144 66 Z" fill="#1D4ED8" />
      <circle cx="118" cy="88" r="4" fill="#FBCFE8" />

      <path d="M168 62 L152 86 L146 83 L162 60 Z" fill="#1E40AF" />
      <circle cx="148" cy="87" r="3.5" fill="#FBCFE8" />
    </svg>
  );
};

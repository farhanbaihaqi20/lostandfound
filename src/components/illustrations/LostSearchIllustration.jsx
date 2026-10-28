import React from 'react';

export const LostSearchIllustration = ({ width = 160, height = 140, className = '', style = {} }) => {
  return (
    <svg 
      width={width} 
      height={height} 
      viewBox="0 0 200 180" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ display: 'block', maxWidth: '100%', height: 'auto', ...style }}
    >
      <defs>
        <linearGradient id="lensGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#A5F3FC" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#38BDF8" stopOpacity="0.4" />
        </linearGradient>
        <radialGradient id="sunGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FDE68A" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#FEF3C7" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Background Soft Glow & Plant */}
      <circle cx="155" cy="115" r="32" fill="url(#sunGlow)" />
      
      {/* Potted Plant in background */}
      <path d="M150 145 L154 130 L166 130 L170 145 Z" fill="#D97706" />
      <path d="M148 130 H172 V127 H148 Z" fill="#B45309" />
      {/* Plant leaves */}
      <path d="M160 127 Q150 115 152 102 Q158 114 160 127 Z" fill="#059669" />
      <path d="M160 127 Q168 112 174 105 Q172 118 160 127 Z" fill="#10B981" />
      <path d="M160 120 Q162 105 160 92 Q157 105 160 120 Z" fill="#34D399" />

      {/* Floor Ground Line */}
      <path d="M30 162 H180" stroke="#E2DDD5" strokeWidth="2" strokeLinecap="round" />

      {/* Footprint tracks on ground */}
      <g opacity="0.35">
        {/* Footprint 1 */}
        <ellipse cx="60" cy="162" rx="4" ry="2" fill="#92400E" />
        <circle cx="66" cy="162" r="1" fill="#92400E" />
        {/* Footprint 2 */}
        <ellipse cx="80" cy="160" rx="4" ry="2" fill="#92400E" />
        <circle cx="86" cy="160" r="1" fill="#92400E" />
      </g>

      {/* Man Figure */}
      {/* Left Leg */}
      <path d="M96 112 L92 154 L84 154 L88 112 Z" fill="#78350F" />
      <path d="M84 154 H94 V158 H82 C82 156 83 154 84 154 Z" fill="#1E293B" />

      {/* Right Leg (front) */}
      <path d="M106 112 L112 153 L122 153 L116 112 Z" fill="#92400E" />
      <path d="M112 153 H124 C126 153 127 155 126 158 H110 L112 153 Z" fill="#1E293B" />

      {/* Torso / Rust Orange Sweater */}
      <path 
        d="M86 64 C90 60 112 60 120 64 L124 100 C124 106 122 114 104 114 C88 114 84 106 84 100 Z" 
        fill="#EA580C" 
      />
      {/* Sweater shadows / folds */}
      <path d="M88 98 C94 102 114 102 120 98 L122 108 C116 113 94 113 86 108 Z" fill="#C2410C" opacity="0.5" />
      
      {/* Collar */}
      <path d="M97 62 Q103 67 109 62 Q105 70 97 62 Z" fill="#FFFFFF" />

      {/* Head & Neck */}
      <path d="M100 52 H106 V64 H100 Z" fill="#FBCFE8" />
      <circle cx="103" cy="46" r="12" fill="#FBCFE8" />
      {/* Face Beard */}
      <path d="M97 48 C97 54 103 57 108 55 C110 52 110 47 110 47 Z" fill="#78350F" opacity="0.3" />
      {/* Hair */}
      <path 
        d="M93 44 C93 35 102 32 111 34 C116 36 118 40 116 44 C113 41 110 41 106 42 C101 42 96 43 93 44 Z" 
        fill="#451A03" 
      />
      {/* Nose & Eye */}
      <circle cx="106" cy="45" r="1.2" fill="#1E293B" />
      <path d="M109 46 L111 48 L109 49" stroke="#9A3412" strokeWidth="1" strokeLinecap="round" />

      {/* Left Arm (Behind) */}
      <path d="M86 66 L74 88 L80 93 L90 74 Z" fill="#C2410C" />
      <circle cx="75" cy="91" r="4" fill="#FBCFE8" />

      {/* Right Arm (Holding Magnifying Glass) */}
      <path d="M118 68 L138 88 L132 94 L114 76 Z" fill="#EA580C" />
      {/* Forearm extending forward */}
      <path d="M136 89 L148 98 L144 104 L132 94 Z" fill="#FBCFE8" />

      {/* Magnifying Glass */}
      {/* Handle */}
      <rect 
        x="146" 
        y="99" 
        width="6" 
        height="18" 
        rx="2" 
        transform="rotate(-40 146 99)" 
        fill="#1E293B" 
      />
      {/* Rim */}
      <circle 
        cx="162" 
        cy="114" 
        r="18" 
        stroke="#1E293B" 
        strokeWidth="4" 
        fill="url(#lensGrad)" 
      />
      {/* Reflection arc */}
      <path 
        d="M152 108 A 12 12 0 0 1 170 106" 
        stroke="#FFFFFF" 
        strokeWidth="2.5" 
        strokeLinecap="round" 
        opacity="0.8" 
      />
    </svg>
  );
};

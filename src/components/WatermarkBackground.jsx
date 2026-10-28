import React from 'react';

export const WatermarkBackground = () => {
  return (
    <div 
      className="watermark-layer"
      style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 0,
        overflow: 'hidden'
      }}
      aria-hidden="true"
    >
      {/* 1. Magnifying Glass (Top Left) */}
      <svg 
        width="150" 
        height="150" 
        viewBox="0 0 100 100" 
        fill="none" 
        stroke="#A89F91" 
        strokeWidth="2.2"
        style={{
          position: 'absolute',
          top: '90px',
          left: '28px',
          opacity: 0.28,
          transform: 'rotate(-25deg)'
        }}
      >
        <circle cx="60" cy="40" r="24" />
        <line x1="43" y1="57" x2="16" y2="84" strokeWidth="4" strokeLinecap="round" />
        <path d="M52 28 A 15 15 0 0 1 68 34" strokeWidth="1.8" strokeLinecap="round" />
      </svg>

      {/* 2. Shoe Footprints (Top Right) */}
      <svg 
        width="110" 
        height="140" 
        viewBox="0 0 80 110" 
        fill="none" 
        style={{
          position: 'absolute',
          top: '95px',
          right: '50px',
          opacity: 0.26,
          transform: 'rotate(22deg)'
        }}
      >
        {/* Footprint 1 */}
        <path 
          d="M24 38 C16 38 12 48 12 60 C12 70 17 76 22 76 C28 76 34 70 34 60 C34 48 30 38 24 38 Z" 
          stroke="#A89F91" 
          strokeWidth="2" 
          strokeDasharray="3 3"
        />
        <circle cx="23" cy="28" r="3.5" fill="#A89F91" opacity="0.4" />
        <circle cx="17" cy="30" r="2.5" fill="#A89F91" opacity="0.4" />
        <circle cx="30" cy="31" r="2.5" fill="#A89F91" opacity="0.4" />
        
        {/* Footprint 2 (stepping forward) */}
        <path 
          d="M58 14 C50 14 46 24 46 36 C46 46 51 52 56 52 C62 52 68 46 68 36 C68 24 64 14 58 14 Z" 
          stroke="#A89F91" 
          strokeWidth="2" 
          strokeDasharray="3 3"
        />
        <circle cx="57" cy="4" r="3.5" fill="#A89F91" opacity="0.4" />
        <circle cx="51" cy="6" r="2.5" fill="#A89F91" opacity="0.4" />
        <circle cx="64" cy="7" r="2.5" fill="#A89F91" opacity="0.4" />
      </svg>

      {/* 3. Key Outline (Middle Right) */}
      <svg 
        width="90" 
        height="120" 
        viewBox="0 0 60 90" 
        fill="none" 
        stroke="#A89F91" 
        strokeWidth="2.2"
        style={{
          position: 'absolute',
          top: '46%',
          right: '42px',
          opacity: 0.24,
          transform: 'rotate(45deg)'
        }}
      >
        <circle cx="30" cy="22" r="14" />
        <circle cx="30" cy="22" r="6" />
        <line x1="30" y1="36" x2="30" y2="78" strokeWidth="3" strokeLinecap="round" />
        <line x1="30" y1="62" x2="40" y2="62" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="30" y1="74" x2="42" y2="74" strokeWidth="2.5" strokeLinecap="round" />
      </svg>

      {/* 4. Footprints (Bottom Left) */}
      <svg 
        width="110" 
        height="150" 
        viewBox="0 0 80 110" 
        fill="none" 
        style={{
          position: 'absolute',
          bottom: '120px',
          left: '35px',
          opacity: 0.25,
          transform: 'rotate(-18deg)'
        }}
      >
        <path 
          d="M26 38 C18 38 14 48 14 60 C14 70 19 76 24 76 C30 76 36 70 36 60 C36 48 32 38 26 38 Z" 
          stroke="#A89F91" 
          strokeWidth="2" 
          strokeDasharray="3 3"
        />
        <circle cx="25" cy="28" r="3.5" fill="#A89F91" opacity="0.4" />
        <circle cx="19" cy="30" r="2.5" fill="#A89F91" opacity="0.4" />
        <circle cx="32" cy="31" r="2.5" fill="#A89F91" opacity="0.4" />
        
        <path 
          d="M58 65 C50 65 46 75 46 87 C46 97 51 103 56 103 C62 103 68 97 68 87 C68 75 64 65 58 65 Z" 
          stroke="#A89F91" 
          strokeWidth="2" 
          strokeDasharray="3 3"
        />
        <circle cx="57" cy="55" r="3.5" fill="#A89F91" opacity="0.4" />
        <circle cx="51" cy="57" r="2.5" fill="#A89F91" opacity="0.4" />
        <circle cx="64" cy="58" r="2.5" fill="#A89F91" opacity="0.4" />
      </svg>

      {/* 5. Cardboard Parcel Box Outline (Bottom Right) */}
      <svg 
        width="120" 
        height="120" 
        viewBox="0 0 90 90" 
        fill="none" 
        stroke="#A89F91" 
        strokeWidth="2"
        style={{
          position: 'absolute',
          bottom: '70px',
          right: '55px',
          opacity: 0.25,
          transform: 'rotate(-6deg)'
        }}
      >
        {/* Isometric Box */}
        <path d="M45 15 L78 32 L45 49 L12 32 Z" />
        <path d="M12 32 V62 L45 80 V49 Z" />
        <path d="M78 32 V62 L45 80" />
        {/* Center Tape Line */}
        <path d="M28 23 L62 40" strokeDasharray="3 2" />
        <path d="M45 49 V80" strokeWidth="2.5" />
      </svg>
    </div>
  );
};

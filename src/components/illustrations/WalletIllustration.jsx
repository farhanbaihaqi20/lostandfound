import React from 'react';

export const WalletIllustration = ({ width = '100%', height = '100%', className = '', style = {} }) => {
  return (
    <svg 
      width={width} 
      height={height} 
      viewBox="0 0 160 120" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ display: 'block', margin: 'auto', maxHeight: '140px', ...style }}
    >
      {/* Background Soft Blue Container */}
      <rect width="160" height="120" fill="#E0F2FE" />
      
      {/* Cash / Bills Sticking Out */}
      <g transform="rotate(-15 65 55)">
        <rect x="50" y="32" width="46" height="26" rx="2" fill="#86EFAC" stroke="#16A34A" strokeWidth="1" />
        <circle cx="73" cy="45" r="4" fill="#BBF7D0" />
      </g>
      <g transform="rotate(5 80 50)">
        <rect x="65" y="30" width="48" height="26" rx="2" fill="#4ADE80" stroke="#15803D" strokeWidth="1" />
        <circle cx="89" cy="43" r="4" fill="#86EFAC" />
      </g>

      {/* Main Navy Wallet Body */}
      <rect x="42" y="48" width="76" height="52" rx="7" fill="#1E293B" />
      {/* Wallet Inner Flap / Stitch Line */}
      <path d="M46 54 H114" stroke="#334155" strokeWidth="1.5" strokeDasharray="3 2" />
      
      {/* Gold Coins Stack */}
      <ellipse cx="108" cy="85" rx="10" ry="7" fill="#D97706" />
      <ellipse cx="108" cy="83" rx="10" ry="7" fill="#FBBF24" />
      <ellipse cx="108" cy="83" rx="7" ry="5" stroke="#F59E0B" strokeWidth="1" fill="none" />
      
      <ellipse cx="100" cy="90" rx="11" ry="8" fill="#B45309" />
      <ellipse cx="100" cy="87" rx="11" ry="8" fill="#F59E0B" />
      <ellipse cx="100" cy="87" rx="8" ry="5.5" stroke="#D97706" strokeWidth="1" fill="none" />

      {/* Wallet Clasp / Button */}
      <path d="M102 68 H120 C123 68 125 71 125 74 C125 77 123 80 120 80 H102 Z" fill="#334155" />
      <circle cx="118" cy="74" r="3.5" fill="#FBBF24" />
    </svg>
  );
};

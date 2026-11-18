import React from 'react';

interface LogoProps {
  size?: number;
  className?: string;
  showText?: boolean;
}

export const SamskarthaLogo: React.FC<LogoProps> = ({ size = 36, className = '', showText = false }) => {
  return (
    <div className={`samskartha-logo-wrap ${className}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '10px' }}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="samskartha-emblem"
      >
        <defs>
          {/* Gradients representing refinement and purification */}
          <linearGradient id="reformerGold" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F5D061" />
            <stop offset="50%" stopColor="#E6A122" />
            <stop offset="100%" stopColor="#C47A0E" />
          </linearGradient>

          <linearGradient id="catalystTeal" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#1D6B5D" />
            <stop offset="50%" stopColor="#2E8B7B" />
            <stop offset="100%" stopColor="#48DFCA" />
          </linearGradient>

          <linearGradient id="prismLight" x1="50%" y1="0%" x2="50%" y2="100%">
            <stop offset="0%" stopColor="#48DFCA" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#18384A" stopOpacity="0.9" />
          </linearGradient>

          <filter id="glowEffect" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Outer Sacred Geometric Hexagon / Octagon of Reformation (Samskara) */}
        <polygon
          points="50,4 88,25 88,75 50,96 12,75 12,25"
          stroke="url(#catalystTeal)"
          strokeWidth="2.5"
          strokeDasharray="4 2"
          fill="url(#prismLight)"
          fillOpacity="0.12"
        />

        {/* Inner Faceted Diamond Prism (Refining raw input into coherent intelligence) */}
        <polygon
          points="50,14 80,50 50,86 20,50"
          stroke="url(#reformerGold)"
          strokeWidth="2"
          fill="url(#catalystTeal)"
          fillOpacity="0.25"
        />

        {/* Central Lotus Flame of Purification (संस्कर्ता Agni of Refinement) */}
        <path
          d="M50 20 C54 36 68 44 68 58 C68 68 60 76 50 76 C40 76 32 68 32 58 C32 44 46 36 50 20 Z"
          fill="url(#reformerGold)"
          filter="url(#glowEffect)"
          opacity="0.9"
        />

        {/* Inner Golden Quill Core / Prompt Arrow */}
        <path
          d="M50 26 L56 54 L50 64 L44 54 Z"
          fill="#FFFFFF"
        />

        {/* Dynamic Energy Sparks (Catalytic transmutation) */}
        <circle cx="50" cy="50" r="3" fill="#FFFFFF" filter="url(#glowEffect)" />
        <circle cx="28" cy="34" r="2" fill="#F5D061" />
        <circle cx="72" cy="34" r="2" fill="#48DFCA" />
        <circle cx="28" cy="66" r="2" fill="#48DFCA" />
        <circle cx="72" cy="66" r="2" fill="#F5D061" />
      </svg>

      {showText && (
        <span className="samskartha-title-font" style={{ fontSize: `${size * 0.65}px` }}>
          Samskartha
        </span>
      )}
    </div>
  );
};

export default SamskarthaLogo;

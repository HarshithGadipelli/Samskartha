import React, { useState } from 'react';

interface CatalystProps {
  className?: string;
  size?: number;
}

export const CatalystGraphic: React.FC<CatalystProps> = ({ className = '', size = 180 }) => {
  const [imgError, setImgError] = useState(false);

  return (
    <div className={`catalyst-container ${className}`} style={{ textAlign: 'center' }}>
      {!imgError ? (
        <img
          src="/images/catalyst-experiment.png"
          alt="Science Catalyst Experiment"
          onError={() => setImgError(true)}
          style={{
            maxWidth: `${size}px`,
            width: '100%',
            height: 'auto',
            borderRadius: '16px',
            boxShadow: '0 10px 30px rgba(46, 139, 123, 0.25)',
            border: '1px solid var(--panel-border)',
            transition: 'transform 0.3s ease',
            display: 'inline-block'
          }}
          className="catalyst-img"
        />
      ) : (
        /* Vector SVG Fallback: Scientific Catalyst Flask & Energy Vectors */
        <svg
          width={size}
          height={size}
          viewBox="0 0 200 200"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="catalyst-svg"
        >
          <defs>
            <linearGradient id="flaskLiquid" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#2e8b7b" stopOpacity="0.95" />
            </linearGradient>
            <linearGradient id="glowRays" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#48dfca" />
              <stop offset="100%" stopColor="#f59e0b" />
            </linearGradient>
            <filter id="flaskGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Stand & Heating Ring */}
          <ellipse cx="100" cy="180" rx="60" ry="12" fill="var(--panel-border)" opacity="0.6" />
          <path d="M70 180 L100 165 L130 180" stroke="var(--text-light)" strokeWidth="2" strokeLinecap="round" />

          {/* Glass Laboratory Flask Body */}
          <path
            d="M90 25 L110 25 L110 65 L155 145 C165 162 150 172 135 172 L65 172 C50 172 35 162 45 145 L90 65 Z"
            stroke="var(--accent)"
            strokeWidth="3.5"
            strokeLinejoin="round"
            fill="var(--panel-sub)"
            fillOpacity="0.4"
          />

          {/* Liquid & Catalyst Reaction Solution */}
          <path
            d="M55 130 Q100 115 145 130 L150 148 C158 162 145 170 132 170 L68 170 C55 170 42 162 50 148 Z"
            fill="url(#flaskLiquid)"
          />

          {/* Catalytic Solid Mesh Surface (Accelerating Reaction) */}
          <rect x="75" y="152" width="50" height="8" rx="4" fill="#f59e0b" filter="url(#flaskGlow)" />
          <line x1="82" y1="152" x2="82" y2="160" stroke="#fff" strokeWidth="1.5" />
          <line x1="92" y1="152" x2="92" y2="160" stroke="#fff" strokeWidth="1.5" />
          <line x1="102" y1="152" x2="102" y2="160" stroke="#fff" strokeWidth="1.5" />
          <line x1="112" y1="152" x2="112" y2="160" stroke="#fff" strokeWidth="1.5" />

          {/* Rising Bubbles & Energetic Particles (Transmutation) */}
          <circle cx="85" cy="138" r="4.5" fill="#ffffff" opacity="0.9" filter="url(#flaskGlow)" />
          <circle cx="115" cy="128" r="3.5" fill="#ffffff" opacity="0.8" />
          <circle cx="98" cy="115" r="5" fill="#48dfca" filter="url(#flaskGlow)" />
          <circle cx="100" cy="85" r="4" fill="#38bdf8" />
          <circle cx="94" cy="50" r="3" fill="#f59e0b" />

          {/* Reaction Energy Waves */}
          <path d="M30 110 Q40 100 35 90" stroke="url(#glowRays)" strokeWidth="2" strokeLinecap="round" />
          <path d="M170 110 Q160 100 165 90" stroke="url(#glowRays)" strokeWidth="2" strokeLinecap="round" />
          <path d="M25 140 Q35 130 30 120" stroke="url(#glowRays)" strokeWidth="2" strokeLinecap="round" />
          <path d="M175 140 Q165 130 170 120" stroke="url(#glowRays)" strokeWidth="2" strokeLinecap="round" />
        </svg>
      )}
    </div>
  );
};

export default CatalystGraphic;

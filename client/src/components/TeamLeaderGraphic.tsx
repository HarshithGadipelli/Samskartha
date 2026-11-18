import React, { useState } from 'react';

interface TeamLeaderProps {
  className?: string;
  size?: number;
}

export const TeamLeaderGraphic: React.FC<TeamLeaderProps> = ({ className = '', size = 320 }) => {
  const [imgError, setImgError] = useState(false);

  return (
    <div className={`team-leader-container ${className}`} style={{ textAlign: 'center' }}>
      {!imgError ? (
        <img
          src="/images/team-leader-strength.png"
          alt="Leader Empowering Team Strength"
          onError={() => setImgError(true)}
          style={{
            maxWidth: `${size}px`,
            width: '100%',
            height: 'auto',
            borderRadius: '16px',
            boxShadow: '0 12px 36px rgba(0, 0, 0, 0.28)',
            border: '1px solid var(--panel-border)',
            transition: 'transform 0.3s ease',
            display: 'inline-block'
          }}
          className="team-leader-img"
        />
      ) : (
        /* Vector SVG: Visionary Leader Radiating Strength and Empowering Group */
        <svg
          width={size}
          height={size * 0.7}
          viewBox="0 0 400 280"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="team-leader-svg"
        >
          <defs>
            <linearGradient id="leaderAura" x1="50%" y1="0%" x2="50%" y2="100%">
              <stop offset="0%" stopColor="#48dfca" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#2e8b7b" stopOpacity="0.2" />
            </linearGradient>

            <linearGradient id="empowerBeam" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f5d061" />
              <stop offset="100%" stopColor="#38bdf8" />
            </linearGradient>

            <filter id="leaderGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="6" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Radiant Aura of Strength from Center */}
          <circle cx="200" cy="110" r="85" fill="url(#leaderAura)" filter="url(#leaderGlow)" />

          {/* Connecting Energy Waves to Group Members */}
          <path d="M200 120 Q130 110 80 160" stroke="url(#empowerBeam)" strokeWidth="3" strokeDasharray="6 4" opacity="0.85" />
          <path d="M200 120 Q160 140 135 180" stroke="url(#empowerBeam)" strokeWidth="3" strokeDasharray="6 4" opacity="0.85" />
          <path d="M200 120 Q240 140 265 180" stroke="url(#empowerBeam)" strokeWidth="3" strokeDasharray="6 4" opacity="0.85" />
          <path d="M200 120 Q270 110 320 160" stroke="url(#empowerBeam)" strokeWidth="3" strokeDasharray="6 4" opacity="0.85" />

          {/* --- CENTRAL LEADER (Elevated & Strong) --- */}
          {/* Leader Head */}
          <circle cx="200" cy="65" r="18" fill="var(--text-main)" />
          {/* Leader Torso & Outstretched Empowering Arms */}
          <path
            d="M170 115 C170 95 180 88 200 88 C220 88 230 95 230 115 L235 175 L165 175 Z"
            fill="var(--accent)"
          />
          {/* Empowering Outstretched Arms Lifting the Group */}
          <path
            d="M140 125 Q165 100 185 98"
            stroke="var(--accent)"
            strokeWidth="8"
            strokeLinecap="round"
          />
          <path
            d="M260 125 Q235 100 215 98"
            stroke="var(--accent)"
            strokeWidth="8"
            strokeLinecap="round"
          />

          {/* --- LEFT GROUP MEMBERS (Becoming Strong & Confident) --- */}
          {/* Member 1 (Far Left) */}
          <circle cx="80" cy="130" r="14" fill="var(--text-muted)" />
          <path d="M60 185 C60 155 70 150 80 150 C90 150 100 155 100 185 Z" fill="var(--panel-sub)" stroke="var(--accent-border)" strokeWidth="2" />
          {/* Upraised fist of strength */}
          <path d="M60 150 L52 135" stroke="var(--accent)" strokeWidth="5" strokeLinecap="round" />

          {/* Member 2 (Mid Left) */}
          <circle cx="135" cy="140" r="15" fill="var(--text-main)" />
          <path d="M112 205 C112 170 122 165 135 165 C148 165 158 170 158 205 Z" fill="var(--panel-sub)" stroke="var(--accent-border)" strokeWidth="2" />

          {/* --- RIGHT GROUP MEMBERS (Empowered & Aligned) --- */}
          {/* Member 3 (Mid Right) */}
          <circle cx="265" cy="140" r="15" fill="var(--text-main)" />
          <path d="M242 205 C242 170 252 165 265 165 C278 165 288 170 288 205 Z" fill="var(--panel-sub)" stroke="var(--accent-border)" strokeWidth="2" />

          {/* Member 4 (Far Right) */}
          <circle cx="320" cy="130" r="14" fill="var(--text-muted)" />
          <path d="M300 185 C300 155 310 150 320 150 C330 150 340 155 340 185 Z" fill="var(--panel-sub)" stroke="var(--accent-border)" strokeWidth="2" />
          {/* Upraised fist of strength */}
          <path d="M340 150 L348 135" stroke="var(--accent)" strokeWidth="5" strokeLinecap="round" />

          {/* Strength Radiance Sparks */}
          <polygon points="200,32 204,42 214,46 204,50 200,60 196,50 186,46 196,42" fill="#f5d061" filter="url(#leaderGlow)" />
          <circle cx="52" cy="130" r="3" fill="#48dfca" />
          <circle cx="348" cy="130" r="3" fill="#48dfca" />
        </svg>
      )}
    </div>
  );
};

export default TeamLeaderGraphic;

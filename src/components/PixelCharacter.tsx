import React from 'react';

interface PixelCharacterProps {
  showHat?: boolean;
  showGlasses?: boolean;
}

const PixelCharacter: React.FC<PixelCharacterProps> = ({ showHat = false, showGlasses = false }) => (
  <svg viewBox="0 0 120 140" className="w-[110px] h-[126px]" style={{ imageRendering: 'pixelated' }}>
    {showHat && (
      <g>
        <rect x="28" y="0" width="64" height="10" fill="hsl(var(--coin))" />
        <rect x="38" y="-9" width="44" height="12" fill="#a07020" />
      </g>
    )}
    {/* Head */}
    <rect x="36" y="8" width="48" height="48" fill="hsl(var(--foreground))" />
    <rect x="40" y="12" width="40" height="40" fill="hsl(var(--surface))" />
    {/* Eyes */}
    <rect x="48" y="24" width="8" height="8" fill="hsl(var(--foreground))" />
    <rect x="64" y="24" width="8" height="8" fill="hsl(var(--foreground))" />
    {/* Mouth */}
    <rect x="52" y="40" width="16" height="4" fill="hsl(var(--foreground))" />
    {/* Body */}
    <rect x="32" y="60" width="56" height="48" fill="hsl(var(--foreground))" />
    <rect x="36" y="64" width="48" height="40" fill="hsl(var(--surface))" />
    <rect x="36" y="88" width="48" height="5" fill="hsl(var(--border))" />
    {/* Arms */}
    <rect x="16" y="64" width="16" height="36" fill="hsl(var(--foreground))" />
    <rect x="20" y="68" width="8" height="28" fill="hsl(var(--surface))" />
    <rect x="88" y="64" width="16" height="36" fill="hsl(var(--foreground))" />
    <rect x="92" y="68" width="8" height="28" fill="hsl(var(--surface))" />
    {/* Legs */}
    <rect x="40" y="108" width="16" height="24" fill="hsl(var(--foreground))" />
    <rect x="64" y="108" width="16" height="24" fill="hsl(var(--foreground))" />
    {/* Feet */}
    <rect x="36" y="128" width="24" height="8" fill="hsl(var(--foreground))" />
    <rect x="60" y="128" width="24" height="8" fill="hsl(var(--foreground))" />
    {showGlasses && (
      <g>
        <rect x="44" y="22" width="14" height="12" fill="none" stroke="#1a6a9c" strokeWidth="3" />
        <rect x="62" y="22" width="14" height="12" fill="none" stroke="#1a6a9c" strokeWidth="3" />
        <rect x="58" y="26" width="4" height="2" fill="#1a6a9c" />
      </g>
    )}
  </svg>
);

export default PixelCharacter;

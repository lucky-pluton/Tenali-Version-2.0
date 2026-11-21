import React from 'react';

export interface GulabJamunEmojiProps {
  size?: number | string;
  variant?: 'bowl' | 'piece';
  className?: string;
  style?: React.CSSProperties;
}

/**
 * GulabJamunEmoji
 * A custom vector emoji component representing authentic Indian Gulab Jamun:
 * - Rich caramelized golden-brown dumplings
 * - Glistening amber rose-sugar syrup (chashni)
 * - Chopped emerald green pistachios & delicate crimson saffron threads
 * - Available as a bowl (3 sweets in katori) or single piece
 */
export default function GulabJamunEmoji({
  size = 52,
  variant = 'bowl',
  className = '',
  style = {}
}: GulabJamunEmojiProps) {
  const pixelSize = typeof size === 'number' ? `${size}px` : size;

  if (variant === 'piece') {
    return (
      <svg
        width={pixelSize}
        height={pixelSize}
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        style={{ display: 'inline-block', verticalAlign: 'middle', filter: 'drop-shadow(0 2px 5px rgba(0,0,0,0.25))', ...style }}
        role="img"
        aria-label="Gulab Jamun"
      >
        <defs>
          {/* Syrup Puddle Gradient */}
          <radialGradient id="gjSyrupPuddle" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.85" />
            <stop offset="60%" stopColor="#d97706" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#b45309" stopOpacity="0" />
          </radialGradient>

          {/* Single Jamun Sphere Radial Gradient */}
          <radialGradient id="gjSphere" cx="35%" cy="30%" r="65%">
            <stop offset="0%" stopColor="#fef08a" />
            <stop offset="15%" stopColor="#d97706" />
            <stop offset="45%" stopColor="#853811" />
            <stop offset="80%" stopColor="#4a1d08" />
            <stop offset="100%" stopColor="#270c03" />
          </radialGradient>

          {/* Wet Gloss Highlight */}
          <linearGradient id="gjGloss" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
            <stop offset="50%" stopColor="#fef08a" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Syrup Puddle at Base */}
        <ellipse cx="32" cy="54" rx="24" ry="7" fill="url(#gjSyrupPuddle)" />

        {/* Main Golden-Brown Gulab Jamun Ball */}
        <circle cx="32" cy="32" r="23" fill="url(#gjSphere)" stroke="#270c03" strokeWidth="1" />

        {/* Glossy Syrup Sheen Highlight (top left curve) */}
        <ellipse cx="25" cy="22" rx="9" ry="5" transform="rotate(-35 25 22)" fill="url(#gjGloss)" />
        <circle cx="35" cy="18" r="2" fill="#ffffff" opacity="0.8" />
        <circle cx="19" cy="28" r="1.5" fill="#ffffff" opacity="0.7" />

        {/* Bottom Syrup Reflection */}
        <ellipse cx="32" cy="51" rx="14" ry="3" fill="#fbbf24" opacity="0.5" />

        {/* Pistachio Garnishes (Bright Green Flakes) */}
        <ellipse cx="28" cy="24" rx="2.8" ry="1.4" transform="rotate(25 28 24)" fill="#22c55e" stroke="#15803d" strokeWidth="0.5" />
        <ellipse cx="35" cy="26" rx="2.5" ry="1.2" transform="rotate(-40 35 26)" fill="#4ade80" stroke="#16a34a" strokeWidth="0.5" />
        <ellipse cx="31" cy="30" rx="2" ry="1" transform="rotate(15 31 30)" fill="#86efac" />
        <ellipse cx="25" cy="31" rx="1.8" ry="1" transform="rotate(-20 25 31)" fill="#22c55e" />

        {/* Saffron Strands (Delicate Crimson/Orange Threads) */}
        <path d="M 27 20 Q 32 19 33 24" stroke="#dc2626" strokeWidth="1.2" strokeLinecap="round" fill="none" />
        <path d="M 33 22 Q 38 23 37 28" stroke="#ef4444" strokeWidth="1" strokeLinecap="round" fill="none" />
      </svg>
    );
  }

  // Variant: 'bowl' - 3 luscious Gulab Jamuns soaking in sweet syrup inside an Indian brass katori bowl
  return (
    <svg
      width={pixelSize}
      height={pixelSize}
      viewBox="0 0 72 72"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ display: 'inline-block', verticalAlign: 'middle', filter: 'drop-shadow(0 3px 6px rgba(0,0,0,0.28))', ...style }}
      role="img"
      aria-label="Gulab Jamun"
    >
      <defs>
        {/* Brass Katori Bowl Gradient */}
        <linearGradient id="gjBowlGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fef08a" />
          <stop offset="25%" stopColor="#f59e0b" />
          <stop offset="50%" stopColor="#d97706" />
          <stop offset="75%" stopColor="#b45309" />
          <stop offset="100%" stopColor="#78350f" />
        </linearGradient>

        {/* Bowl Rim Gradient */}
        <linearGradient id="gjRimGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#b45309" />
          <stop offset="30%" stopColor="#fef08a" />
          <stop offset="70%" stopColor="#f59e0b" />
          <stop offset="100%" stopColor="#92400e" />
        </linearGradient>

        {/* Amber Rose Sugar Syrup Gradient */}
        <radialGradient id="gjSyrupLake" cx="50%" cy="45%" r="55%">
          <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.95" />
          <stop offset="50%" stopColor="#d97706" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#92400e" stopOpacity="0.85" />
        </radialGradient>

        {/* Left Ball Gradient */}
        <radialGradient id="gjBallL" cx="35%" cy="30%" r="65%">
          <stop offset="0%" stopColor="#fef08a" />
          <stop offset="18%" stopColor="#d97706" />
          <stop offset="55%" stopColor="#78350f" />
          <stop offset="90%" stopColor="#3d1404" />
        </radialGradient>

        {/* Right Ball Gradient */}
        <radialGradient id="gjBallR" cx="35%" cy="30%" r="65%">
          <stop offset="0%" stopColor="#fef08a" />
          <stop offset="18%" stopColor="#d97706" />
          <stop offset="55%" stopColor="#78350f" />
          <stop offset="90%" stopColor="#3d1404" />
        </radialGradient>

        {/* Center Front Ball Gradient */}
        <radialGradient id="gjBallC" cx="33%" cy="28%" r="68%">
          <stop offset="0%" stopColor="#fffbeb" />
          <stop offset="15%" stopColor="#f59e0b" />
          <stop offset="42%" stopColor="#9a3412" />
          <stop offset="75%" stopColor="#541c06" />
          <stop offset="100%" stopColor="#2a0c02" />
        </radialGradient>

        {/* Soft Syrup Gloss Sheen */}
        <linearGradient id="gjGlossSoft" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
          <stop offset="50%" stopColor="#fef08a" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Bowl Base Shadow */}
      <ellipse cx="36" cy="65" rx="20" ry="4" fill="#000000" opacity="0.25" />

      {/* Bowl Outer Base Ring */}
      <ellipse cx="36" cy="60" rx="14" ry="3.5" fill="#78350f" stroke="#451a03" strokeWidth="1" />

      {/* Bowl Body */}
      <path
        d="M 8 41 C 8 58 20 62 36 62 C 52 62 64 58 64 41 Z"
        fill="url(#gjBowlGrad)"
        stroke="#78350f"
        strokeWidth="1.2"
      />

      {/* Bowl Inner Shadow / Depth */}
      <ellipse cx="36" cy="41" rx="27" ry="9" fill="#541c06" />

      {/* Glistening Amber Sugar Syrup (Chashni) Lake inside Bowl */}
      <ellipse cx="36" cy="42" rx="25.5" ry="8" fill="url(#gjSyrupLake)" />

      {/* --- BACK LEFT GULAB JAMUN --- */}
      <g>
        <circle cx="25" cy="33" r="12.5" fill="url(#gjBallL)" stroke="#270c03" strokeWidth="0.8" />
        {/* Gloss highlight */}
        <ellipse cx="21" cy="27" rx="4.5" ry="2.5" transform="rotate(-30 21 27)" fill="url(#gjGlossSoft)" />
        {/* Pistachio & Saffron */}
        <ellipse cx="23" cy="29" rx="1.8" ry="0.9" transform="rotate(20 23 29)" fill="#22c55e" />
        <path d="M 25 26 Q 28 27 27 30" stroke="#dc2626" strokeWidth="0.9" strokeLinecap="round" fill="none" />
      </g>

      {/* --- BACK RIGHT GULAB JAMUN --- */}
      <g>
        <circle cx="47" cy="33" r="12.5" fill="url(#gjBallR)" stroke="#270c03" strokeWidth="0.8" />
        {/* Gloss highlight */}
        <ellipse cx="43" cy="27" rx="4.5" ry="2.5" transform="rotate(-30 43 27)" fill="url(#gjGlossSoft)" />
        {/* Pistachio & Saffron */}
        <ellipse cx="46" cy="28" rx="1.8" ry="0.9" transform="rotate(-35 46 28)" fill="#4ade80" />
        <path d="M 44 26 Q 47 25 48 29" stroke="#ef4444" strokeWidth="0.9" strokeLinecap="round" fill="none" />
      </g>

      {/* --- FRONT CENTER GULAB JAMUN (HERO SWEET) --- */}
      <g>
        <circle cx="36" cy="37" r="14.5" fill="url(#gjBallC)" stroke="#270c03" strokeWidth="1" />
        {/* Primary Specular Sheen (Curved highlight) */}
        <ellipse cx="31" cy="30" rx="6" ry="3.2" transform="rotate(-35 31 30)" fill="url(#gjGlossSoft)" />
        <circle cx="38" cy="27" r="1.3" fill="#ffffff" opacity="0.85" />
        <circle cx="26" cy="34" r="1.1" fill="#ffffff" opacity="0.75" />

        {/* Pistachio Flakes on top */}
        <ellipse cx="34" cy="32" rx="2.5" ry="1.2" transform="rotate(25 34 32)" fill="#22c55e" stroke="#15803d" strokeWidth="0.4" />
        <ellipse cx="39" cy="33" rx="2.2" ry="1.1" transform="rotate(-35 39 33)" fill="#4ade80" stroke="#16a34a" strokeWidth="0.4" />
        <ellipse cx="35" cy="37" rx="1.8" ry="0.9" transform="rotate(10 35 37)" fill="#86efac" />

        {/* Saffron Strands */}
        <path d="M 32 29 Q 36 28 37 32" stroke="#dc2626" strokeWidth="1.1" strokeLinecap="round" fill="none" />
        <path d="M 37 30 Q 41 31 40 35" stroke="#f43f5e" strokeWidth="0.9" strokeLinecap="round" fill="none" />

        {/* Edible Silver Foil Sparkle (Varak) */}
        <path d="M 41 36 L 42.5 35 L 43 36.5 L 41.8 37 Z" fill="#ffffff" opacity="0.9" />
      </g>

      {/* Bowl Front Rim (Highlights the brass sheen) */}
      <path
        d="M 7 41 Q 36 49 65 41 Q 36 47 7 41 Z"
        fill="url(#gjRimGrad)"
      />

      {/* Syrup Droplet Glaze on Rim */}
      <circle cx="36" cy="46.5" r="1.4" fill="#fbbf24" opacity="0.9" />
      <circle cx="28" cy="45.5" r="1" fill="#f59e0b" opacity="0.8" />
    </svg>
  );
}

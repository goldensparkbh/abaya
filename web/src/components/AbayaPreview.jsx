import React, { useId, useMemo } from 'react';
import { buildAbayaPath, hexForColor } from './abayaModel.js';

function FabricPattern({ id, fabric }) {
  switch (fabric) {
    case 'Crepe':
      return (
        <pattern id={id} patternUnits="userSpaceOnUse" width="3" height="3">
          <rect width="3" height="3" fill="transparent" />
          <circle cx="1" cy="1" r="0.45" fill="rgba(0,0,0,0.22)" />
        </pattern>
      );
    case 'Chiffon':
      return (
        <pattern id={id} patternUnits="userSpaceOnUse" width="10" height="10">
          <path d="M0 0 L10 10 M-2 8 L8 -2" stroke="rgba(255,255,255,0.16)" strokeWidth="0.5" />
        </pattern>
      );
    case 'Nida':
      return (
        <pattern id={id} patternUnits="userSpaceOnUse" width="2" height="2">
          <rect width="2" height="2" fill="rgba(0,0,0,0.04)" />
        </pattern>
      );
    case 'Linen':
      return (
        <pattern id={id} patternUnits="userSpaceOnUse" width="6" height="6">
          <path d="M0 3 L6 3" stroke="rgba(0,0,0,0.16)" strokeWidth="0.5" />
          <path d="M3 0 L3 6" stroke="rgba(255,255,255,0.14)" strokeWidth="0.4" />
        </pattern>
      );
    case 'Silk':
      return (
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(255,255,255,0)" />
          <stop offset="30%" stopColor="rgba(255,255,255,0.35)" />
          <stop offset="45%" stopColor="rgba(255,255,255,0.08)" />
          <stop offset="80%" stopColor="rgba(255,255,255,0)" />
        </linearGradient>
      );
    case 'Cotton':
      return (
        <pattern id={id} patternUnits="userSpaceOnUse" width="5" height="5">
          <circle cx="1" cy="1" r="0.5" fill="rgba(255,255,255,0.18)" />
          <circle cx="3.5" cy="3.5" r="0.4" fill="rgba(0,0,0,0.12)" />
        </pattern>
      );
    default:
      return null;
  }
}

export default function AbayaPreview({
  color = 'Black',
  colorHex,
  fabric = 'Crepe',
  sizes,
  className = '',
  height,
  showOutline = false,
}) {
  const uid = useId().replace(/:/g, '');
  const fill = colorHex || hexForColor(color);

  const { path, bounds } = useMemo(() => buildAbayaPath(sizes), [sizes]);

  const textureId = `tex-${uid}-${fabric}`;
  const sheenId = `sheen-${uid}`;
  const clipId = `clip-${uid}`;

  const hasPattern = fabric && fabric !== 'Other' && fabric !== 'Silk';
  const hasSilk = fabric === 'Silk';

  return (
    <div className={`abaya-preview ${className}`} style={height ? { height } : undefined}>
      <svg viewBox="0 0 400 560" role="img" aria-label="Abaya preview">
        <defs>
          <FabricPattern id={textureId} fabric={fabric} />
          <linearGradient id={sheenId} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="rgba(255,255,255,0.12)" />
            <stop offset="55%" stopColor="rgba(255,255,255,0)" />
            <stop offset="100%" stopColor="rgba(0,0,0,0.18)" />
          </linearGradient>
          <clipPath id={clipId}>
            <path d={path} />
          </clipPath>
        </defs>

        {/* Stage backdrop */}
        <rect x="0" y="0" width="400" height="560" fill="url(#abayaBg)" opacity="0" />

        {/* Shadow on the floor */}
        <ellipse
          cx={bounds.cx}
          cy={bounds.yBottom + 24}
          rx={bounds.hemHalf + 14}
          ry={10}
          fill="rgba(0,0,0,0.18)"
          filter="blur(2px)"
        />

        {/* Body fill */}
        <path d={path} fill={fill} stroke="rgba(0,0,0,0.32)" strokeWidth="1.2" strokeLinejoin="round" />

        {/* Subtle global sheen for depth */}
        <g clipPath={`url(#${clipId})`}>
          <rect x="0" y="0" width="400" height="560" fill={`url(#${sheenId})`} />
        </g>

        {/* Fabric overlay */}
        {hasPattern ? (
          <g clipPath={`url(#${clipId})`}>
            <rect x="0" y="0" width="400" height="560" fill={`url(#${textureId})`} opacity={fabric === 'Nida' ? 0.6 : 0.85} />
          </g>
        ) : null}

        {hasSilk ? (
          <g clipPath={`url(#${clipId})`}>
            <rect x="0" y="0" width="400" height="560" fill={`url(#${textureId})`} opacity="0.85" />
          </g>
        ) : null}

        {/* Center seam */}
        <line
          x1={bounds.cx}
          y1={bounds.yShoulder + 18}
          x2={bounds.cx}
          y2={bounds.yBottom - 6}
          stroke="rgba(255,255,255,0.06)"
          strokeWidth="0.7"
          strokeDasharray="2 4"
        />

        {/* Neck opening highlight */}
        <ellipse
          cx={bounds.cx}
          cy={bounds.yTop + bounds.neckHalf * 0.4}
          rx={bounds.neckHalf}
          ry={bounds.neckHalf * 0.5}
          fill="rgba(0,0,0,0.35)"
        />

        {showOutline ? (
          <path d={path} fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="0.6" />
        ) : null}
      </svg>
    </div>
  );
}

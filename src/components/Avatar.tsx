import { UserRound } from 'lucide-react';

interface AvatarProps {
  name?: string;
  size: number;
  riskRing: string;
  square?: boolean;
  initials?: string;
}

// Neutral, faceless profile silhouette (no generated photo) — like a default social avatar.
// Rewritten from a dicebear <img> so every suspect/arrest/gang avatar app-wide is faceless.
export function Avatar({ size, riskRing, square = false }: AvatarProps) {
  const radius = square ? 8 : 9999;
  const corners = ['tl', 'tr', 'bl', 'br'] as const;

  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <div style={{
        width: size, height: size,
        borderRadius: square ? radius : '50%',
        border: `2px solid ${riskRing}`,
        boxShadow: `0 0 16px ${riskRing}33`,
        overflow: 'hidden',
        background: '#0F151E',
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
      }}>
        <UserRound
          size={size * 0.72}
          color="#3A4A5E"
          fill="#2A3646"
          strokeWidth={1.2}
          style={{ marginBottom: -size * 0.08 }}
        />
      </div>
      {square && corners.map(pos => (
        <div key={pos} style={{
          position: 'absolute',
          width: 14, height: 14,
          [pos.includes('t') ? 'top' : 'bottom']: -4,
          [pos.includes('l') ? 'left' : 'right']: -4,
          borderTop: pos.includes('t') ? `2px solid ${riskRing}` : 'none',
          borderBottom: pos.includes('b') ? `2px solid ${riskRing}` : 'none',
          borderLeft: pos.includes('l') ? `2px solid ${riskRing}` : 'none',
          borderRight: pos.includes('r') ? `2px solid ${riskRing}` : 'none',
        }} />
      ))}
    </div>
  );
}

import { useState } from 'react';

interface AvatarProps {
  name: string;
  size: number;
  riskRing: string;
  square?: boolean;
  initials?: string;
}

export function Avatar({ name, size, riskRing, square = false, initials }: AvatarProps) {
  const [imgError, setImgError] = useState(false);
  const seed = name.replace(/[^a-zA-Z]/g, '');
  const radius = square ? 8 : 9999;
  const fallbackInitials = initials ?? name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

  const corners = ['tl', 'tr', 'bl', 'br'] as const;

  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      {!imgError ? (
        <div style={{
          width: size, height: size,
          borderRadius: square ? radius : '50%',
          border: `2px solid ${riskRing}`,
          boxShadow: `0 0 16px ${riskRing}33`,
          overflow: 'hidden',
          background: '#0d1828',
          filter: square ? 'grayscale(0.45) contrast(1.08)' : undefined,
        }}>
          <img
            src={`https://api.dicebear.com/9.x/micah/svg?seed=${seed}&backgroundColor=0d1828`}
            width={size}
            height={size}
            style={{ display: 'block' }}
            alt={name}
            onError={() => setImgError(true)}
          />
        </div>
      ) : (
        <div style={{
          width: size, height: size,
          borderRadius: square ? radius : '50%',
          border: `2px solid ${riskRing}`,
          boxShadow: `0 0 14px ${riskRing}33`,
          background: 'radial-gradient(circle at center, #1a2744, #060A12)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <span style={{
            fontFamily: 'monospace',
            fontWeight: 700,
            fontSize: size * 0.3,
            color: '#E2E8F0',
            letterSpacing: '0.05em',
          }}>{fallbackInitials}</span>
        </div>
      )}
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

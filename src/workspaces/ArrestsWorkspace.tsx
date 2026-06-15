import { useState } from 'react';
import { Avatar } from '../components/Avatar';
import { Lang, t } from '../i18n/translations';
import { RECENT_ARRESTS } from '../data';

const categoryColor: Record<string, string> = {
  financial: '#EF4444',
  theft: '#F59E0B',
  cyber: '#60A5FA',
  drug: '#8B5CF6',
  robbery: '#EF4444',
};

interface ArrestsWorkspaceProps {
  lang: Lang;
  onOpenDrawer: (arrest: typeof RECENT_ARRESTS[0]) => void;
}

export function ArrestsWorkspace({ lang, onOpenDrawer }: ArrestsWorkspaceProps) {
  return (
    <div className="left-panel-scroll" style={{ flex: 1, overflowY: 'auto', background: '#060A12', padding: '10px 12px' }}>
      <div style={{ fontSize: 13, fontFamily: 'monospace', color: '#94A3B8', letterSpacing: '0.1em', marginBottom: 12 }}>
        {t('recentArrestsTitle', lang)}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {RECENT_ARRESTS.map((arr, i) => (
          <div
            key={i}
            onClick={() => onOpenDrawer(arr)}
            style={{
              background: '#0D1828', border: '1px solid #162035', borderRadius: 8,
              padding: '12px 16px', cursor: 'pointer', display: 'flex', gap: 14, alignItems: 'center',
              transition: 'border-color 0.15s',
            }}
            onMouseEnter={e => (e.currentTarget.style.borderColor = '#1E2D45')}
            onMouseLeave={e => (e.currentTarget.style.borderColor = '#162035')}
          >
            <Avatar name={arr.name} size={48} riskRing={categoryColor[arr.category] ?? '#475569'} square />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#E2E8F0' }}>{arr.name}</div>
                  <div style={{ fontSize: 12, color: categoryColor[arr.category] ?? '#94A3B8', marginTop: 2 }}>{arr.charge}</div>
                  <div style={{ fontSize: 12, color: '#64748B', marginTop: 2 }}>Caught at: {arr.location}</div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontSize: 12, fontFamily: 'monospace', fontWeight: 700, color: '#60A5FA' }}>{arr.case}</div>
                  <div style={{ fontSize: 11, fontFamily: 'monospace', color: '#64748B', marginTop: 2 }}>{arr.date}</div>
                </div>
              </div>
            </div>
            <div style={{ color: '#334155', fontSize: 16, flexShrink: 0 }}>›</div>
          </div>
        ))}
      </div>
    </div>
  );
}

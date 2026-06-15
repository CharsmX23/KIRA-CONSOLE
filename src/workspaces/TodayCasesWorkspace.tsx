import { useState } from 'react';
import { Lang, t } from '../i18n/translations';
import { TODAY_CASES } from '../data';

const categoryColor: Record<string, string> = {
  theft: '#F59E0B',
  cyber: '#60A5FA',
  financial: '#60A5FA',
  robbery: '#EF4444',
  drug: '#8B5CF6',
};

interface TodayCasesWorkspaceProps {
  lang: Lang;
}

export function TodayCasesWorkspace({ lang }: TodayCasesWorkspaceProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggle = (id: string) => setExpandedId(prev => prev === id ? null : id);

  return (
    <div className="left-panel-scroll" style={{ flex: 1, overflowY: 'auto', background: '#060A12', padding: '10px 12px' }}>
      <div style={{ fontSize: 13, fontFamily: 'monospace', color: '#94A3B8', letterSpacing: '0.1em', marginBottom: 4 }}>
        {t('casesFiledToday', lang)}
      </div>
      <div style={{ fontSize: 12, fontFamily: 'monospace', color: '#64748B', marginBottom: 12 }}>
        {t('casesFiledHeader', lang)}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {TODAY_CASES.map((c) => (
          <div
            key={c.id}
            style={{
              background: '#0D1828', border: '1px solid #162035', borderRadius: 8,
              overflow: 'hidden', transition: 'border-color 0.15s',
            }}
          >
            <div
              onClick={() => toggle(c.id)}
              style={{
                padding: '12px 16px', cursor: 'pointer', display: 'flex',
                justifyContent: 'space-between', alignItems: 'center',
              }}
              onMouseEnter={e => (e.currentTarget.parentElement!.style.borderColor = '#1E2D45')}
              onMouseLeave={e => (e.currentTarget.parentElement!.style.borderColor = '#162035')}
            >
              <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
                <span style={{ fontSize: 13, fontFamily: 'monospace', fontWeight: 700, color: '#60A5FA', minWidth: 60 }}>{c.id}</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: categoryColor[c.category] ?? '#94A3B8' }}>{c.crime}</span>
                <span style={{ fontSize: 12, color: '#64748B' }}>{c.location}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: 11, fontFamily: 'monospace', color: '#64748B' }}>{c.time}</span>
                <span style={{ color: expandedId === c.id ? '#60A5FA' : '#334155', fontSize: 14, transition: 'color 0.15s' }}>
                  {expandedId === c.id ? '▲' : '▼'}
                </span>
              </div>
            </div>
            {expandedId === c.id && (
              <div style={{ padding: '0 16px 14px', borderTop: '1px solid #162035' }}>
                <div style={{ fontSize: 12, color: '#64748B', fontFamily: 'monospace', marginBottom: 6, marginTop: 10 }}>
                  Officer: {c.officer} · Filed: {c.time}
                </div>
                <div style={{ fontSize: 14, color: '#94A3B8', lineHeight: 1.7 }}>
                  {c.summary}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

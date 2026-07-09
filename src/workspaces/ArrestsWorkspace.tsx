import { Avatar } from '../components/Avatar';
import { Lang, t } from '../i18n/translations';
import { RECENT_ARRESTS } from '../data';

const categoryColor: Record<string, string> = {
  financial: '#F04E4E',
  theft: '#F5A623',
  cyber: '#4D9EF5',
  drug: '#8B6FD4',
  robbery: '#F04E4E',
};

interface ArrestsWorkspaceProps {
  lang: Lang;
  onOpenDrawer: (arrest: typeof RECENT_ARRESTS[0]) => void;
}

export function ArrestsWorkspace({ lang, onOpenDrawer }: ArrestsWorkspaceProps) {
  return (
    <div className="left-panel-scroll" style={{ flex: 1, overflowY: 'auto', background: 'var(--bg-base, #080C14)', padding: '10px 12px' }}>
      <div style={{ fontSize: 13, fontFamily: "'JetBrains Mono', monospace", color: '#94A3B8', fontWeight: 600, letterSpacing: '0.12em', marginBottom: 12 }}>
        {t('recentArrestsTitle', lang)}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {RECENT_ARRESTS.map((arr, i) => (
          <div
            key={i}
            onClick={() => onOpenDrawer(arr)}
            style={{
              background: 'var(--bg-raised, #131920)', border: '1px solid var(--border-subtle, #1E2D3D)', borderRadius: 8,
              padding: '12px 16px', cursor: 'pointer', display: 'flex', gap: 14, alignItems: 'center',
              transition: 'border-color 0.15s',
            }}
            onMouseEnter={e => (e.currentTarget.style.borderColor = '#243447')}
            onMouseLeave={e => (e.currentTarget.style.borderColor = '#1E2D3D')}
          >
            <Avatar name={arr.name} size={48} riskRing={categoryColor[arr.category] ?? '#8B9EB5'} square />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#E8EDF2' }}>{arr.name}</div>
                  <div style={{ fontSize: 12, color: categoryColor[arr.category] ?? '#94A3B8', marginTop: 2 }}>{arr.charge}</div>
                  <div style={{ fontSize: 12, color: '#64748B', marginTop: 2 }}>Caught at: {arr.location}</div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontSize: 12, fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, fontVariantNumeric: 'tabular-nums', color: '#4D9EF5' }}>{arr.case}</div>
                  <div style={{ fontSize: 11, fontFamily: "'JetBrains Mono', monospace", color: '#64748B', marginTop: 2 }}>{arr.date}</div>
                </div>
              </div>
            </div>
            <div style={{ color: '#4A5C70', fontSize: 16, flexShrink: 0 }}>›</div>
          </div>
        ))}
      </div>
    </div>
  );
}

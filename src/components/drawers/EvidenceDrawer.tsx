import { X, Clock, User, Briefcase, AlertTriangle, Zap } from 'lucide-react';
import { Camera, Car, Smartphone, Landmark, UserCheck, TrendingUp } from 'lucide-react';
import { EVIDENCE_DETAIL, EC, EvidenceType } from '../../data';
import { Lang, t } from '../../i18n/translations';

const EVIDENCE_ICONS: Record<string, React.ComponentType<{ size?: number; color?: string }>> = {
  'VISUAL EVIDENCE': Camera, 'PHYSICAL EVIDENCE': Car, 'DIGITAL EVIDENCE': Smartphone,
  'FINANCIAL EVIDENCE': Landmark, 'TESTIMONIAL EVIDENCE': UserCheck, 'ANALYTICAL EVIDENCE': TrendingUp,
};

const TYPE_TO_EC: Record<string, EvidenceType> = {
  'VISUAL EVIDENCE': 'VISUAL', 'PHYSICAL EVIDENCE': 'PHYSICAL', 'DIGITAL EVIDENCE': 'DIGITAL',
  'FINANCIAL EVIDENCE': 'FINANCIAL', 'TESTIMONIAL EVIDENCE': 'TESTIMONY', 'ANALYTICAL EVIDENCE': 'ANALYTICS',
};

interface EvidenceDrawerProps {
  evidenceTitle: string;
  lang: Lang;
  onClose: () => void;
  onSuspectClick: (name: string) => void;
  onCaseClick: (caseId: string) => void;
  onActionToast: (msg: string) => void;
}

export function EvidenceDrawer({ evidenceTitle, lang, onClose, onSuspectClick, onCaseClick, onActionToast }: EvidenceDrawerProps) {
  const detail = EVIDENCE_DETAIL[evidenceTitle];
  if (!detail) return null;

  const ecKey = TYPE_TO_EC[detail.type];
  const typeColor = EC[ecKey] ?? '#60A5FA';
  const Icon = EVIDENCE_ICONS[detail.type] ?? AlertTriangle;

  return (
    <>
      {/* Overlay */}
      <div
        onClick={onClose}
        style={{
          position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 40,
        }}
      />
      {/* Drawer */}
      <div
        className="slide-in-right"
        style={{
          position: 'absolute', top: 0, right: 0, bottom: 0, width: 420,
          background: '#0A1120',
          borderLeft: `1px solid ${typeColor}44`,
          borderTop: `3px solid ${typeColor}`,
          zIndex: 50, display: 'flex', flexDirection: 'column',
          boxShadow: `-8px 0 32px rgba(0,0,0,0.6)`,
        }}
      >
        {/* Header */}
        <div style={{ padding: '16px 16px 12px', borderBottom: '1px solid #162035', flexShrink: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: '#E2E8F0', marginBottom: 4 }}>{evidenceTitle}</div>
              <div style={{
                display: 'inline-block', background: `${typeColor}22`, border: `1px solid ${typeColor}44`,
                borderRadius: 4, padding: '2px 8px', fontSize: 10, fontFamily: 'monospace', color: typeColor,
              }}>{detail.type}</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                background: 'rgba(59,130,246,0.15)', borderRadius: 4, padding: '4px 8px',
                fontSize: 11, fontFamily: 'monospace', color: '#93C5FD', fontWeight: 700,
              }}>{detail.confidence}% CONFIDENCE</div>
              <button onClick={onClose} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748B', padding: 4 }}>
                <X size={16} />
              </button>
            </div>
          </div>
        </div>

        <div className="left-panel-scroll" style={{ flex: 1, overflowY: 'auto', padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Icon block */}
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <div style={{
              width: 72, height: 72, borderRadius: '50%',
              background: `${typeColor}15`, border: `2px solid ${typeColor}`,
              boxShadow: `0 0 20px ${typeColor}33`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Icon size={32} color={typeColor} />
            </div>
          </div>

          {/* Detail rows */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
              <Clock size={13} color="#64748B" style={{ flexShrink: 0, marginTop: 1 }} />
              <div>
                <div style={{ fontSize: 9, fontFamily: 'monospace', color: '#64748B', letterSpacing: '0.08em' }}>TIMESTAMP</div>
                <div style={{ fontSize: 13, color: '#94A3B8', marginTop: 2, fontFamily: 'monospace' }}>{detail.timestamp}</div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
              <User size={13} color="#64748B" style={{ flexShrink: 0, marginTop: 1 }} />
              <div>
                <div style={{ fontSize: 9, fontFamily: 'monospace', color: '#64748B', letterSpacing: '0.08em' }}>{t('officerHandling', lang).toUpperCase()}</div>
                <div style={{ fontSize: 13, color: '#94A3B8', marginTop: 2 }}>{detail.officer}</div>
              </div>
            </div>
          </div>

          {/* Cases linked */}
          <div>
            <div style={{ fontSize: 9, fontFamily: 'monospace', color: '#64748B', letterSpacing: '0.08em', marginBottom: 6 }}>
              {t('casesLinked', lang).toUpperCase()}
            </div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {detail.casesLinked.map(c => (
                <button key={c} onClick={() => onCaseClick(c)} style={{
                  background: '#0D1828', border: '1px solid #1E2D45', borderRadius: 4,
                  padding: '4px 10px', fontSize: 12, fontFamily: 'monospace', fontWeight: 700,
                  color: '#60A5FA', cursor: 'pointer',
                }}>{c}</button>
              ))}
            </div>
          </div>

          {/* Suspects linked */}
          <div>
            <div style={{ fontSize: 9, fontFamily: 'monospace', color: '#64748B', letterSpacing: '0.08em', marginBottom: 6 }}>
              {t('suspectsLinked', lang).toUpperCase()}
            </div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {detail.suspectsLinked.map(s => (
                <button key={s} onClick={() => onSuspectClick(s)} style={{
                  background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
                  borderRadius: 4, padding: '4px 10px', fontSize: 12, fontFamily: 'monospace',
                  color: '#FCA5A5', cursor: 'pointer',
                }}>{s}</button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <div style={{ fontSize: 13, fontFamily: 'monospace', color: '#64748B', letterSpacing: '0.1em', marginBottom: 8 }}>
              {t('description', lang)}
            </div>
            <div style={{ fontSize: 14, color: '#94A3B8', lineHeight: 1.7 }}>
              {detail.description}
            </div>
          </div>

          {/* AI Reasoning */}
          <div style={{
            background: 'rgba(59,130,246,0.07)', borderLeft: '3px solid #3B82F6',
            borderRadius: 4, padding: '12px 14px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 8 }}>
              <Zap size={12} color="#93C5FD" />
              <span style={{ fontSize: 13, fontFamily: 'monospace', color: '#93C5FD', letterSpacing: '0.1em' }}>
                {t('whyThisMatters', lang)}
              </span>
            </div>
            <div style={{ fontSize: 13, color: '#93C5FD', lineHeight: 1.7, opacity: 0.9 }}>
              {detail.reasoning}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ padding: '12px 16px', borderTop: '1px solid #162035', display: 'flex', gap: 8, flexShrink: 0 }}>
          <button onClick={() => { onClose(); onSuspectClick(detail.suspectsLinked[0]); }} style={{
            flex: 1, background: `${typeColor}22`, border: `1px solid ${typeColor}55`,
            color: typeColor, fontWeight: 600, fontSize: 13, borderRadius: 6, padding: '10px 14px', cursor: 'pointer',
          }}>{t('openFullInvestigation', lang)}</button>
          <button onClick={() => onActionToast('Flagged for re-examination')} style={{
            background: 'transparent', border: '1px solid #1E2D45',
            color: '#64748B', fontSize: 13, borderRadius: 6, padding: '10px 14px', cursor: 'pointer',
          }}>{t('flagReexamination', lang)}</button>
        </div>
      </div>
    </>
  );
}

import { AlertTriangle } from 'lucide-react';
import { Lang } from '../i18n/translations';

interface EvidenceReviewWorkspaceProps {
  lang: Lang;
}

export function EvidenceReviewWorkspace({ lang: _ }: EvidenceReviewWorkspaceProps) {
  const weaknesses = [
    { label: 'CCTV Quality: PARTIAL', desc: 'Resolution insufficient for positive ID', color: '#F5A623' },
    { label: 'Witness Statement: RETRACTED', desc: 'Witness withdrew testimony on 14 Nov 2024', color: '#F04E4E' },
    { label: 'Forensic Report: INCONCLUSIVE', desc: 'DNA match probability 61%, below 95% threshold', color: '#F5A623' },
    { label: 'Chain of Custody: GAP DETECTED', desc: '4-hour gap between evidence collection and logging', color: '#F04E4E' },
  ];

  return (
    <div className="left-panel-scroll" style={{ flex: 1, overflowY: 'auto', background: 'var(--bg-base, #080C14)', padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 10 }}>
      {/* Warning banner */}
      <div style={{
        background: 'rgba(240,78,78,0.08)', border: '1px solid rgba(240,78,78,0.3)',
        borderRadius: 8, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 10,
      }}>
        <AlertTriangle size={20} color="#F04E4E" />
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, fontVariantNumeric: 'tabular-nums', color: '#FCA5A5', fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.08em' }}>
            EVIDENCE CHAIN INCOMPLETE
          </div>
          <div style={{ fontSize: 12, color: '#64748B', marginTop: 2 }}>CASE KS1176 — Evidence Insufficiency Analysis</div>
        </div>
      </div>

      {/* Weakness cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {weaknesses.map((w, i) => (
          <div key={i} style={{
            background: 'var(--bg-raised, #131920)', border: `1px solid #1E2D3D`,
            borderLeft: `3px solid ${w.color}`,
            borderRadius: 6, padding: '12px 14px',
          }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: w.color === '#F04E4E' ? '#FCA5A5' : '#FCD34D', marginBottom: 4 }}>{w.label}</div>
            <div style={{ fontSize: 12, color: '#94A3B8' }}>{w.desc}</div>
          </div>
        ))}
      </div>

      {/* AI Recommendation */}
      <div style={{
        background: 'rgba(59,130,246,0.07)', border: '1px solid rgba(59,130,246,0.2)',
        borderLeft: '3px solid #3B82F6', borderRadius: 8, padding: '14px 16px', marginBottom: 12,
      }}>
        <div style={{ fontSize: 11, fontFamily: "'JetBrains Mono', monospace", color: '#93C5FD', fontWeight: 600, letterSpacing: '0.12em', marginBottom: 8 }}>AI RECOMMENDATION</div>
        <div style={{ fontSize: 13, color: '#93C5FD', lineHeight: 1.7 }}>
          Case requires re-investigation. Recommend re-interviewing witness under protected status. Forensic laboratory should conduct re-analysis with enhanced methodology. Address chain of custody gap immediately through supplementary documentation.
        </div>
      </div>
    </div>
  );
}

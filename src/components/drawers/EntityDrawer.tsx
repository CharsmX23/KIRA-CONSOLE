import { useState, useEffect } from 'react';
import { X, MapPin } from 'lucide-react';
import { Avatar } from '../Avatar';
import { Lang, t } from '../../i18n/translations';
import { RECENT_ARRESTS } from '../../data';

const API_BASE = import.meta.env.VITE_API_URL || 'https://kiraconsole.development.catalystappsail.in';

interface RiskBreakdown {
  risk_score: number;
  risk_tier: 'HIGH' | 'MEDIUM' | 'LOW';
  contributing_factors: {
    prior_arrests: number;
    network_size: number;
    network_centrality: number;
    evidence_confidence: number;
    status: number;
  };
}

interface EntityDrawerProps {
  name: string;
  lang: Lang;
  onClose: () => void;
  onCaseClick: (caseId: string) => void;
  onActionToast: (msg: string) => void;
}

const SUSPECT_DATA: Record<string, {
  role: string; status: string; risk: 'HIGH' | 'MEDIUM' | 'LOW';
  associates: number; cases: number; arrests: number;
  location: string; lastSeen: string; crimes: string[];
  caseIds: string[]; ring: string;
  imprisonedNote?: string;
}> = {
  'D. Nair': { role: 'Kingpin', status: 'WANTED', risk: 'HIGH', associates: 6, cases: 4, arrests: 2, location: 'Unknown', lastSeen: '12 Oct 2024', crimes: ['Drug Trafficking', 'Money Laundering', 'Organized Crime'], caseIds: ['KS0912', 'KS1100'], ring: '#F04E4E' },
  'R. Mehta': { role: 'Broker', status: 'AT LARGE', risk: 'HIGH', associates: 7, cases: 2, arrests: 3, location: 'Whitefield, Bengaluru', lastSeen: '18 Dec 2024', crimes: ['Drug Trafficking', 'Money Laundering', 'Financial Fraud'], caseIds: ['KS1207', 'KS1189'], ring: '#F5A623', imprisonedNote: 'Mar 2021 – Sep 2022 (18mo) — Money Laundering (PoCA)' },
  'S. Khan': { role: 'Operative', status: 'IN CUSTODY', risk: 'HIGH', associates: 3, cases: 2, arrests: 1, location: 'Bengaluru Central Prison', lastSeen: '18 Nov 2023 (arrest)', crimes: ['Money Laundering', 'Drug Logistics'], caseIds: ['KS1207'], ring: '#F04E4E' },
  'P. Reddy': { role: 'Operative', status: 'AT LARGE', risk: 'MEDIUM', associates: 2, cases: 1, arrests: 0, location: 'Last seen Indiranagar', lastSeen: '05 Nov 2024', crimes: ['Drug Trafficking'], caseIds: ['KS1189'], ring: '#F5A623' },
  'T. Kumar': { role: 'Associate', status: 'MONITORING', risk: 'MEDIUM', associates: 2, cases: 1, arrests: 0, location: 'Electronic City', lastSeen: '14 Dec 2024', crimes: ['Financial Fraud'], caseIds: ['KS1094'], ring: '#F5A623' },
  'M. Ali': { role: 'Associate', status: 'MONITORING', risk: 'MEDIUM', associates: 2, cases: 2, arrests: 1, location: 'Yeshwanthpur', lastSeen: '08 Dec 2024', crimes: ['Financial Fraud', 'Hawala'], caseIds: ['KS1012', 'KS1094'], ring: '#F5A623' },
  'B. Singh': { role: 'Runner', status: 'UNKNOWN', risk: 'LOW', associates: 1, cases: 1, arrests: 0, location: 'Unknown', lastSeen: 'Unknown', crimes: ['Drug Courier'], caseIds: [], ring: '#8B9EB5' },
};

const riskColor: Record<string, { bg: string; text: string; border: string }> = {
  HIGH: { bg: 'rgba(240,78,78,0.15)', text: '#FCA5A5', border: 'rgba(240,78,78,0.4)' },
  MEDIUM: { bg: 'rgba(245,166,35,0.15)', text: '#FCD34D', border: 'rgba(245,166,35,0.4)' },
  LOW: { bg: 'rgba(46,204,113,0.15)', text: '#86EFAC', border: 'rgba(46,204,113,0.4)' },
};

const statusColors: Record<string, { bg: string; text: string }> = {
  'WANTED': { bg: 'rgba(240,78,78,0.15)', text: '#FCA5A5' },
  'AT LARGE': { bg: 'rgba(240,78,78,0.15)', text: '#FCA5A5' },
  'IN CUSTODY': { bg: 'rgba(46,204,113,0.15)', text: '#86EFAC' },
  'MONITORING': { bg: 'rgba(245,166,35,0.15)', text: '#FCD34D' },
  'UNKNOWN': { bg: 'rgba(100,116,139,0.15)', text: '#94A3B8' },
};

// Also handle arrest records
const ARREST_MAP = Object.fromEntries(RECENT_ARRESTS.map(a => [a.name, a]));
const CAT_RING: Record<string, string> = { financial: '#F04E4E', theft: '#F5A623', cyber: '#4D9EF5', drug: '#8B6FD4', robbery: '#F04E4E' };

export function EntityDrawer({ name, lang, onClose, onCaseClick, onActionToast }: EntityDrawerProps) {
  const [riskBreakdown, setRiskBreakdown] = useState<RiskBreakdown | null>(null);

  useEffect(() => {
    fetch(`${API_BASE}/api/suspects/${encodeURIComponent(name)}/risk`)
      .then(r => r.json())
      .then(d => d.risk_score !== undefined ? setRiskBreakdown(d) : null)
      .catch(() => null);
  }, [name]);

  const data = SUSPECT_DATA[name];

  // If it's an arrest record (and not in suspect data), show arrest drawer
  const arrest = ARREST_MAP[name];
  if (!data && arrest) {
    const ring = CAT_RING[arrest.category] ?? '#8B9EB5';
    return (
      <>
        <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 40 }} />
        <div className="slide-in-right" style={{
          position: 'absolute', top: 0, right: 0, bottom: 0, width: 420,
          background: 'var(--bg-surface, #0D1117)', borderLeft: `1px solid ${ring}44`,
          borderTop: `3px solid ${ring}`, zIndex: 50, display: 'flex', flexDirection: 'column',
          boxShadow: '-8px 0 32px rgba(0,0,0,0.6)',
        }}>
          <div style={{ padding: '16px 16px 12px', borderBottom: '1px solid #1E2D3D', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#E8EDF2' }}>{arrest.name}</div>
            <button onClick={onClose} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748B' }}><X size={16} /></button>
          </div>
          <div className="left-panel-scroll" style={{ flex: 1, overflowY: 'auto', padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <Avatar name={arrest.name} size={80} riskRing={ring} square />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 16px' }}>
              {[
                { label: 'Case ID', value: arrest.case },
                { label: 'Charge', value: arrest.charge },
                { label: 'Arrest Date', value: arrest.date },
                { label: 'Location', value: arrest.location },
                { label: 'Arresting Officer', value: arrest.officer },
              ].map((f, i) => (
                <div key={i}>
                  <div style={{ fontSize: 9, fontFamily: "'JetBrains Mono', monospace", color: '#64748B', fontWeight: 600, letterSpacing: '0.08em' }}>{f.label.toUpperCase()}</div>
                  <div style={{ fontSize: 13, color: '#E8EDF2', marginTop: 2 }}>{f.value}</div>
                </div>
              ))}
            </div>
            <div>
              <div style={{ fontSize: 9, fontFamily: "'JetBrains Mono', monospace", color: '#64748B', fontWeight: 600, letterSpacing: '0.08em', marginBottom: 6 }}>EVIDENCE</div>
              {arrest.evidence.map((e, i) => (
                <div key={i} style={{ fontSize: 13, color: '#94A3B8', lineHeight: 1.6, marginBottom: 3 }}>• {e}</div>
              ))}
            </div>
            <div style={{ fontSize: 14, color: '#94A3B8', lineHeight: 1.7, borderTop: '1px solid #1E2D3D', paddingTop: 12 }}>
              {arrest.narrative}
            </div>
          </div>
        </div>
      </>
    );
  }

  if (!data) return null;

  const rc = riskColor[data.risk];
  const sc = statusColors[data.status] ?? statusColors['UNKNOWN'];

  return (
    <>
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 40 }} />
      <div className="slide-in-right" style={{
        position: 'absolute', top: 0, right: 0, bottom: 0, width: 420,
        background: 'var(--bg-surface, #0D1117)',
        borderLeft: `1px solid ${data.ring}44`,
        borderTop: `3px solid ${data.ring}`,
        zIndex: 50, display: 'flex', flexDirection: 'column',
        boxShadow: '-8px 0 32px rgba(0,0,0,0.6)',
      }}>
        {/* Header */}
        <div style={{ padding: '16px 16px 12px', borderBottom: '1px solid #1E2D3D', flexShrink: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#E8EDF2' }}>{name}</div>
            <button onClick={onClose} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748B', padding: 4 }}>
              <X size={16} />
            </button>
          </div>
          <div style={{ fontSize: 12, color: '#64748B', marginTop: 2 }}>{data.role} · Cluster K-7</div>
        </div>

        <div className="left-panel-scroll" style={{ flex: 1, overflowY: 'auto', padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Avatar */}
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <Avatar name={name} size={80} riskRing={data.ring} square />
          </div>

          {/* Badges */}
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
            <div style={{
              background: rc.bg, border: `1px solid ${rc.border}`,
              borderRadius: 4, padding: '4px 10px',
              fontSize: 11, fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, fontVariantNumeric: 'tabular-nums', color: rc.text,
            }}>{data.risk} RISK</div>
            <div style={{
              background: sc.bg, borderRadius: 4, padding: '4px 10px',
              fontSize: 11, fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, fontVariantNumeric: 'tabular-nums', color: sc.text,
            }}>{data.status}</div>
          </div>

          {/* Risk Breakdown */}
          {riskBreakdown && (() => {
            const tierColor = riskBreakdown.risk_tier === 'HIGH' ? '#F04E4E' : riskBreakdown.risk_tier === 'MEDIUM' ? '#F5A623' : '#2ECC71';
            const factors = [
              { label: 'Network centrality', value: riskBreakdown.contributing_factors.network_centrality },
              { label: 'Prior arrests', value: riskBreakdown.contributing_factors.prior_arrests },
              { label: 'Evidence confidence', value: riskBreakdown.contributing_factors.evidence_confidence },
              { label: 'Network size', value: riskBreakdown.contributing_factors.network_size },
              { label: 'Status (at large)', value: riskBreakdown.contributing_factors.status },
            ].sort((a, b) => b.value - a.value);
            const maxFactor = factors[0].value;
            return (
              <div style={{ background: `${tierColor}0A`, border: `1px solid ${tierColor}33`, borderRadius: 6, padding: '10px 12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <div style={{ fontSize: 9, fontFamily: "'JetBrains Mono', monospace", color: '#64748B', fontWeight: 600, letterSpacing: '0.08em' }}>COMPUTED RISK SCORE</div>
                  <div style={{ fontSize: 18, fontFamily: "'JetBrains Mono', monospace", fontWeight: 800, color: tierColor }}>
                    {riskBreakdown.risk_score}<span style={{ fontSize: 11, color: '#64748B' }}>/100</span>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {factors.map(f => (
                    <div key={f.label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ fontSize: 10, color: '#64748B', width: 120, flexShrink: 0 }}>{f.label}</div>
                      <div style={{ flex: 1, height: 3, background: 'rgba(255,255,255,0.06)', borderRadius: 2 }}>
                        <div style={{ width: `${maxFactor > 0 ? (f.value / maxFactor) * 100 : 0}%`, height: '100%', background: tierColor, borderRadius: 2, opacity: 0.7 }} />
                      </div>
                      <div style={{ fontSize: 10, fontFamily: "'JetBrains Mono', monospace", color: tierColor, width: 28, textAlign: 'right' }}>{f.value}</div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}

          {/* Quick stats */}
          <div style={{ display: 'flex', gap: 8 }}>
            {[
              { label: t('knownAssociates', lang), value: data.associates, color: '#F04E4E' },
              { label: t('activeCases', lang), value: data.cases, color: '#4D9EF5' },
              { label: t('priorArrests', lang), value: data.arrests, color: '#F5A623' },
            ].map((s, i) => (
              <div key={i} style={{
                flex: 1, background: 'var(--bg-raised, #131920)', border: '1px solid #243447',
                borderRadius: 6, padding: '10px 12px', textAlign: 'center',
              }}>
                <div style={{ fontSize: 22, fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, fontVariantNumeric: 'tabular-nums', color: s.color }}>{s.value}</div>
                <div style={{ fontSize: 9, fontFamily: "'JetBrains Mono', monospace", color: '#64748B', fontWeight: 600, letterSpacing: '0.06em', marginTop: 2 }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Last seen */}
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
            <MapPin size={13} color="#64748B" style={{ flexShrink: 0, marginTop: 1 }} />
            <div>
              <div style={{ fontSize: 9, fontFamily: "'JetBrains Mono', monospace", color: '#64748B', fontWeight: 600, letterSpacing: '0.08em' }}>{t('lastSeen', lang).toUpperCase()}</div>
              <div style={{ fontSize: 13, color: '#94A3B8', marginTop: 2 }}>{data.location}</div>
              <div style={{ fontSize: 11, fontFamily: "'JetBrains Mono', monospace", color: '#64748B', marginTop: 1 }}>{data.lastSeen}</div>
            </div>
          </div>

          {/* Crimes */}
          <div>
            <div style={{ fontSize: 9, fontFamily: "'JetBrains Mono', monospace", color: '#64748B', fontWeight: 600, letterSpacing: '0.08em', marginBottom: 6 }}>{t('connectedCrimes', lang).toUpperCase()}</div>
            <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
              {data.crimes.map(c => (
                <span key={c} style={{
                  background: 'rgba(240,78,78,0.1)', color: '#FCA5A5',
                  border: '1px solid rgba(240,78,78,0.25)',
                  borderRadius: 4, padding: '3px 8px', fontSize: 11,
                }}>{c}</span>
              ))}
            </div>
          </div>

          {/* Cases */}
          {data.caseIds.length > 0 && (
            <div>
              <div style={{ fontSize: 9, fontFamily: "'JetBrains Mono', monospace", color: '#64748B', fontWeight: 600, letterSpacing: '0.08em', marginBottom: 6 }}>{t('linkedCases', lang).toUpperCase()}</div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {data.caseIds.map(id => (
                  <button key={id} onClick={() => onCaseClick(id)} style={{
                    background: 'var(--bg-raised, #131920)', border: '1px solid #243447', borderRadius: 4,
                    padding: '4px 10px', fontSize: 12, fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, fontVariantNumeric: 'tabular-nums',
                    color: '#4D9EF5', cursor: 'pointer',
                  }}>{id}</button>
                ))}
              </div>
            </div>
          )}

          {/* Imprisonment note (R. Mehta only) */}
          {data.imprisonedNote && (
            <div style={{ background: 'rgba(240,78,78,0.07)', borderLeft: '2px solid rgba(240,78,78,0.4)', borderRadius: 4, padding: '10px 12px' }}>
              <div style={{ fontSize: 9, fontFamily: "'JetBrains Mono', monospace", color: '#64748B', fontWeight: 600, letterSpacing: '0.08em', marginBottom: 4 }}>DETENTION RECORD</div>
              <div style={{ fontSize: 13, color: '#94A3B8' }}>{data.imprisonedNote}</div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: '12px 16px', borderTop: '1px solid #1E2D3D', flexShrink: 0 }}>
          <button onClick={() => onActionToast(t('commandSent', lang))} style={{
            width: '100%', background: 'rgba(240,78,78,0.15)', border: '1px solid rgba(240,78,78,0.4)',
            color: '#FCA5A5', fontWeight: 600, fontSize: 13, borderRadius: 6, padding: '10px', cursor: 'pointer',
          }}>{t('assignPatrol', lang)}</button>
        </div>
      </div>
    </>
  );
}

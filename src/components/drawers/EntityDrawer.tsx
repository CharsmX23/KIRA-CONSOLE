import { X, MapPin } from 'lucide-react';
import { Avatar } from '../Avatar';
import { Lang, t } from '../../i18n/translations';
import { GANG_MEMBERS, RECENT_ARRESTS } from '../../data';

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
  'D. Nair': { role: 'Kingpin', status: 'WANTED', risk: 'HIGH', associates: 6, cases: 4, arrests: 2, location: 'Unknown', lastSeen: '12 Oct 2024', crimes: ['Drug Trafficking', 'Money Laundering', 'Organized Crime'], caseIds: ['KS0912', 'KS1100'], ring: '#EF4444' },
  'R. Mehta': { role: 'Broker', status: 'AT LARGE', risk: 'HIGH', associates: 7, cases: 2, arrests: 3, location: 'Whitefield, Bengaluru', lastSeen: '18 Dec 2024', crimes: ['Drug Trafficking', 'Money Laundering', 'Financial Fraud'], caseIds: ['KS1207', 'KS1189'], ring: '#F59E0B', imprisonedNote: 'Mar 2021 – Sep 2022 (18mo) — Money Laundering (PoCA)' },
  'S. Khan': { role: 'Operative', status: 'IN CUSTODY', risk: 'HIGH', associates: 3, cases: 2, arrests: 1, location: 'Bengaluru Central Prison', lastSeen: '18 Nov 2023 (arrest)', crimes: ['Money Laundering', 'Drug Logistics'], caseIds: ['KS1207'], ring: '#EF4444' },
  'P. Reddy': { role: 'Operative', status: 'AT LARGE', risk: 'MEDIUM', associates: 2, cases: 1, arrests: 0, location: 'Last seen Indiranagar', lastSeen: '05 Nov 2024', crimes: ['Drug Trafficking'], caseIds: ['KS1189'], ring: '#F59E0B' },
  'T. Kumar': { role: 'Associate', status: 'MONITORING', risk: 'MEDIUM', associates: 2, cases: 1, arrests: 0, location: 'Electronic City', lastSeen: '14 Dec 2024', crimes: ['Financial Fraud'], caseIds: ['KS1094'], ring: '#F59E0B' },
  'M. Ali': { role: 'Associate', status: 'MONITORING', risk: 'MEDIUM', associates: 2, cases: 2, arrests: 1, location: 'Yeshwanthpur', lastSeen: '08 Dec 2024', crimes: ['Financial Fraud', 'Hawala'], caseIds: ['KS1012', 'KS1094'], ring: '#F59E0B' },
  'B. Singh': { role: 'Runner', status: 'UNKNOWN', risk: 'LOW', associates: 1, cases: 1, arrests: 0, location: 'Unknown', lastSeen: 'Unknown', crimes: ['Drug Courier'], caseIds: [], ring: '#475569' },
};

const riskColor: Record<string, { bg: string; text: string; border: string }> = {
  HIGH: { bg: 'rgba(239,68,68,0.15)', text: '#FCA5A5', border: 'rgba(239,68,68,0.4)' },
  MEDIUM: { bg: 'rgba(245,158,11,0.15)', text: '#FCD34D', border: 'rgba(245,158,11,0.4)' },
  LOW: { bg: 'rgba(34,197,94,0.15)', text: '#86EFAC', border: 'rgba(34,197,94,0.4)' },
};

const statusColors: Record<string, { bg: string; text: string }> = {
  'WANTED': { bg: 'rgba(239,68,68,0.15)', text: '#FCA5A5' },
  'AT LARGE': { bg: 'rgba(239,68,68,0.15)', text: '#FCA5A5' },
  'IN CUSTODY': { bg: 'rgba(34,197,94,0.15)', text: '#86EFAC' },
  'MONITORING': { bg: 'rgba(245,158,11,0.15)', text: '#FCD34D' },
  'UNKNOWN': { bg: 'rgba(100,116,139,0.15)', text: '#94A3B8' },
};

// Also handle arrest records
const ARREST_MAP = Object.fromEntries(RECENT_ARRESTS.map(a => [a.name, a]));
const CAT_RING: Record<string, string> = { financial: '#EF4444', theft: '#F59E0B', cyber: '#60A5FA', drug: '#8B5CF6', robbery: '#EF4444' };

export function EntityDrawer({ name, lang, onClose, onCaseClick, onActionToast }: EntityDrawerProps) {
  const data = SUSPECT_DATA[name];

  // If it's an arrest record (and not in suspect data), show arrest drawer
  const arrest = ARREST_MAP[name];
  if (!data && arrest) {
    const ring = CAT_RING[arrest.category] ?? '#475569';
    return (
      <>
        <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 40 }} />
        <div className="slide-in-right" style={{
          position: 'absolute', top: 0, right: 0, bottom: 0, width: 420,
          background: '#0A1120', borderLeft: `1px solid ${ring}44`,
          borderTop: `3px solid ${ring}`, zIndex: 50, display: 'flex', flexDirection: 'column',
          boxShadow: '-8px 0 32px rgba(0,0,0,0.6)',
        }}>
          <div style={{ padding: '16px 16px 12px', borderBottom: '1px solid #162035', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#E2E8F0' }}>{arrest.name}</div>
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
                  <div style={{ fontSize: 9, fontFamily: 'monospace', color: '#64748B', letterSpacing: '0.08em' }}>{f.label.toUpperCase()}</div>
                  <div style={{ fontSize: 13, color: '#E2E8F0', marginTop: 2 }}>{f.value}</div>
                </div>
              ))}
            </div>
            <div>
              <div style={{ fontSize: 9, fontFamily: 'monospace', color: '#64748B', letterSpacing: '0.08em', marginBottom: 6 }}>EVIDENCE</div>
              {arrest.evidence.map((e, i) => (
                <div key={i} style={{ fontSize: 13, color: '#94A3B8', lineHeight: 1.6, marginBottom: 3 }}>• {e}</div>
              ))}
            </div>
            <div style={{ fontSize: 14, color: '#94A3B8', lineHeight: 1.7, borderTop: '1px solid #162035', paddingTop: 12 }}>
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
        background: '#0A1120',
        borderLeft: `1px solid ${data.ring}44`,
        borderTop: `3px solid ${data.ring}`,
        zIndex: 50, display: 'flex', flexDirection: 'column',
        boxShadow: '-8px 0 32px rgba(0,0,0,0.6)',
      }}>
        {/* Header */}
        <div style={{ padding: '16px 16px 12px', borderBottom: '1px solid #162035', flexShrink: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#E2E8F0' }}>{name}</div>
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
              fontSize: 11, fontFamily: 'monospace', fontWeight: 700, color: rc.text,
            }}>{data.risk} RISK</div>
            <div style={{
              background: sc.bg, borderRadius: 4, padding: '4px 10px',
              fontSize: 11, fontFamily: 'monospace', fontWeight: 700, color: sc.text,
            }}>{data.status}</div>
          </div>

          {/* Quick stats */}
          <div style={{ display: 'flex', gap: 8 }}>
            {[
              { label: t('knownAssociates', lang), value: data.associates, color: '#EF4444' },
              { label: t('activeCases', lang), value: data.cases, color: '#60A5FA' },
              { label: t('priorArrests', lang), value: data.arrests, color: '#F59E0B' },
            ].map((s, i) => (
              <div key={i} style={{
                flex: 1, background: '#0D1828', border: '1px solid #1E2D45',
                borderRadius: 6, padding: '10px 12px', textAlign: 'center',
              }}>
                <div style={{ fontSize: 22, fontFamily: 'monospace', fontWeight: 700, color: s.color }}>{s.value}</div>
                <div style={{ fontSize: 9, fontFamily: 'monospace', color: '#64748B', letterSpacing: '0.06em', marginTop: 2 }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Last seen */}
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
            <MapPin size={13} color="#64748B" style={{ flexShrink: 0, marginTop: 1 }} />
            <div>
              <div style={{ fontSize: 9, fontFamily: 'monospace', color: '#64748B', letterSpacing: '0.08em' }}>{t('lastSeen', lang).toUpperCase()}</div>
              <div style={{ fontSize: 13, color: '#94A3B8', marginTop: 2 }}>{data.location}</div>
              <div style={{ fontSize: 11, fontFamily: 'monospace', color: '#64748B', marginTop: 1 }}>{data.lastSeen}</div>
            </div>
          </div>

          {/* Crimes */}
          <div>
            <div style={{ fontSize: 9, fontFamily: 'monospace', color: '#64748B', letterSpacing: '0.08em', marginBottom: 6 }}>{t('connectedCrimes', lang).toUpperCase()}</div>
            <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
              {data.crimes.map(c => (
                <span key={c} style={{
                  background: 'rgba(239,68,68,0.1)', color: '#FCA5A5',
                  border: '1px solid rgba(239,68,68,0.25)',
                  borderRadius: 4, padding: '3px 8px', fontSize: 11,
                }}>{c}</span>
              ))}
            </div>
          </div>

          {/* Cases */}
          {data.caseIds.length > 0 && (
            <div>
              <div style={{ fontSize: 9, fontFamily: 'monospace', color: '#64748B', letterSpacing: '0.08em', marginBottom: 6 }}>{t('linkedCases', lang).toUpperCase()}</div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {data.caseIds.map(id => (
                  <button key={id} onClick={() => onCaseClick(id)} style={{
                    background: '#0D1828', border: '1px solid #1E2D45', borderRadius: 4,
                    padding: '4px 10px', fontSize: 12, fontFamily: 'monospace', fontWeight: 700,
                    color: '#60A5FA', cursor: 'pointer',
                  }}>{id}</button>
                ))}
              </div>
            </div>
          )}

          {/* Imprisonment note (R. Mehta only) */}
          {data.imprisonedNote && (
            <div style={{ background: 'rgba(239,68,68,0.07)', borderLeft: '2px solid rgba(239,68,68,0.4)', borderRadius: 4, padding: '10px 12px' }}>
              <div style={{ fontSize: 9, fontFamily: 'monospace', color: '#64748B', letterSpacing: '0.08em', marginBottom: 4 }}>DETENTION RECORD</div>
              <div style={{ fontSize: 13, color: '#94A3B8' }}>{data.imprisonedNote}</div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: '12px 16px', borderTop: '1px solid #162035', flexShrink: 0 }}>
          <button onClick={() => onActionToast(t('commandSent', lang))} style={{
            width: '100%', background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.4)',
            color: '#FCA5A5', fontWeight: 600, fontSize: 13, borderRadius: 6, padding: '10px', cursor: 'pointer',
          }}>{t('assignPatrol', lang)}</button>
        </div>
      </div>
    </>
  );
}

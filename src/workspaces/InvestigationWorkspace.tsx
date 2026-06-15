import { useState } from 'react';
import {
  Camera, Car, Smartphone, Landmark, UserCheck, TrendingUp,
  Zap, Shield, Users, MapPin
} from 'lucide-react';
import { Avatar } from '../components/Avatar';
import { Lang, t } from '../i18n/translations';
import { EVIDENCE, EC, GANG_MEMBERS, OFFENDER_FOOTPRINT } from '../data';

interface InvestigationProgress {
  modeActivated: boolean;
  profileLoaded: boolean;
  casesLoaded: boolean;
  evidenceLoaded: boolean;
  evidenceNodesShown: number;
  networkLoaded: boolean;
  recommendationLoaded: boolean;
}

interface InvestigationWorkspaceProps {
  lang: Lang;
  progress: InvestigationProgress;
  isVoice: boolean;
  onEvidenceClick: (title: string) => void;
  onGangMemberClick: (name: string) => void;
  onActionToast: (msg: string) => void;
  onCaseClick: (caseId: string) => void;
}

const EVIDENCE_ICONS: Record<string, React.ComponentType<{ size?: number; color?: string }>> = {
  VISUAL: Camera, PHYSICAL: Car, DIGITAL: Smartphone,
  FINANCIAL: Landmark, TESTIMONY: UserCheck, ANALYTICS: TrendingUp,
};

const statusColors: Record<string, { bg: string; text: string; border: string }> = {
  'CONVICTED': { bg: 'rgba(34,197,94,0.12)', text: '#86EFAC', border: 'rgba(34,197,94,0.3)' },
  'CLOSED': { bg: 'rgba(100,116,139,0.12)', text: '#94A3B8', border: 'rgba(100,116,139,0.3)' },
  'UNDER REVIEW': { bg: 'rgba(245,158,11,0.12)', text: '#FCD34D', border: 'rgba(245,158,11,0.3)' },
  'ACTIVE': { bg: 'rgba(239,68,68,0.12)', text: '#FCA5A5', border: 'rgba(239,68,68,0.3)' },
};

const gangStatusColors: Record<string, { bg: string; text: string }> = {
  'WANTED': { bg: 'rgba(239,68,68,0.15)', text: '#FCA5A5' },
  'AT LARGE': { bg: 'rgba(239,68,68,0.15)', text: '#FCA5A5' },
  'IN CUSTODY': { bg: 'rgba(34,197,94,0.15)', text: '#86EFAC' },
  'MONITORING': { bg: 'rgba(245,158,11,0.15)', text: '#FCD34D' },
  'UNKNOWN': { bg: 'rgba(100,116,139,0.15)', text: '#94A3B8' },
};

export function InvestigationWorkspace({
  lang, progress, isVoice, onEvidenceClick, onGangMemberClick, onActionToast, onCaseClick,
}: InvestigationWorkspaceProps) {
  const [activeEvidence, setActiveEvidence] = useState<string | null>(null);

  const handleEvidenceClick = (title: string) => {
    setActiveEvidence(prev => prev === title ? null : title);
    onEvidenceClick(title);
  };

  const level1 = GANG_MEMBERS.filter(m => m.level === 1);
  const level2 = GANG_MEMBERS.filter(m => m.level === 2);
  const kingpin = GANG_MEMBERS.find(m => m.level === 0)!;

  return (
    <div className="left-panel-scroll" style={{ flex: 1, overflowY: 'auto', background: '#060A12', padding: '8px 12px', display: 'flex', flexDirection: 'column', gap: 10 }}>

      {/* Mode activated banner */}
      {progress.modeActivated && !progress.profileLoaded && (
        <div className="fade-up" style={{
          background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)',
          borderRadius: 8, padding: '14px 16px', textAlign: 'center',
        }}>
          <div style={{ fontSize: 14, fontFamily: 'monospace', color: '#FCA5A5', fontWeight: 700, letterSpacing: '0.12em' }}>
            {isVoice ? t('voiceInvestigationMode', lang) : t('investigationModeActivated', lang)}
          </div>
        </div>
      )}

      {/* Investigation Summary Panel */}
      {progress.modeActivated && (
        <div className="fade-up" style={{
          display: 'flex', gap: 8, flexShrink: 0,
        }}>
          {[
            { label: t('caseConfidence', lang), value: '91%', color: '#60A5FA' },
            { label: t('evidenceNodes', lang), value: `${progress.evidenceNodesShown}/7`, color: '#22C55E' },
            { label: t('riskLevel', lang), value: t('high', lang), color: '#EF4444' },
            { label: t('associates', lang), value: '7', color: '#8B5CF6' },
            { label: t('recommendedAction', lang), value: t('monitorTransactions', lang), color: '#F59E0B' },
          ].map((item, i) => (
            <div key={i} style={{
              flex: 1, background: '#0D1828', border: '1px solid #162035',
              borderRadius: 6, padding: '8px 10px', minWidth: 0,
            }}>
              <div style={{ fontSize: 9, fontFamily: 'monospace', color: '#64748B', letterSpacing: '0.08em', marginBottom: 4 }}>{item.label}</div>
              <div style={{ fontSize: 13, fontFamily: 'monospace', fontWeight: 700, color: item.color, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.value}</div>
            </div>
          ))}
        </div>
      )}

      {/* AI Narrative Strip */}
      {progress.profileLoaded && (
        <div className="fade-up" style={{
          background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.2)',
          borderRadius: 8, padding: '12px 14px', display: 'flex', alignItems: 'flex-start', gap: 10,
        }}>
          <Zap size={16} color="#60A5FA" style={{ flexShrink: 0, marginTop: 1 }} />
          <div style={{ flex: 1, fontSize: 15, color: '#93C5FD', lineHeight: 1.6 }}>
            R. Mehta is suspected to be part of Cluster K-7. Cross-linking CCTV footage, vehicle logs, phone records, and financial transactions reveals a 91% confidence association. Evidence chain leads from warehouse CCTV to confirmed financial fraud cluster overlap.
          </div>
          <div style={{
            background: 'rgba(59,130,246,0.15)', borderRadius: 4,
            padding: '4px 8px', fontSize: 11, fontFamily: 'monospace', color: '#93C5FD',
            flexShrink: 0, fontWeight: 700,
          }}>91% CONF</div>
        </div>
      )}

      {/* Suspect Profile — Full Dossier */}
      {progress.profileLoaded && (
        <div className="fade-up" style={{
          background: '#0A1120',
          border: '1px solid rgba(239,68,68,0.25)',
          borderTop: '2px solid rgba(239,68,68,0.5)',
          borderRadius: 10, padding: 20,
        }}>
          {/* Dossier header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, borderBottom: '1px solid #162035', paddingBottom: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Shield size={13} color="rgba(239,68,68,0.7)" />
              <span style={{ fontSize: 10, fontFamily: 'monospace', color: '#64748B', letterSpacing: '0.12em' }}>CRIMINAL DOSSIER — KIRA REF: KP-2024-RM-001</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span className="blink-fast" style={{ width: 5, height: 5, borderRadius: '50%', background: '#EF4444', display: 'inline-block' }} />
              <span style={{ fontSize: 10, fontFamily: 'monospace', color: '#EF4444', letterSpacing: '0.1em' }}>ACTIVE WARRANT</span>
            </div>
          </div>

          {/* Main layout: photo | bio | stats */}
          <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>

            {/* LEFT — Photo column */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, flexShrink: 0 }}>
              <Avatar name="RMehta" size={220} riskRing="#EF4444" square />
              {/* Status dot */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <div className="glow-pulse-red" style={{ width: 9, height: 9, borderRadius: '50%', background: '#EF4444' }} />
                <span style={{ fontSize: 10, fontFamily: 'monospace', color: '#FCA5A5', letterSpacing: '0.08em' }}>AT LARGE</span>
              </div>
              <div style={{ fontSize: 9, color: '#334155', fontFamily: 'monospace', letterSpacing: '0.06em' }}>
                {t('syntheticId', lang)}
              </div>
              {/* Mugshot label */}
              <div style={{
                background: '#0D1828', border: '1px solid #162035', borderRadius: 4,
                padding: '4px 10px', width: '100%', textAlign: 'center',
              }}>
                <div style={{ fontSize: 9, fontFamily: 'monospace', color: '#64748B', letterSpacing: '0.1em' }}>MUGSHOT ID</div>
                <div style={{ fontSize: 11, fontFamily: 'monospace', color: '#60A5FA', fontWeight: 700 }}>KSP-MG-22847</div>
              </div>
              {/* Photo date */}
              <div style={{ fontSize: 9, color: '#334155', fontFamily: 'monospace', textAlign: 'center' }}>
                Photo: 14 Mar 2021<br />Last updated: Sep 2022
              </div>
            </div>

            {/* CENTER — Bio details */}
            <div style={{ flex: 1, minWidth: 0 }}>
              {/* Name + Risk */}
              <div style={{ marginBottom: 10 }}>
                <div style={{ fontSize: 20, fontWeight: 700, color: '#E2E8F0', lineHeight: 1.2, marginBottom: 4 }}>
                  Rajesh Kumar Mehta
                </div>
                <div style={{ fontSize: 12, color: '#64748B', fontStyle: 'italic', marginBottom: 8 }}>
                  a.k.a. "The Broker" · "RK"
                </div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  <div style={{
                    display: 'inline-flex', alignItems: 'center', gap: 4,
                    background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.4)',
                    borderRadius: 4, padding: '3px 9px',
                  }}>
                    <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#EF4444', display: 'inline-block' }} />
                    <span style={{ fontSize: 11, fontFamily: 'monospace', color: '#FCA5A5', fontWeight: 700, letterSpacing: '0.08em' }}>{t('highRisk', lang)}</span>
                  </div>
                  <div style={{ background: '#0D1828', border: '1px solid #1E2D45', borderRadius: 4, padding: '3px 9px' }}>
                    <span style={{ fontSize: 11, fontFamily: 'monospace', color: '#8B5CF6', fontWeight: 700 }}>CLUSTER K-7</span>
                  </div>
                </div>
              </div>

              {/* Bio grid */}
              <div style={{
                background: '#0D1828', border: '1px solid #162035', borderRadius: 6,
                padding: '10px 12px', marginBottom: 10,
                display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 20px',
              }}>
                {[
                  { label: 'AGE', value: '38 years', color: '#E2E8F0' },
                  { label: 'DATE OF BIRTH', value: '14 Mar 1987', color: '#94A3B8' },
                  { label: 'NATIONALITY', value: 'Indian', color: '#94A3B8' },
                  { label: 'HEIGHT / WEIGHT', value: '178 cm / 74 kg', color: '#94A3B8' },
                  { label: 'BLOOD TYPE', value: 'B+', color: '#94A3B8' },
                  { label: 'AADHAR (MASKED)', value: 'XXXX-XXXX-4821', color: '#60A5FA' },
                  { label: 'PASSPORT', value: 'T9284716 (EXPIRED)', color: '#F59E0B' },
                  { label: 'OCCUPATION', value: 'Proprietor, Mehta Exports', color: '#94A3B8' },
                ].map((f, i) => (
                  <div key={i} style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 9, fontFamily: 'monospace', color: '#64748B', letterSpacing: '0.08em' }}>{f.label}</div>
                    <div style={{ fontSize: 12, color: f.color, marginTop: 1, fontFamily: f.label.includes('AADHAR') || f.label.includes('PASSPORT') ? 'monospace' : 'inherit', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.value}</div>
                  </div>
                ))}
              </div>

              {/* Physical description */}
              <div style={{
                background: '#0D1828', border: '1px solid #162035', borderRadius: 6,
                padding: '8px 12px', marginBottom: 10,
                display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '6px 16px',
              }}>
                <div style={{ fontSize: 9, fontFamily: 'monospace', color: '#64748B', letterSpacing: '0.08em', gridColumn: '1/-1', marginBottom: 2 }}>PHYSICAL DESCRIPTION</div>
                {[
                  { label: 'BUILD', value: 'Medium' },
                  { label: 'COMPLEXION', value: 'Fair' },
                  { label: 'HAIR', value: 'Black, short' },
                  { label: 'EYES', value: 'Brown' },
                  { label: 'MARKS', value: 'Scar — left forearm' },
                  { label: 'LANGUAGE', value: 'Hindi · Kannada · English' },
                ].map((f, i) => (
                  <div key={i} style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 9, fontFamily: 'monospace', color: '#64748B', letterSpacing: '0.06em' }}>{f.label}</div>
                    <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.value}</div>
                  </div>
                ))}
              </div>

              {/* Last seen */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10, padding: '6px 10px', background: 'rgba(239,68,68,0.06)', borderRadius: 4, border: '1px solid rgba(239,68,68,0.15)' }}>
                <MapPin size={12} color="#EF4444" />
                <span style={{ fontSize: 11, fontFamily: 'monospace', color: '#64748B' }}>{t('lastSeen', lang).toUpperCase()}</span>
                <span style={{ fontSize: 12, color: '#FCA5A5', fontWeight: 600 }}>Whitefield, Bengaluru</span>
                <span style={{ fontSize: 11, fontFamily: 'monospace', color: '#64748B' }}>· 18 Dec 2024 · 11:32 PM</span>
              </div>

              {/* Connected crimes + cases in a row */}
              <div style={{ display: 'flex', gap: 10 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 9, fontFamily: 'monospace', color: '#64748B', letterSpacing: '0.08em', marginBottom: 5 }}>{t('connectedCrimes', lang)}</div>
                  <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                    {['Drug Trafficking', 'Money Laundering', 'Financial Fraud'].map(crime => (
                      <span key={crime} style={{
                        background: 'rgba(239,68,68,0.1)', color: '#FCA5A5',
                        border: '1px solid rgba(239,68,68,0.25)',
                        borderRadius: 4, padding: '3px 7px', fontSize: 10,
                      }}>{crime}</span>
                    ))}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 9, fontFamily: 'monospace', color: '#64748B', letterSpacing: '0.08em', marginBottom: 5 }}>{t('linkedCases', lang)}</div>
                  <div style={{ display: 'flex', gap: 5 }}>
                    {[{ id: 'KS1207', crime: 'Money laundering' }, { id: 'KS1189', crime: 'Drug trafficking' }].map(c => (
                      <div key={c.id} onClick={() => onCaseClick(c.id)}
                        style={{
                          background: '#0D1828', border: '1px solid #1E2D45', borderRadius: 5,
                          padding: '5px 9px', cursor: 'pointer',
                        }}>
                        <div style={{ fontSize: 12, fontFamily: 'monospace', fontWeight: 700, color: '#60A5FA' }}>{c.id}</div>
                        <div style={{ fontSize: 10, color: '#64748B' }}>{c.crime}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT — Stat boxes */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flexShrink: 0, width: 110 }}>
              {[
                { label: t('activeCases', lang), value: '2', color: '#60A5FA', sub: 'Open files' },
                { label: t('knownAssociates', lang), value: '7', color: '#EF4444', sub: 'Cluster K-7' },
                { label: t('priorArrests', lang), value: '3', color: '#F59E0B', sub: 'Since 2018' },
                { label: 'KNOWN VEHICLES', value: '2', color: '#8B5CF6', sub: 'KA01AB1234' },
                { label: 'PHONE SIMs', value: '3', color: '#06B6D4', sub: 'Multiple IDs' },
                { label: 'THREAT SCORE', value: '91', color: '#EF4444', sub: 'out of 100' },
              ].map((s, i) => (
                <div key={i} style={{
                  background: '#0D1828', border: '1px solid #1E2D45',
                  borderRadius: 6, padding: '8px 10px', textAlign: 'center',
                }}>
                  <div style={{ fontSize: 24, fontFamily: 'monospace', fontWeight: 700, color: s.color, lineHeight: 1 }}>{s.value}</div>
                  <div style={{ fontSize: 9, fontFamily: 'monospace', color: '#64748B', letterSpacing: '0.04em', marginTop: 3 }}>{s.label}</div>
                  <div style={{ fontSize: 9, color: '#334155', marginTop: 1 }}>{s.sub}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Detention Timeline */}
      {progress.casesLoaded && (
        <div className="fade-up" style={{ background: '#0D1828', border: '1px solid #162035', borderRadius: 8, padding: '12px 14px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ fontSize: 11, fontFamily: 'monospace', color: '#94A3B8', letterSpacing: '0.08em' }}>{t('detentionTimeline', lang)}</span>
            <span style={{ fontSize: 12, fontFamily: 'monospace', color: '#FCA5A5' }}>{t('imprisonedLabel', lang)}</span>
          </div>
          <div style={{ background: '#162035', borderRadius: 4, height: 8, position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', left: 0, top: 0, width: '40%', height: '100%', background: 'rgba(239,68,68,0.7)', borderRadius: '4px 0 0 4px' }} />
            <div style={{ position: 'absolute', left: '40%', top: 0, width: '60%', height: '100%', background: 'rgba(34,197,94,0.3)', borderRadius: '0 4px 4px 0' }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
            <span style={{ fontSize: 12, fontFamily: 'monospace', color: '#FCA5A5' }}>■ Mar 2021 → Sep 2022 (18mo imprisoned)</span>
            <span style={{ fontSize: 12, fontFamily: 'monospace', color: '#86EFAC' }}>■ {t('freeLabel', lang)}</span>
          </div>
          <div style={{ fontSize: 12, color: '#94A3B8', marginTop: 4 }}>{t('releasedOn', lang)}</div>
        </div>
      )}

      {/* Offender Footprint */}
      {progress.casesLoaded && (
        <div className="fade-up" style={{ background: '#0D1828', border: '1px solid #162035', borderRadius: 8, padding: '12px 14px' }}>
          <div style={{ fontSize: 13, fontFamily: 'monospace', color: '#94A3B8', letterSpacing: '0.1em', marginBottom: 10 }}>
            {t('offenderFootprint', lang)}
          </div>
          <div className="pinboard-scroll" style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
            {OFFENDER_FOOTPRINT.map((fp) => {
              const sc = statusColors[fp.status] ?? statusColors['CLOSED'];
              return (
                <div key={fp.caseId} onClick={() => onCaseClick(fp.caseId)}
                  style={{
                    background: '#0A1120', border: '1px solid #1E2D45', borderRadius: 6,
                    padding: '10px 14px', minWidth: 150, cursor: 'pointer',
                    transition: 'border-color 0.15s',
                    flexShrink: 0,
                  }}
                  onMouseEnter={e => (e.currentTarget.style.borderColor = '#334155')}
                  onMouseLeave={e => (e.currentTarget.style.borderColor = '#1E2D45')}
                >
                  <div style={{ fontSize: 13, fontFamily: 'monospace', fontWeight: 700, color: '#60A5FA', marginBottom: 3 }}>{fp.caseId}</div>
                  <div style={{ fontSize: 12, color: '#94A3B8', marginBottom: 6 }}>{fp.crime}</div>
                  <div style={{ background: sc.bg, border: `1px solid ${sc.border}`, borderRadius: 4, padding: '2px 6px', display: 'inline-block' }}>
                    <span style={{ fontSize: 11, fontFamily: 'monospace', fontWeight: 700, color: sc.text }}>{fp.status}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Evidence Chain Pinboard */}
      {progress.evidenceLoaded && (
        <div className="fade-up" style={{
          background: '#0D0900', border: '1px solid rgba(220,38,38,0.15)',
          borderRadius: 10, padding: 20,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Shield size={14} color="rgba(220,38,38,0.85)" />
              <span style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.12em', color: 'rgba(220,38,38,0.85)', fontFamily: 'monospace' }}>
                {t('evidenceChain', lang)}
              </span>
            </div>
            <span style={{ fontSize: 10, fontFamily: 'monospace', color: '#64748B' }}>
              {`{6} ${t('evidenceItems', lang)}`}
            </span>
          </div>

          {/* Pinboard horizontal scroll */}
          <div className="pinboard-scroll" style={{ overflowX: 'auto', paddingBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', minWidth: 'max-content', paddingTop: 14 }}>
              {EVIDENCE.slice(0, progress.evidenceNodesShown).map((ev, i) => {
                const Icon = EVIDENCE_ICONS[ev.type];
                const typeColor = EC[ev.type];
                const isActive = activeEvidence === ev.title;
                return (
                  <div key={ev.id} style={{ display: 'flex', alignItems: 'center' }}>
                    <div
                      className={`evidence-card${isActive ? ' active' : ''}`}
                      onClick={() => handleEvidenceClick(ev.title)}
                      style={{
                        width: 160, minHeight: 180,
                        background: '#181200', border: `1px solid rgba(220,38,38,0.18)`,
                        borderRadius: 6, padding: '26px 12px 14px',
                        position: 'relative',
                        display: 'flex', flexDirection: 'column', alignItems: 'center',
                        animation: `fadeUpIn 0.4s ease-out ${i * 0.12}s both`,
                      }}
                    >
                      {/* Red pin */}
                      <div style={{
                        position: 'absolute', top: -9, left: '50%', transform: 'translateX(-50%)',
                        width: 17, height: 17, borderRadius: '50%',
                        background: '#DC2626', border: '2px solid #7f1d1d',
                        boxShadow: '0 0 6px rgba(220,38,38,0.6)',
                        zIndex: 1,
                      }} />
                      {/* Type label */}
                      <div style={{ fontSize: 9, fontFamily: 'monospace', color: typeColor, letterSpacing: '0.12em', marginBottom: 6 }}>{ev.type}</div>
                      <Icon size={17} color={typeColor} />
                      <div style={{ fontSize: 13, fontWeight: 600, color: '#E2E8F0', marginTop: 6, textAlign: 'center' }}>{ev.title}</div>
                      <div style={{ fontSize: 12, color: '#64748B', marginTop: 4, textAlign: 'center' }}>{ev.detail}</div>
                      {/* Confidence bar */}
                      <div style={{ width: '100%', marginTop: 10 }}>
                        <div style={{ height: 2, background: '#2D1E00', borderRadius: 1, overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${ev.confidence}%`, background: typeColor, borderRadius: 1 }} />
                        </div>
                        <div style={{ textAlign: 'right', fontSize: 11, fontFamily: 'monospace', color: typeColor, marginTop: 3 }}>
                          {ev.confidence}%
                        </div>
                      </div>
                    </div>
                    {/* Connector SVG */}
                    {i < EVIDENCE.slice(0, progress.evidenceNodesShown).length - 1 && (
                      <svg width={52} height={14} style={{ flexShrink: 0 }}>
                        <line x1={2} y1={7} x2={44} y2={7}
                          stroke="#DC2626" strokeWidth={3} strokeDasharray="4 2" opacity={0.65} />
                        <polygon points="44,3 52,7 44,11" fill="#DC2626" opacity={0.65} />
                      </svg>
                    )}
                  </div>
                );
              })}

              {/* Final connector to suspect */}
              {progress.evidenceNodesShown >= 6 && (
                <>
                  <svg width={52} height={14} style={{ flexShrink: 0 }}>
                    <line x1={2} y1={7} x2={44} y2={7} stroke="#DC2626" strokeWidth={3} />
                    <polygon points="44,3 52,7 44,11" fill="#DC2626" />
                  </svg>
                  {/* Suspect target card */}
                  <div style={{
                    width: 120, minHeight: 180,
                    background: 'rgba(239,68,68,0.1)', border: '2px solid rgba(239,68,68,0.5)',
                    boxShadow: '0 0 24px rgba(239,68,68,0.18)',
                    borderRadius: 6, padding: '26px 8px 14px',
                    position: 'relative',
                    display: 'flex', flexDirection: 'column', alignItems: 'center',
                  }}>
                    <div className="glow-pulse-red" style={{
                      position: 'absolute', top: -9, left: '50%', transform: 'translateX(-50%)',
                      width: 17, height: 17, borderRadius: '50%',
                      background: '#DC2626', border: '2px solid #7f1d1d',
                      zIndex: 1,
                    }} />
                    <Avatar name="RMehta" size={56} riskRing="#EF4444" />
                    <div style={{ fontSize: 11, fontFamily: 'monospace', fontWeight: 700, color: '#FCA5A5', marginTop: 8 }}>R. MEHTA</div>
                    <div style={{ fontSize: 9, fontFamily: 'monospace', color: '#64748B', marginTop: 3 }}>SUSPECT</div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Gang Structure */}
      {progress.networkLoaded && (
        <div className="fade-up" style={{
          background: '#0D1828', border: '1px solid #162035', borderRadius: 8, padding: '14px 16px',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Users size={14} color="#8B5CF6" />
              <span style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.1em', color: '#94A3B8', fontFamily: 'monospace' }}>
                {t('gangStructure', lang)} · Cluster K-7
              </span>
            </div>
            <span style={{
              background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)',
              borderRadius: 4, padding: '2px 8px',
              fontSize: 11, fontFamily: 'monospace', color: '#FCA5A5',
            }}>7 {t('members', lang)}</span>
          </div>

          {/* Level 0 — Kingpin */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 0 }}>
            <GangCard member={kingpin} size={68} onClick={() => onGangMemberClick(kingpin.name)} lang={lang} />
          </div>

          {/* Vertical connector */}
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <div style={{ width: 1, height: 20, background: 'rgba(239,68,68,0.3)' }} />
          </div>

          {/* Horizontal line for level 1 */}
          <div style={{ position: 'relative', marginBottom: 0 }}>
            <div style={{ height: 1, background: 'rgba(239,68,68,0.25)' }} />
            {/* Drops */}
            <div style={{ display: 'flex', justifyContent: 'space-around' }}>
              {level1.map(() => (
                <div key={Math.random()} style={{ width: 1, height: 10, background: 'rgba(239,68,68,0.25)' }} />
              ))}
            </div>
          </div>

          {/* Level 1 */}
          <div style={{ display: 'flex', justifyContent: 'space-around', gap: 14, marginBottom: 0 }}>
            {level1.map(m => (
              <GangCard key={m.name} member={m} size={46} onClick={() => onGangMemberClick(m.name)} lang={lang} />
            ))}
          </div>

          {/* Connector to level 2 */}
          <div style={{ height: 1, background: 'rgba(239,68,68,0.15)', margin: '8px 0 0' }} />
          <div style={{ display: 'flex', justifyContent: 'space-around' }}>
            {level2.map(() => (
              <div key={Math.random()} style={{ width: 1, height: 10, background: 'rgba(239,68,68,0.15)' }} />
            ))}
          </div>

          {/* Level 2 */}
          <div style={{ display: 'flex', justifyContent: 'space-around', gap: 10, marginBottom: 10 }}>
            {level2.map(m => (
              <GangCard key={m.name} member={m} size={40} onClick={() => onGangMemberClick(m.name)} lang={lang} />
            ))}
          </div>

          <div style={{ textAlign: 'center', fontSize: 10, color: '#334155', marginTop: 4 }}>
            {t('clickForFile', lang)}
          </div>
        </div>
      )}

      {/* AI Recommendation */}
      {progress.recommendationLoaded && (
        <div className="fade-up" style={{
          background: 'rgba(245,158,11,0.05)',
          border: '1px solid rgba(245,158,11,0.3)',
          borderLeft: '3px solid rgba(245,158,11,0.6)',
          borderRadius: 10, padding: 20,
          marginBottom: 12,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
            <Zap size={14} color="#F59E0B" />
            <span style={{ fontSize: 11, fontFamily: 'monospace', color: '#FCD34D', letterSpacing: '0.1em', fontWeight: 700 }}>
              {t('aiRecommendation', lang)}
            </span>
            <span style={{ fontSize: 11, fontFamily: 'monospace', color: '#64748B' }}>· 91% confidence</span>
          </div>
          <div style={{ fontSize: 13, color: '#FCD34D', lineHeight: 1.7, marginBottom: 14 }}>
            {t('aiRecommendationText', lang)}
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button onClick={() => onActionToast(t('commandSent', lang))} style={{
              background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.4)',
              color: '#FCD34D', fontWeight: 600, fontSize: 12, borderRadius: 6,
              padding: '8px 14px', cursor: 'pointer',
            }}>{t('assignPatrol', lang)}</button>
            {[
              { label: t('flagHighRisk', lang), toast: t('flagged', lang) },
              { label: t('notifyCybercrime', lang), toast: t('notified', lang) },
              { label: t('generateReport', lang), toast: t('reportGenerated', lang) },
            ].map(btn => (
              <button key={btn.label} onClick={() => onActionToast(btn.toast)} style={{
                background: 'transparent', border: '1px solid rgba(245,158,11,0.2)',
                color: '#64748B', fontSize: 12, borderRadius: 6,
                padding: '8px 14px', cursor: 'pointer',
              }}>{btn.label}</button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function GangCard({ member, size, onClick, lang }: {
  member: typeof GANG_MEMBERS[0]; size: number; onClick: () => void; lang: Lang;
}) {
  const sc = gangStatusColors[member.status] ?? gangStatusColors['UNKNOWN'];
  const isTarget = member.isTarget;

  return (
    <div className="gang-card" onClick={onClick} style={{
      background: isTarget ? 'rgba(245,158,11,0.08)' : '#0D1828',
      border: `1px solid ${isTarget ? 'rgba(245,158,11,0.45)' : '#162035'}`,
      boxShadow: isTarget ? '0 0 18px rgba(245,158,11,0.15)' : undefined,
      borderRadius: 8, padding: '10px 10px 8px',
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
      position: 'relative', minWidth: 90,
    }}>
      {isTarget && (
        <div style={{
          position: 'absolute', top: -1, left: '50%', transform: 'translateX(-50%)',
          background: '#F59E0B', color: '#000', fontSize: 8, fontWeight: 800,
          padding: '1px 5px', borderRadius: '0 0 3px 3px', letterSpacing: '0.05em',
        }}>{lang === 'kn' ? 'ಗುರಿ' : 'TARGET'}</div>
      )}
      <Avatar name={member.name} size={size} riskRing={member.ring} square />
      <div style={{ fontSize: 11, fontWeight: 600, color: '#E2E8F0', textAlign: 'center' }}>{member.name}</div>
      <div style={{ fontSize: 9, fontFamily: 'monospace', color: '#64748B' }}>{member.role}</div>
      <div style={{
        background: sc.bg, borderRadius: 3,
        padding: '2px 5px', fontSize: 9, fontFamily: 'monospace', fontWeight: 700, color: sc.text,
      }}>{member.status}</div>
    </div>
  );
}

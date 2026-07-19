import { useState, useEffect } from 'react';
import { Lang } from '../i18n/translations';

const API_BASE = import.meta.env.VITE_API_URL || 'https://kiraconsole.development.catalystappsail.in';

interface SimilarCase {
  case_id: string;
  crime: string;
  status: string;
  similarity_score: number;
  summary: string;
}

interface Transaction {
  sender: string;
  receiver: string;
  amount: number;
  transaction_date: string;
  transaction_type: string;
  flagged: boolean;
  flag_reason: string | null;
}

interface LayeringData {
  total_transaction_volume: number;
  flagged_volume: number;
  flagged_percentage: number;
  layering_indicators: string[];
  transaction_count: number;
  transactions: Transaction[];
}

interface CaseWorkspaceProps {
  lang: Lang;
  caseId: string;
}

interface Victim {
  name: string;
  age: number;
  gender: string;
  occupation: string;
  statement: string;
  injury_type: string;
  location: string;
  date_reported: string;
}

const VICTIMS_BY_CASE: Record<string, Victim[]> = {
  KS1207: [
    {
      name: 'Priya Sharma', age: 34, gender: 'Female', occupation: 'Bank Officer',
      statement: 'Reported unauthorized transfers totaling ₹4.2 lakh from her account over 3 weeks.',
      injury_type: 'Financial loss', location: 'Whitefield', date_reported: '10 Nov 2023',
    },
    {
      name: 'Ananya Reddy', age: 28, gender: 'Female', occupation: 'Software Engineer',
      statement: 'Received phishing call impersonating bank official, lost ₹80,000.',
      injury_type: 'Financial loss', location: 'Koramangala', date_reported: '15 Nov 2023',
    },
  ],
  KS1189: [
    {
      name: 'Ramesh Gowda', age: 52, gender: 'Male', occupation: 'Shop Owner',
      statement: 'Witnessed drug handoff near his shop, provided description matching S. Khan.',
      injury_type: 'None (witness)', location: 'Electronic City', date_reported: '02 Jun 2024',
    },
  ],
  KS0934: [
    {
      name: 'Suresh Kumar', age: 45, gender: 'Male', occupation: 'Auto Driver',
      statement: 'Filed complaint after shell company transaction traced to his registered vehicle.',
      injury_type: 'Identity misuse', location: 'Indiranagar', date_reported: '20 Jan 2023',
    },
  ],
};

const INJURY_COLOR: Record<string, string> = {
  'Financial loss': '#F5A623',
  'Identity misuse': '#8B6FD4',
  'None (witness)': '#4D9EF5',
};

export function CaseWorkspace({ lang: _lang, caseId }: CaseWorkspaceProps) {
  const [similarCases, setSimilarCases] = useState<SimilarCase[]>([]);
  const [layering, setLayering] = useState<LayeringData | null>(null);

  useEffect(() => {
    setSimilarCases([]);
    setLayering(null);
    fetch(`${API_BASE}/api/cases/${encodeURIComponent(caseId)}/similar`)
      .then(r => r.json())
      .then(d => setSimilarCases(d.similar_cases ?? []))
      .catch(() => null);
    fetch(`${API_BASE}/api/financial/layering/${encodeURIComponent(caseId)}`)
      .then(r => r.json())
      .then(d => d.transaction_count > 0 ? setLayering(d) : null)
      .catch(() => null);
  }, [caseId]);

  const isKS1207 = caseId === 'KS1207';
  const victims = VICTIMS_BY_CASE[caseId] ?? [];

  const evidenceItems = [
    { type: 'VISUAL', desc: 'CCTV Footage — Warehouse 17, 02:14 AM', status: 'Collected' },
    { type: 'PHYSICAL', desc: 'Vehicle KA01AB1234 movement records', status: 'Collected' },
    { type: 'DIGITAL', desc: 'Phone records — Airtel subpoena', status: 'Collected' },
    { type: 'FINANCIAL', desc: 'Bank transfer records — FinCEN alert', status: 'Collected' },
    { type: 'TESTIMONY', desc: 'Protected witness W-07 statement', status: 'Collected' },
  ];

  const officers = [
    { name: 'Inspector D. Krishnamurthy', rank: 'Inspector', contact: 'Ext. 2241' },
    { name: 'SIT Team Alpha', rank: 'Special Team', contact: 'Ext. 2410' },
    { name: 'Cybercrime Cell', rank: 'Technical Unit', contact: 'Ext. 3302' },
  ];

  const timeline = [
    { label: 'Complaint Filed', date: '08 Aug 2023', color: '#4D9EF5' },
    { label: 'Evidence Collected', date: '09 Aug 2023', color: '#8B6FD4' },
    { label: 'Suspect Identified', date: '15 Sep 2023', color: '#F5A623' },
    { label: 'Arrest (S. Khan)', date: '18 Nov 2023', color: '#F04E4E' },
    { label: 'Court Filing', date: '05 Jan 2024', color: '#2ECC71' },
  ];

  return (
    <div className="left-panel-scroll" style={{ flex: 1, overflowY: 'auto', background: 'var(--bg-base, #080C14)', padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 10 }}>
      {/* Case Summary */}
      <div style={{ background: 'var(--bg-raised, #131920)', border: '1px solid var(--border-subtle, #1E2D3D)', borderRadius: 8, padding: '14px 16px' }}>
        <div style={{ fontSize: 11, fontFamily: "'JetBrains Mono', monospace", color: '#94A3B8', fontWeight: 600, letterSpacing: '0.12em', marginBottom: 10 }}>CASE SUMMARY</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 16px' }}>
          {[
            { label: 'Case ID', value: caseId, mono: true, color: '#4D9EF5' },
            { label: 'Status', value: 'ACTIVE', mono: true, color: '#F04E4E' },
            { label: 'FIR Date', value: '08 Aug 2023', mono: true },
            { label: 'Assigned Officer', value: 'Inspector D. Krishnamurthy' },
            { label: 'Court Status', value: 'Pending hearing — Jan 2025' },
            { label: 'Charge', value: isKS1207 ? 'Money Laundering (PoCA)' : 'Drug Trafficking' },
          ].map((f, i) => (
            <div key={i}>
              <div style={{ fontSize: 9, fontFamily: "'JetBrains Mono', monospace", color: '#64748B', fontWeight: 600, letterSpacing: '0.08em' }}>{f.label}</div>
              <div style={{ fontSize: 13, color: f.color ?? '#E8EDF2', fontFamily: f.mono ? 'var(--font-mono)' : 'inherit', fontVariantNumeric: f.mono ? 'tabular-nums' as const : undefined, marginTop: 2 }}>{f.value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Victims */}
      {victims.length > 0 && (
        <div style={{ background: 'var(--bg-raised, #131920)', border: '1px solid rgba(245,166,35,0.3)', borderRadius: 8, padding: '14px 16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <div style={{ fontSize: 11, fontFamily: "'JetBrains Mono', monospace", color: '#F5A623', fontWeight: 600, letterSpacing: '0.12em' }}>
              VICTIMS / WITNESSES
            </div>
            <span style={{ fontSize: 10, fontFamily: "'JetBrains Mono', monospace", background: 'rgba(245,166,35,0.12)', border: '1px solid rgba(245,166,35,0.3)', color: '#F5A623', borderRadius: 4, padding: '1px 6px' }}>
              {victims.length}
            </span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {victims.map((v, i) => (
              <div key={i} style={{ background: 'var(--bg-surface, #0D1117)', border: '1px solid var(--border-subtle, #1E2D3D)', borderRadius: 6, padding: '10px 12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                  <div>
                    <span style={{ fontSize: 13, fontWeight: 600, color: '#E8EDF2' }}>{v.name}</span>
                    <span style={{ fontSize: 11, color: '#64748B', marginLeft: 10 }}>{v.age} · {v.gender} · {v.occupation}</span>
                  </div>
                  <span style={{
                    fontSize: 9, fontFamily: "'JetBrains Mono', monospace", fontWeight: 600,
                    color: INJURY_COLOR[v.injury_type] ?? '#94A3B8',
                    background: `${INJURY_COLOR[v.injury_type] ?? '#94A3B8'}18`,
                    border: `1px solid ${INJURY_COLOR[v.injury_type] ?? '#94A3B8'}44`,
                    borderRadius: 4, padding: '2px 7px', whiteSpace: 'nowrap',
                  }}>
                    {v.injury_type.toUpperCase()}
                  </span>
                </div>
                <div style={{ fontSize: 12, color: '#94A3B8', lineHeight: 1.6, marginBottom: 4 }}>"{v.statement}"</div>
                <div style={{ fontSize: 10, fontFamily: "'JetBrains Mono', monospace", color: '#4A5C70' }}>
                  {v.location} · {v.date_reported}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Evidence Inventory */}
      <div style={{ background: 'var(--bg-raised, #131920)', border: '1px solid var(--border-subtle, #1E2D3D)', borderRadius: 8, padding: '14px 16px' }}>
        <div style={{ fontSize: 11, fontFamily: "'JetBrains Mono', monospace", color: '#94A3B8', fontWeight: 600, letterSpacing: '0.12em', marginBottom: 10 }}>EVIDENCE INVENTORY</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {evidenceItems.map((ev, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 8px', background: 'var(--bg-surface, #0D1117)', borderRadius: 4 }}>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <span style={{ fontSize: 9, fontFamily: "'JetBrains Mono', monospace", color: '#8B6FD4', fontWeight: 600, letterSpacing: '0.08em' }}>{ev.type}</span>
                <span style={{ fontSize: 12, color: '#94A3B8' }}>{ev.desc}</span>
              </div>
              <span style={{ fontSize: 11, fontFamily: "'JetBrains Mono', monospace", color: '#2ECC71' }}>{ev.status}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Financial Trail */}
      {layering && (() => {
        const volLakh = (layering.total_transaction_volume / 100_000).toFixed(1);
        const flaggedLakh = (layering.flagged_volume / 100_000).toFixed(1);
        const txs = layering.transactions;
        return (
          <div style={{ background: 'var(--bg-raised, #131920)', border: '1px solid rgba(240,78,78,0.3)', borderRadius: 8, padding: '14px 16px' }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ fontSize: 11, fontFamily: "'JetBrains Mono', monospace", color: '#F04E4E', fontWeight: 600, letterSpacing: '0.12em' }}>
                  FINANCIAL TRAIL
                </div>
                <span style={{ fontSize: 9, fontFamily: "'JetBrains Mono', monospace", color: '#64748B' }}>· networkx directed graph · money-laundering layering detection</span>
              </div>
              <span style={{ fontSize: 12, fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, color: '#F04E4E' }}>
                ₹{flaggedLakh}L / ₹{volLakh}L flagged ({layering.flagged_percentage}%)
              </span>
            </div>

            {/* Summary stats */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
              {[
                { label: 'TOTAL VOLUME', value: `₹${volLakh}L`, color: '#E8EDF2' },
                { label: 'FLAGGED', value: `₹${flaggedLakh}L`, color: '#F04E4E' },
                { label: 'TRANSACTIONS', value: String(layering.transaction_count), color: '#F5A623' },
                { label: 'SUSPICIOUS', value: `${layering.flagged_percentage}%`, color: layering.flagged_percentage > 80 ? '#F04E4E' : '#F5A623' },
              ].map((s, i) => (
                <div key={i} style={{ flex: 1, background: 'var(--bg-surface, #0D1117)', border: '1px solid #1E2D3D', borderRadius: 6, padding: '8px 10px' }}>
                  <div style={{ fontSize: 8, fontFamily: "'JetBrains Mono', monospace", color: '#64748B', fontWeight: 600, letterSpacing: '0.08em', marginBottom: 3 }}>{s.label}</div>
                  <div style={{ fontSize: 14, fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, color: s.color }}>{s.value}</div>
                </div>
              ))}
            </div>

            {/* Layering indicators */}
            {layering.layering_indicators.length > 0 && (
              <div style={{ background: 'rgba(240,78,78,0.06)', border: '1px solid rgba(240,78,78,0.2)', borderRadius: 6, padding: '8px 12px', marginBottom: 12 }}>
                <div style={{ fontSize: 9, fontFamily: "'JetBrains Mono', monospace", color: '#F04E4E', fontWeight: 600, letterSpacing: '0.08em', marginBottom: 6 }}>
                  LAYERING INDICATORS ({layering.layering_indicators.length} DETECTED)
                </div>
                {layering.layering_indicators.map((ind, i) => (
                  <div key={i} style={{ fontSize: 11, color: '#FCA5A5', marginBottom: 3, display: 'flex', gap: 6 }}>
                    <span style={{ color: '#F04E4E', flexShrink: 0 }}>▸</span>
                    <span>{ind}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Transaction chain */}
            {txs.length > 0 && (
              <div>
                <div style={{ fontSize: 9, fontFamily: "'JetBrains Mono', monospace", color: '#64748B', fontWeight: 600, letterSpacing: '0.08em', marginBottom: 8 }}>
                  TRANSACTION CHAIN
                </div>
                <div style={{ overflowX: 'auto', paddingBottom: 4 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 0, minWidth: 'max-content' }}>
                    {txs.map((tx, i) => {
                      const flagColor = tx.flagged ? '#F04E4E' : '#2ECC71';
                      const amtLakh = (tx.amount / 100_000).toFixed(1);
                      return (
                        <div key={i} style={{ display: 'flex', alignItems: 'center' }}>
                          {/* Sender node (only for first) */}
                          {i === 0 && (
                            <div style={{
                              background: 'rgba(245,166,35,0.12)', border: '1px solid rgba(245,166,35,0.4)',
                              borderRadius: 6, padding: '5px 10px', fontSize: 11, fontWeight: 600,
                              color: '#F5A623', whiteSpace: 'nowrap',
                            }}>{tx.sender}</div>
                          )}
                          {/* Arrow with amount */}
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '0 6px' }}>
                            <span style={{ fontSize: 10, fontFamily: "'JetBrains Mono', monospace", color: flagColor, fontWeight: 600 }}>₹{amtLakh}L</span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <div style={{ width: 28, height: 1.5, background: flagColor }} />
                              <span style={{ fontSize: 10, color: flagColor }}>▶</span>
                            </div>
                            <span style={{ fontSize: 9, fontFamily: "'JetBrains Mono', monospace", color: '#4A5C70' }}>{tx.transaction_date}</span>
                          </div>
                          {/* Receiver node */}
                          <div style={{
                            background: tx.flagged ? 'rgba(240,78,78,0.12)' : 'rgba(46,204,113,0.08)',
                            border: `1px solid ${flagColor}44`,
                            borderRadius: 6, padding: '5px 10px', fontSize: 11, fontWeight: 600,
                            color: tx.flagged ? '#FCA5A5' : '#86EFAC', whiteSpace: 'nowrap',
                            position: 'relative',
                          }}>
                            {tx.receiver}
                            {tx.flagged && (
                              <span style={{ position: 'absolute', top: -6, right: -4, fontSize: 9, color: '#F04E4E', fontWeight: 800 }}>⚠</span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
                <div style={{ fontSize: 9, fontFamily: "'JetBrains Mono', monospace", color: '#4A5C70', marginTop: 6 }}>
                  ▶ red = flagged · green = unflagged · ⚠ = FinCEN/SIT flag
                </div>
              </div>
            )}
          </div>
        );
      })()}

      {/* Officers */}
      <div style={{ background: 'var(--bg-raised, #131920)', border: '1px solid var(--border-subtle, #1E2D3D)', borderRadius: 8, padding: '14px 16px' }}>
        <div style={{ fontSize: 11, fontFamily: "'JetBrains Mono', monospace", color: '#94A3B8', fontWeight: 600, letterSpacing: '0.12em', marginBottom: 10 }}>ASSIGNED OFFICERS</div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {officers.map((o, i) => (
            <div key={i} style={{ background: 'var(--bg-surface, #0D1117)', border: '1px solid var(--border-subtle, #1E2D3D)', borderRadius: 6, padding: '10px 12px', flex: 1, minWidth: 150 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#E8EDF2', marginBottom: 3 }}>{o.name}</div>
              <div style={{ fontSize: 11, color: '#64748B', marginBottom: 2 }}>{o.rank}</div>
              <div style={{ fontSize: 11, fontFamily: "'JetBrains Mono', monospace", color: '#4D9EF5' }}>{o.contact}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Timeline */}
      <div style={{ background: 'var(--bg-raised, #131920)', border: '1px solid var(--border-subtle, #1E2D3D)', borderRadius: 8, padding: '14px 16px' }}>
        <div style={{ fontSize: 11, fontFamily: "'JetBrains Mono', monospace", color: '#94A3B8', fontWeight: 600, letterSpacing: '0.12em', marginBottom: 14 }}>INVESTIGATION TIMELINE</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 0, overflowX: 'auto' }}>
          {timeline.map((ev, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', flex: 1, minWidth: 100 }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, flex: 1 }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: ev.color, boxShadow: `0 0 8px ${ev.color}66` }} />
                <div style={{ fontSize: 11, fontWeight: 600, color: '#E8EDF2', textAlign: 'center' }}>{ev.label}</div>
                <div style={{ fontSize: 10, fontFamily: "'JetBrains Mono', monospace", color: '#64748B', textAlign: 'center' }}>{ev.date}</div>
              </div>
              {i < timeline.length - 1 && (
                <div style={{ height: 1, flex: 1, background: '#1E2D3D', minWidth: 20, marginBottom: 24 }} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Similar Cases */}
      {similarCases.length > 0 && (
        <div style={{ background: 'var(--bg-raised, #131920)', border: '1px solid rgba(139,111,212,0.3)', borderRadius: 8, padding: '14px 16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <div style={{ fontSize: 11, fontFamily: "'JetBrains Mono', monospace", color: '#8B6FD4', fontWeight: 600, letterSpacing: '0.12em' }}>
              SIMILAR CASES
            </div>
            <span style={{ fontSize: 9, fontFamily: "'JetBrains Mono', monospace", color: '#64748B' }}>· sentence-embedding similarity · all-MiniLM-L6-v2</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {similarCases.map((sc, i) => {
              const simPct = Math.round(sc.similarity_score * 100);
              const simColor = simPct >= 80 ? '#8B6FD4' : simPct >= 60 ? '#4D9EF5' : '#64748B';
              return (
                <div key={i} style={{ background: 'var(--bg-surface, #0D1117)', border: '1px solid var(--border-subtle, #1E2D3D)', borderRadius: 6, padding: '8px 12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                    <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                      <span style={{ fontSize: 12, fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, color: '#4D9EF5' }}>{sc.case_id}</span>
                      <span style={{ fontSize: 11, color: '#94A3B8' }}>{sc.crime}</span>
                      <span style={{ fontSize: 10, fontFamily: "'JetBrains Mono', monospace", color: '#64748B' }}>{sc.status}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <div style={{ width: 48, height: 3, background: 'rgba(255,255,255,0.06)', borderRadius: 2 }}>
                        <div style={{ width: `${simPct}%`, height: '100%', background: simColor, borderRadius: 2 }} />
                      </div>
                      <span style={{ fontSize: 11, fontFamily: "'JetBrains Mono', monospace", color: simColor, fontWeight: 700 }}>{sc.similarity_score}</span>
                    </div>
                  </div>
                  <div style={{ fontSize: 11, color: '#64748B', lineHeight: 1.5 }}>{sc.summary}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Case Notes */}
      <div style={{ background: 'var(--bg-raised, #131920)', border: '1px solid var(--border-subtle, #1E2D3D)', borderRadius: 8, padding: '14px 16px', marginBottom: 12 }}>
        <div style={{ fontSize: 11, fontFamily: "'JetBrains Mono', monospace", color: '#94A3B8', fontWeight: 600, letterSpacing: '0.12em', marginBottom: 8 }}>CASE NOTES — AI SUMMARY</div>
        <div style={{
          background: 'var(--bg-surface, #0D1117)', borderRadius: 6, padding: '10px 12px',
          fontSize: 13, color: '#93C5FD', lineHeight: 1.7,
        }}>
          Case {caseId} involves a complex financial network operating across Whitefield, Indiranagar, and Electronic City. Suspect R. Mehta (at large) is the primary broker, with S. Khan (in custody) serving as logistics coordinator. Evidence chain establishes 91% confidence in money laundering activity totaling approximately ₹4.2 lakh. Cybercrime Cell involvement recommended for digital money trail analysis.
        </div>
      </div>
    </div>
  );
}

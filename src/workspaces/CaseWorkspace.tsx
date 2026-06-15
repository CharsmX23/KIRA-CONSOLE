import { Lang } from '../i18n/translations';

interface CaseWorkspaceProps {
  lang: Lang;
  caseId: string;
}

export function CaseWorkspace({ lang, caseId }: CaseWorkspaceProps) {
  const isKS1207 = caseId === 'KS1207';

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
    { label: 'Complaint Filed', date: '08 Aug 2023', color: '#60A5FA' },
    { label: 'Evidence Collected', date: '09 Aug 2023', color: '#8B5CF6' },
    { label: 'Suspect Identified', date: '15 Sep 2023', color: '#F59E0B' },
    { label: 'Arrest (S. Khan)', date: '18 Nov 2023', color: '#EF4444' },
    { label: 'Court Filing', date: '05 Jan 2024', color: '#22C55E' },
  ];

  return (
    <div className="left-panel-scroll" style={{ flex: 1, overflowY: 'auto', background: '#060A12', padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 10 }}>
      {/* Case Summary */}
      <div style={{ background: '#0D1828', border: '1px solid #162035', borderRadius: 8, padding: '14px 16px' }}>
        <div style={{ fontSize: 11, fontFamily: 'monospace', color: '#94A3B8', letterSpacing: '0.1em', marginBottom: 10 }}>CASE SUMMARY</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 16px' }}>
          {[
            { label: 'Case ID', value: caseId, mono: true, color: '#60A5FA' },
            { label: 'Status', value: 'ACTIVE', mono: true, color: '#EF4444' },
            { label: 'FIR Date', value: '08 Aug 2023', mono: true },
            { label: 'Assigned Officer', value: 'Inspector D. Krishnamurthy' },
            { label: 'Court Status', value: 'Pending hearing — Jan 2025' },
            { label: 'Charge', value: isKS1207 ? 'Money Laundering (PoCA)' : 'Drug Trafficking' },
          ].map((f, i) => (
            <div key={i}>
              <div style={{ fontSize: 9, fontFamily: 'monospace', color: '#64748B', letterSpacing: '0.08em' }}>{f.label}</div>
              <div style={{ fontSize: 13, color: f.color ?? '#E2E8F0', fontFamily: f.mono ? 'monospace' : 'inherit', marginTop: 2 }}>{f.value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Evidence Inventory */}
      <div style={{ background: '#0D1828', border: '1px solid #162035', borderRadius: 8, padding: '14px 16px' }}>
        <div style={{ fontSize: 11, fontFamily: 'monospace', color: '#94A3B8', letterSpacing: '0.1em', marginBottom: 10 }}>EVIDENCE INVENTORY</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {evidenceItems.map((ev, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 8px', background: '#0A1120', borderRadius: 4 }}>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <span style={{ fontSize: 9, fontFamily: 'monospace', color: '#8B5CF6', letterSpacing: '0.08em' }}>{ev.type}</span>
                <span style={{ fontSize: 12, color: '#94A3B8' }}>{ev.desc}</span>
              </div>
              <span style={{ fontSize: 11, fontFamily: 'monospace', color: '#22C55E' }}>{ev.status}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Officers */}
      <div style={{ background: '#0D1828', border: '1px solid #162035', borderRadius: 8, padding: '14px 16px' }}>
        <div style={{ fontSize: 11, fontFamily: 'monospace', color: '#94A3B8', letterSpacing: '0.1em', marginBottom: 10 }}>ASSIGNED OFFICERS</div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {officers.map((o, i) => (
            <div key={i} style={{ background: '#0A1120', border: '1px solid #162035', borderRadius: 6, padding: '10px 12px', flex: 1, minWidth: 150 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#E2E8F0', marginBottom: 3 }}>{o.name}</div>
              <div style={{ fontSize: 11, color: '#64748B', marginBottom: 2 }}>{o.rank}</div>
              <div style={{ fontSize: 11, fontFamily: 'monospace', color: '#60A5FA' }}>{o.contact}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Timeline */}
      <div style={{ background: '#0D1828', border: '1px solid #162035', borderRadius: 8, padding: '14px 16px' }}>
        <div style={{ fontSize: 11, fontFamily: 'monospace', color: '#94A3B8', letterSpacing: '0.1em', marginBottom: 14 }}>INVESTIGATION TIMELINE</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 0, overflowX: 'auto' }}>
          {timeline.map((ev, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', flex: 1, minWidth: 100 }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, flex: 1 }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: ev.color, boxShadow: `0 0 8px ${ev.color}66` }} />
                <div style={{ fontSize: 11, fontWeight: 600, color: '#E2E8F0', textAlign: 'center' }}>{ev.label}</div>
                <div style={{ fontSize: 10, fontFamily: 'monospace', color: '#64748B', textAlign: 'center' }}>{ev.date}</div>
              </div>
              {i < timeline.length - 1 && (
                <div style={{ height: 1, flex: 1, background: '#162035', minWidth: 20, marginBottom: 24 }} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Case Notes */}
      <div style={{ background: '#0D1828', border: '1px solid #162035', borderRadius: 8, padding: '14px 16px', marginBottom: 12 }}>
        <div style={{ fontSize: 11, fontFamily: 'monospace', color: '#94A3B8', letterSpacing: '0.1em', marginBottom: 8 }}>CASE NOTES — AI SUMMARY</div>
        <div style={{
          background: '#0A1120', borderRadius: 6, padding: '10px 12px',
          fontSize: 13, color: '#93C5FD', lineHeight: 1.7,
        }}>
          Case {caseId} involves a complex financial network operating across Whitefield, Indiranagar, and Electronic City. Suspect R. Mehta (at large) is the primary broker, with S. Khan (in custody) serving as logistics coordinator. Evidence chain establishes 91% confidence in money laundering activity totaling approximately ₹4.2 lakh. Cybercrime Cell involvement recommended for digital money trail analysis.
        </div>
      </div>
    </div>
  );
}
